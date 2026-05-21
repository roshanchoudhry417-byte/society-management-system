const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/env');

/**
 * Middleware to authenticate requests via JWT Bearer token.
 * Attaches the user object to req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. No token provided.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Find user and attach to request
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'Token is valid but user no longer exists.');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Your account has been deactivated. Contact admin.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid or expired token.');
  }
});

module.exports = authenticate;
