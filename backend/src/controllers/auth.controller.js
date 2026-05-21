const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/env');

/**
 * Generate JWT token for a user.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, flatNumber, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists.');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'resident',
    flatNumber,
    phone,
  });

  // Generate token
  const token = generateToken(user._id);

  new ApiResponse(201, 'User registered successfully.', {
    user,
    token,
  }).send(res);
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new ApiError(401, 'Your account has been deactivated. Contact admin.');
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Generate token
  const token = generateToken(user._id);

  new ApiResponse(200, 'Login successful.', {
    user,
    token,
  }).send(res);
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  new ApiResponse(200, 'User profile fetched.', { user }).send(res);
});

/**
 * @desc    Update password
 * @route   PUT /api/v1/auth/update-password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  const token = generateToken(user._id);

  new ApiResponse(200, 'Password updated successfully.', { token }).send(res);
});

const addVehicle = asyncHandler(async (req, res) => {
  const { type, registrationNumber, makeAndModel, color } = req.body;
  
  const user = await User.findById(req.user._id);
  user.vehicles.push({ type, registrationNumber, makeAndModel, color });
  await user.save();
  
  new ApiResponse(200, 'Vehicle added successfully.', { user }).send(res);
});

module.exports = { register, login, getMe, updatePassword, addVehicle };
