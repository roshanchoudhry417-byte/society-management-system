const ApiError = require('../utils/ApiError');
const config = require('../config/env');

/**
 * Global error handler middleware.
 * Catches all errors thrown/passed via next(error).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new ApiError(400, `Duplicate value for '${field}'. This value already exists.`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(400, 'Validation Error', messages);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token.');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token has expired.');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ApiError(400, 'File size exceeds 5MB limit.');
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    error = new ApiError(400, 'Too many files. Maximum 5 allowed.');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(config.nodeEnv === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
