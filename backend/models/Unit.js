const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Unit = sequelize.define('Unit', {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true,
    },
    size: {
      type: DataTypes.ENUM('5m²', '10m²', '15m²', '20m²', '30m²'),
      allowNull: false,
    },
    pricePerMonth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Price must be a positive number',
        },
      },
    },
    isOccupied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    customerId: {
      type: DataTypes.STRING(10),
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    rentedSince: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'units',
    timestamps: true,
    indexes: [
      {
        fields: ['size'],
      },
      {
        fields: ['isOccupied'],
      },
      {
        fields: ['customerId'],
      },
    ],
  });

  Unit.associate = (models) => {
    Unit.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer',
    });
  };

  // Get size in square meters as a number
  Unit.prototype.getSizeInSqm = function() {
    const sizeMap = {
      '5m²': 5,
      '10m²': 10,
      '15m²': 15,
      '20m²': 20,
      '30m²': 30,
    };
    return sizeMap[this.size] || 0;
  };

  return Unit;
};
