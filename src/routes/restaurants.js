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
    
    // Fallback: return demo data if database is not available
    if (error.name === 'SequelizeConnectionRefusedError') {
      return res.json({
        success: true,
        data: [
          {
            id: 'demo-restaurant-1',
            name: 'Kardeşler Lokantası',
            username: 'kardesler',
            email: 'info@kardesler.com',
            features: ['qr_menu', 'table_management', 'basic_reports', 'advanced_analytics'],
            categories: [],
            menuItems: []
          }
        ],
        fallback: true
      });
    }
    
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
    
    // Fallback: return demo data if database is not available
    if (error.name === 'SequelizeConnectionRefusedError') {
      const { username } = req.params;
      if (username === 'kardesler') {
        return res.json({
          success: true,
          data: {
            id: 'demo-restaurant-1',
            name: 'Kardeşler Lokantası',
            username: 'kardesler',
            email: 'info@kardesler.com',
            features: ['qr_menu', 'table_management', 'basic_reports', 'advanced_analytics'],
            categories: [],
            menuItems: []
          },
          fallback: true
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
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

module.exports = router;


