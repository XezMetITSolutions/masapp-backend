const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Safe model import with fallback
let Staff, Restaurant;
try {
  const models = require('../models');
  Staff = models.Staff;
  Restaurant = models.Restaurant;
} catch (error) {
  console.error('Model import error:', error);
  Staff = null;
  Restaurant = null;
}

// GET /api/staff/restaurant/:restaurantId - Get all staff for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    if (!Staff || !Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    const { restaurantId } = req.params;

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const staff = await Staff.findAll({
      where: { restaurantId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error getting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/staff/restaurant/:restaurantId - Create new staff member
router.post('/restaurant/:restaurantId', async (req, res) => {
  try {
    console.log('🔍 Staff creation request:', req.params, req.body);
    
    if (!Staff || !Restaurant) {
      console.log('❌ Models not loaded:', { Staff: !!Staff, Restaurant: !!Restaurant });
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    const { restaurantId } = req.params;
    const { name, email, phone, role, department, notes, username, password } = req.body;

    console.log('📝 Request data:', { restaurantId, name, email, username, role });

    if (!name || !email) {
      console.log('❌ Missing required fields:', { name, email });
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Verify restaurant exists
    console.log('🔍 Looking for restaurant:', restaurantId);
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      console.log('❌ Restaurant not found:', restaurantId);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    console.log('✅ Restaurant found:', restaurant.name);

    // Check if email already exists for this restaurant
    const existingStaff = await Staff.findOne({
      where: { 
        restaurantId,
        email: email 
      }
    });

    if (existingStaff) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already exists for this restaurant'
      });
    }

    console.log('✅ Email is unique, creating staff...');

    const staff = await Staff.create({
      restaurantId,
      name,
      email,
      username: username || null,
      password: password || null,
      phone: phone || null,
      role: role || 'waiter',
      department: department || 'service',
      notes: notes || null,
      status: 'active',
      lastLogin: null
    });

    console.log('✅ Staff created successfully:', staff.id);

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staff
    });
  } catch (error) {
    console.error('❌ Error creating staff:', error);
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

// PUT /api/staff/:staffId - Update staff member
router.put('/:staffId', async (req, res) => {
  try {
    if (!Staff) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    const { staffId } = req.params;
    const { name, email, phone, role, department, notes, status, username, password } = req.body;

    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Update fields
    if (name) staff.name = name;
    if (email) staff.email = email;
    if (username !== undefined) staff.username = username;
    if (password !== undefined) staff.password = password;
    if (phone !== undefined) staff.phone = phone;
    if (role) staff.role = role;
    if (department) staff.department = department;
    if (notes !== undefined) staff.notes = notes;
    if (status) staff.status = status;

    await staff.save();

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/staff/:staffId - Delete staff member
router.delete('/:staffId', async (req, res) => {
  try {
    if (!Staff) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    const { staffId } = req.params;

    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    await staff.destroy();

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/staff/login - Staff login
router.post('/login', async (req, res) => {
  try {
    if (!Staff || !Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    const { username, password, subdomain } = req.body;
    
    console.log('🔍 Staff login attempt:', { username, subdomain });

    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find restaurant by subdomain
    console.log('🔍 Looking for restaurant with subdomain:', subdomain);
    const restaurant = await Restaurant.findOne({
      where: { username: subdomain }
    });

    if (!restaurant) {
      console.log('❌ Restaurant not found for subdomain:', subdomain);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    console.log('✅ Restaurant found:', restaurant.name, 'ID:', restaurant.id);

    // Find staff member
    console.log('🔍 Looking for staff:', { username, restaurantId: restaurant.id });
    const staff = await Staff.findOne({
      where: {
        restaurantId: restaurant.id,
        username: username,
        password: password,
        status: 'active'
      }
    });

    if (!staff) {
      console.log('❌ Staff not found or invalid credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Staff found:', staff.name, 'Role:', staff.role);

    // Update last login
    staff.lastLogin = new Date();
    await staff.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        restaurantId: staff.restaurantId,
        restaurantName: restaurant.name
      }
    });
  } catch (error) {
    console.error('Error during staff login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/staff/restaurants - List all restaurants (debug)
router.get('/restaurants', async (req, res) => {
  try {
    if (!Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Restaurant system temporarily unavailable'
      });
    }

    const restaurants = await Restaurant.findAll({
      attributes: ['id', 'name', 'username', 'email'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('Error getting restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/staff/all - List all staff (debug)
router.get('/all', async (req, res) => {
  try {
    if (!Staff || !Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable'
      });
    }

    const staff = await Staff.findAll({
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'name', 'username']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error getting all staff:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;