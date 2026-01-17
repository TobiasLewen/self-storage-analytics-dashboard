const express = require('express');
const authRoutes = require('./auth');
const unitRoutes = require('./units');
const customerRoutes = require('./customers');
const metricsRoutes = require('./metrics');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/units', unitRoutes);
router.use('/customers', customerRoutes);
router.use('/metrics', metricsRoutes);

module.exports = router;
