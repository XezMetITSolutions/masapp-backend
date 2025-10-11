const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Database connection
const { connectDB } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Allow all Netlify subdomains and localhost
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://guzellestir.com',
      'https://www.guzellestir.com'
    ];
    
    // Allow all *.guzellestir.com subdomains
    if (origin.endsWith('.guzellestir.com') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Subdomain', 'X-Forwarded-Host'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting - GEVŞEK (Development için)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1 dakikada 1000 istek (çok gevşek)
  message: 'Çok fazla istek gönderdiniz, lütfen biraz bekleyin'
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'MASAPP Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes (placeholder)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/restaurants', require('./routes/menu')); // Menu routes nested under restaurants
app.use('/api/orders', require('./routes/orders'));
app.use('/api/qr', require('./routes/qr')); // QR code management

// Test endpoint for debug page
app.post('/api/test-image', async (req, res) => {
  try {
    const { image, testData } = req.body;
    
    console.log('Test image endpoint called:', {
      imageLength: image?.length || 0,
      testData: testData
    });
    
    res.json({
      success: true,
      message: 'Test endpoint working',
      receivedData: {
        imageLength: image?.length || 0,
        imageType: image?.substring(0, 50) + '...',
        testData: testData
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint error',
      error: error.message
    });
  }
});

// Simple menu item test endpoint
app.post('/api/test-menu-item', async (req, res) => {
  try {
    const { restaurantId, categoryId, name, price, imageUrl } = req.body;
    
    console.log('Test menu item endpoint called:', {
      restaurantId,
      categoryId,
      name,
      price,
      imageUrlLength: imageUrl?.length || 0
    });
    
    // Just validate the data without creating
    if (!restaurantId || !categoryId || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['restaurantId', 'categoryId', 'name', 'price']
      });
    }
    
    res.json({
      success: true,
      message: 'Menu item data is valid',
      data: {
        restaurantId,
        categoryId,
        name,
        price,
        imageUrlLength: imageUrl?.length || 0
      }
    });
  } catch (error) {
    console.error('Test menu item endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test menu item endpoint error',
      error: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Initialize database and start server
const startServer = async () => {
  // Start server first
  const server = app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base: http://localhost:${PORT}/api`);
  });
  
  // Connect to database (non-blocking)
  connectDB()
    .then(async () => {
      console.log('✅ Database connected successfully');
      
      // Auto-sync models with database (adds missing columns)
      const { sequelize } = require('./models');
      try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synced successfully');
      } catch (syncError) {
        console.error('⚠️ Database sync warning:', syncError.message);
      }
    })
    .catch(error => {
      console.error('❌ Database connection failed, but server is still running:', error.message);
    });
  
  return server;
};

startServer();

module.exports = app;


