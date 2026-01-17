const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    url: process.env.DATABASE_URL || 'postgres://localhost:5432/self_storage_db',
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    url: process.env.TEST_DATABASE_URL || 'postgres://localhost:5432/self_storage_test',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

const currentConfig = config[env];

const sequelize = new Sequelize(currentConfig.url, {
  dialect: currentConfig.dialect,
  logging: currentConfig.logging,
  pool: currentConfig.pool,
  dialectOptions: currentConfig.dialectOptions,
});

module.exports = { sequelize, config: currentConfig };
