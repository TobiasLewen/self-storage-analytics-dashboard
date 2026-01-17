const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { testConnection, syncDatabase } = require('./models');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const unitRoutes = require('./routes/units');
const customerRoutes = require('./routes/customers');
const metricsRoutes = require('./routes/metrics');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (config.env === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/metrics', metricsRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Self-Storage Analytics API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/logout': 'Logout user',
        'POST /api/auth/refresh': 'Refresh access token',
        'GET /api/auth/me': 'Get current user profile',
        'PUT /api/auth/me': 'Update current user profile',
        'PUT /api/auth/password': 'Change password',
      },
      units: {
        'GET /api/units': 'Get all units (paginated)',
        'GET /api/units/stats': 'Get unit statistics',
        'GET /api/units/:id': 'Get unit by ID',
        'POST /api/units': 'Create new unit',
        'PUT /api/units/:id': 'Update unit',
        'DELETE /api/units/:id': 'Delete unit',
        'POST /api/units/:id/rent': 'Rent unit to customer',
        'POST /api/units/:id/release': 'Release unit from customer',
      },
      customers: {
        'GET /api/customers': 'Get all customers (paginated)',
        'GET /api/customers/stats': 'Get customer statistics',
        'GET /api/customers/:id': 'Get customer by ID',
        'POST /api/customers': 'Create new customer',
        'PUT /api/customers/:id': 'Update customer',
        'DELETE /api/customers/:id': 'Delete customer',
      },
      metrics: {
        'GET /api/metrics': 'Get all metrics',
        'GET /api/metrics/dashboard': 'Get dashboard overview',
        'GET /api/metrics/revenue': 'Get revenue analytics',
        'GET /api/metrics/occupancy': 'Get occupancy analytics',
        'GET /api/metrics/:month': 'Get metric by month',
        'POST /api/metrics/calculate': 'Calculate current month metrics',
      },
    },
  });
});

// Handle 404 for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models
    await syncDatabase({ alter: config.env === 'development' });

    // Seed database in development
    if (config.env === 'development') {
      const { seedDatabase } = require('./seeders/seeder');
      await seedDatabase();
    }

    // Start server
    app.listen(config.port, () => {
      console.log(`\nServer running in ${config.env} mode on port ${config.port}`);
      console.log(`API documentation: http://localhost:${config.port}/api`);
      console.log(`Health check: http://localhost:${config.port}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
