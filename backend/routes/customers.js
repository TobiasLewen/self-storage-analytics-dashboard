const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const customerController = require('../controllers/customerController');

const router = express.Router();

// Validation schemas
const createCustomerSchema = {
  body: {
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 255,
    },
    email: {
      type: 'string',
      email: true,
    },
    phone: {
      type: 'string',
      maxLength: 50,
    },
    type: {
      required: true,
      type: 'string',
      enum: ['private', 'business'],
    },
    companyName: {
      type: 'string',
      maxLength: 255,
    },
    address: {
      type: 'string',
    },
    startDate: {
      type: 'date',
    },
    notes: {
      type: 'string',
    },
  },
};

const updateCustomerSchema = {
  body: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 255,
    },
    email: {
      type: 'string',
      email: true,
    },
    phone: {
      type: 'string',
      maxLength: 50,
    },
    type: {
      type: 'string',
      enum: ['private', 'business'],
    },
    companyName: {
      type: 'string',
      maxLength: 255,
    },
    address: {
      type: 'string',
    },
    startDate: {
      type: 'date',
    },
    endDate: {
      type: 'date',
    },
    notes: {
      type: 'string',
    },
  },
};

// All routes require authentication
router.use(authenticateToken);

// Get customer statistics (must be before /:id route)
router.get('/stats', asyncHandler(customerController.getStats));

// Get all customers with pagination and filtering
router.get('/', asyncHandler(customerController.getAll));

// Get customer by ID
router.get('/:id', asyncHandler(customerController.getById));

// Create new customer (admin and manager only)
router.post(
  '/',
  authorizeRoles('admin', 'manager'),
  validate(createCustomerSchema),
  asyncHandler(customerController.create)
);

// Update customer (admin and manager only)
router.put(
  '/:id',
  authorizeRoles('admin', 'manager'),
  validate(updateCustomerSchema),
  asyncHandler(customerController.update)
);

// Delete customer (admin only)
router.delete(
  '/:id',
  authorizeRoles('admin'),
  asyncHandler(customerController.remove)
);

module.exports = router;
