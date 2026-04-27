// A utility to handle errors in async express-routes without a try-catch block
const asyncHandler = require("express-async-handler");
// Our User model, for interacting with the users collection in the DB
const User = require("../models/User");
// The jsonwebtoken library for creating access tokens
const jwt = require("jsonwebtoken");

/**
 * @desc    Generate a JWT for a user
 * @param   {string} id The user's MongoDB document ID
 * @returns {string} The generated JSON Web Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // The token will be valid for 30 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  // 1. Get user data from the request body
  const { name, email, password } = req.body;

  // 2. Validation: Check if all required fields are provided
  if (!name || !email || !password) {
    res.status(400); // 400 Bad Request
    throw new Error("Please provide all required fields");
  }

  // 3. Check if the user already exists in the database
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400); // 400 Bad Request
    throw new Error("User with this email already exists");
  }

  // 4. Create the new user in the database
  const user = await User.create({
    name,
    email,
    password,
  });

  // 5. If user was created successfully, send back a response
  if (user) {
    res.status(201).json({
      // 201 Created
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id), // Generate a JWT for the new user
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// ===================================================================================
// NEWLY IMPLEMENTED: Logic for the loginUser function
// ===================================================================================
/**
 * @desc    Authenticate/login a user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  // 1. Destructure the email and password from the request body.
  const { email, password } = req.body;

  // 2. Find the user in the database by the email they provided.
  // The 'email' field is indexed and unique, making this a fast operation.
  const user = await User.findOne({ email });

  // 3. Check if a user was found AND if the provided password matches the stored hash.
  // This is where our custom `matchPassword` method on the User model shines. It encapsulates
  // the `bcrypt.compare` logic, keeping our controller clean and readable.
  // The check is done in a single conditional statement to prevent timing attacks.
  if (user && (await user.matchPassword(password))) {
    // If both checks pass, the user is authenticated.
    // We send back a 200 OK status with their details and a new token.
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    // If the user is not found OR the password does not match, we send back a 401 Unauthorized status.
    // Crucially, we use a generic error message to avoid telling an attacker
    // whether they got the username or the password wrong.
    res.status(401);
    throw new Error("Invalid email or password");
  }
});
// ===================================================================================

/**
 * @desc    Get user profile
 * @route   GET /api/auth/me
 * @access  Private
 */

const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Export the controller functions so they can be used in our route definitions
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
