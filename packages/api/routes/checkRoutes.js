// Import the Express library to create our router
const express = require('express');

// Import the controller functions that contain our business logic
const {
  getCheckById,
  getChecks,
  createCheck,
  updateCheck,
  deleteCheck,
  getReportsForCheck,
} = require('../controllers/checkController');

const {protect} = require('../middleware/authMiddleware');
// Create a new router instance. This object will handle all routing for /api/checks
const router = express.Router();

// --- Define Routes ---
router.use(protect);
// Routes that operate on the collection of all checks for a user (/api/checks)
router
  .route('/')
  // When a GET request is made to '/', it will be handled by the getChecks function
  .get(getChecks)
  // When a POST request is made to '/', it will be handled by the createCheck function
  .post(createCheck);

// Routes that operate on a single check by its ID (/api/checks/:id)
router
  .route('/:id')
  // When a GET request is made to '/:id', it will be handled by the getCheckById function
  .get(getCheckById)
  // When a PUT request is made to '/:id', it will be handled by the updateCheck function
  .put(updateCheck)
  // When a DELETE request is made to '/:id', it will be handled by the deleteCheck function
  .delete(deleteCheck);


router.route('/:id/reports').get(protect, getReportsForCheck);
  
// Export the router so we can mount it in our main application file (index.js)
module.exports = router;