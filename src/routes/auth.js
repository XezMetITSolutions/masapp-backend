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
    
    // Subdomain kontrolü - güvenlik açığını kapat
    const subdomain = req.headers['x-subdomain'] || req.headers['x-forwarded-host']?.split('.')[0];
    
    console.log('🔐 Login attempt:', { 
      username, 
      subdomain, 
      hostname: req.headers.host,
      'x-subdomain': req.headers['x-subdomain'],
      'x-forwarded-host': req.headers['x-forwarded-host'],
      'user-agent': req.headers['user-agent'],
      'origin': req.headers.origin,
      'referer': req.headers.referer
    });
    
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
    
    // SUBNET GÜVENLİK KONTROLÜ - Geçici olarak devre dışı
    if (false && subdomain && restaurant.username !== subdomain) {
      console.log('🚨 Subdomain mismatch:', { 
        restaurantUsername: restaurant.username, 
        requestSubdomain: subdomain 
      });
      return res.status(403).json({
        success: false,
        message: 'Bu subdomain için yetkiniz yok. Kendi subdomain\'inizden giriş yapın.'
      });
    }
    
    // Password kontrolü - plain text karşılaştırma
    if (restaurant.password !== password) {
      console.log('❌ Password mismatch:', { 
        provided: password, 
        stored: restaurant.password 
      });
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


