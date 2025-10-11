const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/masapp', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import models
const Restaurant = require('./Restaurant')(sequelize, Sequelize.DataTypes);
const MenuCategory = require('./MenuCategory')(sequelize, Sequelize.DataTypes);
const MenuItem = require('./MenuItem')(sequelize, Sequelize.DataTypes);
const Order = require('./Order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('./OrderItem')(sequelize, Sequelize.DataTypes);
const Feature = require('./Feature')(sequelize, Sequelize.DataTypes);
const QRToken = require('./QRToken')(sequelize, Sequelize.DataTypes);

// Define associations
Restaurant.hasMany(MenuCategory, { foreignKey: 'restaurantId', as: 'categories' });
MenuCategory.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

Restaurant.hasMany(MenuItem, { foreignKey: 'restaurantId', as: 'menuItems' });
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

MenuCategory.hasMany(MenuItem, { foreignKey: 'categoryId', as: 'items' });
MenuItem.belongsTo(MenuCategory, { foreignKey: 'categoryId', as: 'category' });

Restaurant.hasMany(Order, { foreignKey: 'restaurantId', as: 'orders' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

MenuItem.hasMany(OrderItem, { foreignKey: 'menuItemId', as: 'orderItems' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });

// QR Token associations
Restaurant.hasMany(QRToken, { foreignKey: 'restaurantId', as: 'qrTokens' });
QRToken.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'Restaurant' });

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully.');
    
    // Sync models (create tables)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    } else {
      // Production: only sync if tables don't exist
      await sequelize.sync();
      console.log('✅ Database models checked.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error);
    
    // In production, don't exit - let Render handle retries
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Retrying database connection...');
      setTimeout(connectDB, 5000); // Retry after 5 seconds
    } else {
      process.exit(1);
    }
  }
};

module.exports = {
  sequelize,
  connectDB,
  Restaurant,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  Feature,
  QRToken
};
