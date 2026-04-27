const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends a state change notification email to a user.
 * This is an async function because sending an email is a network operation.
 *
 * @param {object} details - The details for the email.
 * @param {string} details.userEmail - The recipient's email address.
 * @param {string} details.checkName - The name of the check that changed state.
 * @param {string} details.checkUrl - The URL of the check.
 * @param {string} details.newStatus - The new status ('up' or 'down').
 */
const sendStateChangeEmail = async ({
  userEmail,
  checkName,
  checkUrl,
  newStatus,
}) => {
  const isUp = newStatus === "up";
  const subject = `Monitior Status Change: ${checkName} is now ${newStatus.toUpperCase()}`;
  const htmlBody = `
    <h1>Uptime Monitor Alert</h1>
    <p>This is an alert to inform you that the status of your monitored URL has changed.</p>
    <ul>
      <li><strong>Monitor Name:</strong> ${checkName}</li>
      <li><strong>URL:</strong> ${checkUrl}</li>
      <li><strong>New Status:</strong> <strong style="color: ${
        isUp ? "green" : "red"
      };">${newStatus.toUpperCase()}</strong></li>
      <li><strong>Time of Change:</strong> ${new Date().toUTCString()}</li>
    </ul>
    ${
      isUp
        ? "<p>Your service has recovered and is now back online. No further action is required.</p>"
        : "<p>Your service is currently down. Please investigate the issue.</p>"
    }
  `;
  const msg = {
    to: userEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: subject,
    html: htmlBody,
  };
  try {
    // Use the sgMail.send() method to send the email.
    // We await this promise to ensure the email is sent (or fails) before we proceed.
    await sgMail.send(msg);
    console.log(
      `[NotificationService] State change email successfully sent to ${userEmail}`
    );
  } catch (error) {
    // If the SendGrid API returns an error, we log it for debugging.
    // This could happen due to an invalid API key, an unverified sender email, etc.
    console.error(
      `[NotificationService] Error sending email to ${userEmail}:`,
      error
    );

    // In a production environment, you might want to re-throw the error
    // or send an alert to an admin about the email failure.
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

// Export the function so it can be imported and used in other parts of our worker service.
module.exports = {
  sendStateChangeEmail,
};
