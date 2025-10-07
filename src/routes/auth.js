const express = require('express');
const router = express.Router();
const { Restaurant } = require('../models');
const bcrypt = require('bcryptjs');

// Restaurant login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Restaurant'ı username ile bul
    const restaurant = await Restaurant.findOne({
      where: { username }
    });
    
    if (!restaurant) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Password kontrolü
    const isValidPassword = await bcrypt.compare(password, restaurant.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Password'u response'dan çıkar
    const { password: _, ...restaurantData } = restaurant.toJSON();
    
    res.json({
      success: true,
      data: restaurantData,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/register', (req, res) => {
  res.json({
    message: 'Register endpoint - to be implemented',
    status: 'placeholder'
  });
});

router.post('/logout', (req, res) => {
  res.json({
    message: 'Logout endpoint - to be implemented',
    status: 'placeholder'
  });
});

module.exports = router;


