const express = require('express');
const router = express.Router();
const { Restaurant, MenuCategory, MenuItem } = require('../models');
const bcrypt = require('bcryptjs');

// GET /api/restaurants - List all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: MenuCategory,
          as: 'categories',
          include: [
            {
              model: MenuItem,
              as: 'items'
            }
          ]
        }
      ]
    });
    
    res.json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    
    // No fallback data - return actual database results only
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/restaurants/username/:username - Get restaurant by username (subdomain)
router.get('/username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const restaurant = await Restaurant.findOne({
      where: { username },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: MenuCategory,
          as: 'categories',
          include: [
            {
              model: MenuItem,
              as: 'items'
            }
          ]
        }
      ]
    });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Get restaurant by username error:', error);
    
    // No fallback data - return actual database results only
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/restaurants/:id - Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await Restaurant.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: MenuCategory,
          as: 'categories',
          include: [
            {
              model: MenuItem,
              as: 'items'
            }
          ]
        }
      ]
    });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/restaurants - Create restaurant
router.post('/', async (req, res) => {
  try {
    const { name, username, email, password, phone, address, features } = req.body;
    
    // Validate required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, username, email, and password are required'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const restaurant = await Restaurant.create({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
      address,
      features: features || ['qr_menu', 'basic_reports']
    });
    
    // Remove password from response
    const { password: _, ...restaurantData } = restaurant.toJSON();
    
    res.status(201).json({
      success: true,
      data: restaurantData
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/restaurants/users/all - Get all restaurant users for admin
router.get('/users/all', async (req, res) => {
  try {
    console.log('🔍 Getting all restaurant users...');
    
    // First check if Restaurant model is available
    if (!Restaurant) {
      throw new Error('Restaurant model not found');
    }
    
    const restaurants = await Restaurant.findAll({
      attributes: ['id', 'name', 'username', 'email', 'phone', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📊 Found ${restaurants.length} restaurants`);
    
    // Her restoranı kullanıcı olarak formatla
    const users = restaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone || '-',
      role: 'restaurant_owner',
      status: 'active',
      restaurant: restaurant.name,
      lastLogin: restaurant.updatedAt,
      createdAt: restaurant.createdAt,
      username: restaurant.username
    }));
    
    console.log(`✅ Returning ${users.length} users`);
    console.log('Sample user data:', users[0]);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('❌ Get all restaurant users error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/restaurants/:id/users - Get restaurant users
router.get('/:id/users', async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await Restaurant.findByPk(id, {
      attributes: ['id', 'name', 'username', 'email']
    });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Restoran sahibi kullanıcı olarak ekle
    const users = [{
      id: restaurant.id,
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone || '-',
      role: 'restaurant_owner',
      status: 'active',
      restaurant: restaurant.name,
      lastLogin: new Date().toISOString(),
      createdAt: restaurant.createdAt,
      username: restaurant.username
    }];
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get restaurant users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, features, subscriptionPlan } = req.body;
    
    const restaurant = await Restaurant.findByPk(id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    await restaurant.update({
      name: name || restaurant.name,
      email: email || restaurant.email,
      phone: phone || restaurant.phone,
      address: address || restaurant.address,
      features: features || restaurant.features,
      subscriptionPlan: subscriptionPlan || restaurant.subscriptionPlan
    });
    
    // Remove password from response
    const { password: _, ...restaurantData } = restaurant.toJSON();
    
    res.json({
      success: true,
      data: restaurantData
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/restaurants/:id/features - Update restaurant features
router.put('/:id/features', async (req, res) => {
  try {
    const { id } = req.params;
    const { features } = req.body;
    
    if (!Array.isArray(features)) {
      return res.status(400).json({
        success: false,
        message: 'Features must be an array'
      });
    }
    
    const restaurant = await Restaurant.findByPk(id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    await restaurant.update({ features });
    
    res.json({
      success: true,
      data: {
        id: restaurant.id,
        features: restaurant.features
      }
    });
  } catch (error) {
    console.error('Update restaurant features error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/restaurants/:id/change-password - Change restaurant password
router.post('/:id/change-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, restaurant.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await restaurant.update({ password: hashedNewPassword });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;


