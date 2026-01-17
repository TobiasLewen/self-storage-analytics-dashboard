const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const metricsController = require('../controllers/metricsController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get dashboard overview
router.get('/dashboard', asyncHandler(metricsController.getDashboard));

// Get revenue analytics
router.get('/revenue', asyncHandler(metricsController.getRevenueAnalytics));

// Get occupancy analytics
router.get('/occupancy', asyncHandler(metricsController.getOccupancyAnalytics));

// Get all metrics with optional date range
router.get('/', asyncHandler(metricsController.getAll));

// Get metric by month
router.get('/:month', asyncHandler(metricsController.getByMonth));

// Calculate and store current month's metrics (admin and manager only)
router.post(
  '/calculate',
  authorizeRoles('admin', 'manager'),
  asyncHandler(metricsController.calculateCurrentMetrics)
);

module.exports = router;
