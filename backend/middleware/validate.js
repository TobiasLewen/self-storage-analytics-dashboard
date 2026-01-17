const { ValidationError } = require('../utils/errors');

/**
 * Simple validation middleware without external dependencies
 * Uses custom validators defined in route files
 */

const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate body
    if (schema.body) {
      const bodyErrors = validateObject(req.body, schema.body, 'body');
      errors.push(...bodyErrors);
    }

    // Validate params
    if (schema.params) {
      const paramErrors = validateObject(req.params, schema.params, 'params');
      errors.push(...paramErrors);
    }

    // Validate query
    if (schema.query) {
      const queryErrors = validateObject(req.query, schema.query, 'query');
      errors.push(...queryErrors);
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    next();
  };
};

const validateObject = (data, schema, location) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        location,
        message: rules.message || `${field} is required`,
      });
      continue;
    }

    // Skip further validation if value is not present and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type checks
    if (rules.type) {
      const isValid = checkType(value, rules.type);
      if (!isValid) {
        errors.push({
          field,
          location,
          message: `${field} must be a ${rules.type}`,
        });
        continue;
      }
    }

    // Min length for strings
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      errors.push({
        field,
        location,
        message: `${field} must be at least ${rules.minLength} characters`,
      });
    }

    // Max length for strings
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push({
        field,
        location,
        message: `${field} must be at most ${rules.maxLength} characters`,
      });
    }

    // Min value for numbers
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
      errors.push({
        field,
        location,
        message: `${field} must be at least ${rules.min}`,
      });
    }

    // Max value for numbers
    if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
      errors.push({
        field,
        location,
        message: `${field} must be at most ${rules.max}`,
      });
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push({
        field,
        location,
        message: `${field} must be one of: ${rules.enum.join(', ')}`,
      });
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors.push({
        field,
        location,
        message: rules.patternMessage || `${field} has an invalid format`,
      });
    }

    // Email validation
    if (rules.email && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push({
          field,
          location,
          message: `${field} must be a valid email address`,
        });
      }
    }

    // Custom validator
    if (rules.custom) {
      const result = rules.custom(value, data);
      if (result !== true) {
        errors.push({
          field,
          location,
          message: result || `${field} is invalid`,
        });
      }
    }
  }

  return errors;
};

const checkType = (value, type) => {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'date':
      return !isNaN(Date.parse(value));
    default:
      return true;
  }
};

module.exports = { validate };
