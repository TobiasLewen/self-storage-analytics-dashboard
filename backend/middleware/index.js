const { authenticateToken, optionalAuth, authorizeRoles, generateToken, generateRefreshToken } = require('./auth');
const { errorHandler, notFoundHandler, asyncHandler } = require('./errorHandler');
const { validate } = require('./validate');

module.exports = {
  // Authentication
  authenticateToken,
  optionalAuth,
  authorizeRoles,
  generateToken,
  generateRefreshToken,

  // Error handling
  errorHandler,
  notFoundHandler,
  asyncHandler,

  // Validation
  validate,
};
