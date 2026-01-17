/**
 * Standardized API response helpers
 */

const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const created = (res, data, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

const noContent = (res) => {
  return res.status(204).send();
};

const paginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};

const error = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', errors = null) => {
  const response = {
    success: false,
    message,
    code,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  success,
  created,
  noContent,
  paginated,
  error,
};
