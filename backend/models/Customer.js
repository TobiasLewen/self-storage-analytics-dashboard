const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [2, 255],
          msg: 'Name must be between 2 and 255 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('private', 'business'),
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'customers',
    timestamps: true,
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['startDate'],
      },
      {
        fields: ['endDate'],
      },
    ],
  });

  Customer.associate = (models) => {
    Customer.hasMany(models.Unit, {
      foreignKey: 'customerId',
      as: 'units',
    });
  };

  // Check if customer is currently active
  Customer.prototype.isActive = function() {
    return !this.endDate || new Date(this.endDate) >= new Date();
  };

  // Calculate months since start date
  Customer.prototype.getMonthsAsCustomer = function() {
    const start = new Date(this.startDate);
    const end = this.endDate ? new Date(this.endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(0, months);
  };

  return Customer;
};
