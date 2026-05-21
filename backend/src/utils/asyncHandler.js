/**
 * Wraps async route handlers to catch errors
 * and forward them to Express error middleware.
 * Eliminates try-catch boilerplate in controllers.
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
