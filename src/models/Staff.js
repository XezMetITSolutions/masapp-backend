const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define('Staff', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Restaurants',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'waiter',
      validate: {
        isIn: [['waiter', 'cashier', 'chef', 'manager', 'admin']]
      }
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'service'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive', 'suspended']]
      }
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
        max: 5
      }
    }
  }, {
    tableName: 'Staff',
    timestamps: true,
    indexes: [
      {
        fields: ['restaurantId']
      },
      {
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['status']
      }
    ]
  });

  Staff.associate = function(models) {
    // Staff belongs to Restaurant
    Staff.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });
  };

  return Staff;
};
