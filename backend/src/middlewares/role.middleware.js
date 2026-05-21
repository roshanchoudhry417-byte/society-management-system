const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization middleware.
 * Usage: authorize('admin', 'resident')
 * Must be used AFTER authenticate middleware.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required before authorization.');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

module.exports = authorize;
