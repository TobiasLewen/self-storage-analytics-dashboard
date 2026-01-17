const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation schemas
const registerSchema = {
  body: {
    username: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 50,
    },
    email: {
      required: true,
      type: 'string',
      email: true,
    },
    password: {
      required: true,
      type: 'string',
      minLength: 6,
    },
    role: {
      type: 'string',
      enum: ['admin', 'manager', 'staff'],
    },
  },
};

const loginSchema = {
  body: {
    email: {
      required: true,
      type: 'string',
      email: true,
    },
    password: {
      required: true,
      type: 'string',
    },
  },
};

const updateProfileSchema = {
  body: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: 'string',
      email: true,
    },
  },
};

const changePasswordSchema = {
  body: {
    currentPassword: {
      required: true,
      type: 'string',
    },
    newPassword: {
      required: true,
      type: 'string',
      minLength: 6,
    },
  },
};

const refreshTokenSchema = {
  body: {
    refreshToken: {
      required: true,
      type: 'string',
    },
  },
};

// Public routes
router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(authController.refreshToken));

// Protected routes
router.get('/me', authenticateToken, asyncHandler(authController.getMe));
router.put('/me', authenticateToken, validate(updateProfileSchema), asyncHandler(authController.updateMe));
router.put('/password', authenticateToken, validate(changePasswordSchema), asyncHandler(authController.changePassword));
router.post('/logout', authenticateToken, asyncHandler(authController.logout));

module.exports = router;
