const asyncHandler = require('express-async-handler');

const Check = require('../models/Check');
const Report = require('../models/Report');
const { checkQueue } = require('../queues/checkQueue');

// @desc    Get all checks for the logged-in user
// @route   GET /api/checks
// @access  Private
// NOTE: In a future task, we will modify this to only return checks for the logged-in user.

const getChecks = asyncHandler(async(req , res)=>{
    const checks = await Check.find({user: req.user.id});
    res.status(200).json(checks);

});

// @desc    Get a single check by its ID
// @route   GET /api/checks/:id
// @access  Private
// NOTE: In a future task, we will add authorization to ensure the user owns this check.

const getCheckById = asyncHandler(async(req, res)=>{
    const check = await Check.findById(req.params.id);

    if(!check){
        res.status(404);
        throw new Error('Check not found');
    }
    if(check.user.toString() !== req.user.id){
      res.status(401);
      throw new Error('User not authorized to view this check');
    }
    res.status(200).json(check);
})


// @desc    Create a new check
// @route   POST /api/checks
// @access  Private
// NOTE: In a future task, we will associate this check with the logged-in user (req.user.id).

const createCheck = asyncHandler(async (req, res) => {
  // Destructure the expected fields from the request body.
  const { name, url, protocol, path, port, timeout, interval, threshold } =
    req.body;

  // Basic validation to ensure required fields are present.
  if (!name || !url || !protocol) {
    res.status(400);
    throw new Error('Please provide all required fields: name, url, protocol');
  }

  // Create the check in the database.
  const check = await Check.create({
    name,
    url,
    protocol,
    path,
    port,
    timeout,
    interval,
    threshold,
    // The 'user' field will be added in a later task.
    user: req.user.id,
  });

  if(check){
    await checkQueue.add(
      'process-check',
      {checkId: check._id.toString()},
      {
        repeat:{
          every: check.interval * 60 * 1000,
        },
        jobId: check._id.toString(),
      }
    )
    console.log(`Repeatable job created for Check Id: ${check._id}`);
  }

  res.status(201).json(check);
});


// @desc    Update an existing check
// @route   PUT /api/checks/:id
// @access  Private
// NOTE: In a future task, we will add authorization to ensure the user owns this check.
const updateCheck = asyncHandler(async (req, res) => {
  const check = await Check.findById(req.params.id);

  if (!check) {
    res.status(404);
    throw new Error('Check not found');
  }

  if (check.user.toString() !== req.user.id) {
    res.status(401); // 401 Unauthorized is the correct status for this failure.
    throw new Error('User not authorized to update this check');
  }

  // Find the check by its ID and update it with the data from the request body.
  // The { new: true } option ensures that the updated document is returned.
  const updatedCheck = await Check.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true, // This ensures that model validations (e.g., enum for protocol) are run on update.
  });

  res.status(200).json(updatedCheck);
});


// @desc    Delete a check
// @route   DELETE /api/checks/:id
// @access  Private
// NOTE: In a future task, we will add authorization to ensure the user owns this check.
const deleteCheck = asyncHandler(async (req, res) => {
  const check = await Check.findById(req.params.id);

  if (!check) {
    res.status(404);
    throw new Error('Check not found');
  }

  if (check.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized to delete this check');
  }

  
  // Mongoose 8+ `findByIdAndDelete` is the modern equivalent of `findByIdAndRemove`.
  await Check.findByIdAndDelete(req.params.id);

  res.status(200).json({ id: req.params.id, message: 'Check deleted successfully' });
});


/**
 * @desc    Get all historical reports for a specific check
 * @route   GET /api/checks/:id/reports
 * @access  Private
 */
const getReportsForCheck = async (req, res) => {
  try {
    // 1. Find the Check by its ID from the URL parameter
    const check = await Check.findById(req.params.id);

    // If no check is found, return a 404 Not Found error
    if (!check) {
      return res.status(404).json({ message: 'Check not found' });
    }

    // 2. Authorization Check: Ensure the user requesting the reports owns the check.
    // We get `req.user.id` from our `protect` middleware.
    // We must convert the check's user ID (which is an ObjectId) to a string for comparison.
    if (check.user.toString() !== req.user.id) {
      // If the IDs do not match, the user is not authorized.
      // Return a 403 Forbidden error.
      return res.status(403).json({ message: 'User not authorized to access this resource' });
    }

    // 3. Fetch all Report documents that belong to this Check.
    // We sort by the 'timestamp' in descending order to get the most recent reports first.
    const reports = await Report.find({ checkId: req.params.id }).sort({ timestamp: -1 });

    // 4. Return the found reports.
    res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};



module.exports = {
    getCheckById,
    getChecks,
    createCheck,
    updateCheck,
    deleteCheck,
    getReportsForCheck,
};