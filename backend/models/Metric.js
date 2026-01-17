const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Metric = sequelize.define('Metric', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    month: {
      type: DataTypes.STRING(7), // Format: YYYY-MM
      allowNull: false,
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    occupancyRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    totalUnits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    occupiedUnits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    newCustomers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    churnedCustomers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    averageRentalDuration: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    revenueBySize: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    occupancyBySize: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    tableName: 'metrics',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['month'],
      },
    ],
  });

  return Metric;
};
