// First, load environment variables from our .env file
require("dotenv").config();

// Import the 'Worker' class from the bullmq library
const { Worker } = require("bullmq");
const axios = require("axios");

// Import our database connection function and Mongoose models
const connectDB = require("./config/db");
const Check = require("../api/models/Check");
const Report = require("../api/models/Report");
const User = require("../api/models/User");
const { sendStateChangeEmail } = require("./services/notification");

// Connect to the database on startup
connectDB();

// Define the queue name
const QUEUE_NAME = "checks";

// Define the connection options for Redis
const redisConnectionOptions = {
  connection: {
    url: process.env.REDIS_URI || "redis://127.0.0.1:6379",
  },
};

/**
 * The Processor Function
 * This function defines the work to be done for each job.
 * @param {object} job - The job object from BullMQ.
 */
const processor = async (job) => {
  const { checkId } = job.data;
  console.log(`[Worker] Starting to process job for Check ID: ${checkId}`);

  try {
    // --- MODIFIED: Use .populate() to fetch the associated User ---
    // We now chain .populate('user') to our findById query.
    // Mongoose will now fetch the Check document AND the full User document
    // that is referenced by the 'user' field, giving us access to the user's email.
    const check = await Check.findById(checkId).populate("user");

    if (!check) {
      console.warn(
        `[Worker] Check with ID ${checkId} no longer exists. Skipping job.`
      );
      // ... (logic for handling deleted checks)
      return;
    }

    // --- NEW: Prepare for State Change Detection ---
    // The status of the check as it was *before* this job ran.
    // This is the "old" status we will compare against.
    const oldStatus = check.status;
    const { name, url, protocol, path, port, timeout } = check;

    // We can now access the user's email directly, thanks to .populate()!
    // We also add a safety check in case the user object is missing for some reason.
    if (!check.user || !check.user.email) {
      console.warn(
        `[Worker] Could not find user or user email for Check ID ${checkId}. Skipping alerts.`
      );
      // We will still process the check, but we can't send an alert.
    }
    const userEmail = check.user ? check.user.email : null;
    // --- END OF NEW PREPARATION ---
    let cleanUrl = url.replace(/^https?:\/\//i, "").replace(/\/$/, "");

    const fullUrl = new URL(`${protocol.toLowerCase()}://${cleanUrl}`);
    if (port) fullUrl.port = port;
    if (path) fullUrl.pathname = path;

    const axiosConfig = {
      url: fullUrl.toString(),
      method: "get",
      timeout: timeout * 1000,
      validateStatus: (status) => status >= 100 && status < 600,
    };

    let newStatus = ""; // This will hold the "new" status from our check

    try {
      // The "happy path"
      const startTime = Date.now();
      const response = await axios(axiosConfig);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(
        `[Worker] SUCCESS: Received response for ${name}. Status: ${response.status}, Response Time: ${responseTime}ms`
      );

      await Report.create({
        checkId: check._id,
        status: "up",
        statusCode: response.status,
        responseTime: responseTime,
      });
      console.log(
        `[Worker] 'UP' Report for check '${name}' saved to database.`
      );

      newStatus = "up";
    } catch (error) {
      // The "unhappy path"
      console.error(
        `[Worker] DOWN: Network error for ${name} at ${axiosConfig.url}. Error: ${error.message}`
      );

      await Report.create({
        checkId: check._id,
        status: "down",
      });
      console.log(
        `[Worker] 'DOWN' Report for check '${name}' saved to database.`
      );

      newStatus = "down";
    }

    // --- NEW: Log statuses for verification ---
    // At this point, we have both the old status from the database and the new
    // status from the health check we just performed. We log them to verify.
    console.log(
      `[Worker] Status Check for '${name}': Old='${oldStatus}', New='${newStatus}'`
    );
     // Condition for DOWNTIME alert
    if (oldStatus === 'up' && newStatus === 'down' && userEmail) {
      console.log(`[Worker] DOWNTIME DETECTED for '${name}'. Triggering alert to ${userEmail}.`);
      
      // --- ACTION ---
      // Call the notification service, passing all required details.
      await sendStateChangeEmail({
        userEmail,
        checkName: name,
        checkUrl: fullUrl.toString(),
        newStatus, // Will be 'down'
      });
    } 
    // Condition for RECOVERY alert
    else if (oldStatus === 'down' && newStatus === 'up' && userEmail) {
      console.log(`[Worker] RECOVERY DETECTED for '${name}'. Triggering alert to ${userEmail}.`);
      
      // --- ACTION ---
      // Call the same reusable function for the recovery event.
      await sendStateChangeEmail({
        userEmail,
        checkName: name,
        checkUrl: fullUrl.toString(),
        newStatus, // Will be 'up'
      });
    }
    // In the next task, the logic to compare these statuses and send an alert will go here.

    // Update the parent Check document with the new status
    await Check.findByIdAndUpdate(checkId, {
      status: newStatus,
      lastChecked: new Date(),
    });

    console.log(
      `[Worker] Parent Check ${checkId} has been updated with status: '${newStatus}'.`
    );

    return `Check for ${name} fully processed.`;
  } catch (error) {
    console.error(
      `[Worker] An error occurred while processing Check ID ${checkId}:`,
      error
    );
    throw error;
  }
};

// ... (rest of the file: worker instantiation and event listeners)
const worker = new Worker(QUEUE_NAME, processor, redisConnectionOptions);

// Fired when a job is completed successfully.
worker.on("completed", (job, result) => {
  console.log(`[Worker] Job ${job.id} has completed with result: ${result}`);
});

// Fired when a job has failed after all attempts.
worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} has failed with error: ${err.message}`);
});

// Fired when an error occurs in the worker itself.
worker.on("error", (err) => {
  console.error(`[Worker] A worker error has occurred: ${err.message}`);
});

console.log(
  `✅ Worker is running and listening for jobs on the '${QUEUE_NAME}' queue...`
);
