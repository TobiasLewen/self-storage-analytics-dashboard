const { AppError } = require('../utils/errors');
const response = require('../utils/response');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Handle known operational errors
  if (err.isOperational) {
    return response.error(
      res,
      err.message,
      err.statusCode,
      err.code,
      err.errors || null
    );
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return response.error(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return response.error(
      res,
      `${field} already exists`,
      409,
      'CONFLICT'
    );
  }

  // Handle Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return response.error(
      res,
      'Invalid reference to related resource',
      400,
      'FOREIGN_KEY_ERROR'
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return response.error(res, 'Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return response.error(res, 'Token has expired', 401, 'TOKEN_EXPIRED');
  }

  // Handle syntax errors in JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return response.error(res, 'Invalid JSON in request body', 400, 'INVALID_JSON');
  }

  // Unknown errors - don't leak details in production
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred';

  return response.error(res, message, 500, 'INTERNAL_ERROR');
};

/**
 * Handle 404 for unmatched routes
 */
const notFoundHandler = (req, res) => {
  return response.error(
    res,
    `Cannot ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
