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

// POST /api/staff/create-demo - Create demo staff members
router.post('/create-demo', async (req, res) => {
  try {
    if (!Staff || !Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    console.log('🔍 Creating demo staff members...');
    
    // Find Hazal restaurant
    const hazalRestaurant = await Restaurant.findOne({
      where: { username: 'hazal' }
    });

    if (!hazalRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Hazal restaurant not found'
      });
    }

    console.log('✅ Hazal restaurant found:', hazalRestaurant.id);

    // Demo staff members
    const staffMembers = [
      {
        restaurantId: hazalRestaurant.id,
        username: 'hazal_kasa',
        password: '123456',
        name: 'Hazal Kasa',
        role: 'cashier',
        status: 'active'
      },
      {
        restaurantId: hazalRestaurant.id,
        username: 'hazal_garson',
        password: '123456',
        name: 'Hazal Garson',
        role: 'waiter',
        status: 'active'
      },
      {
        restaurantId: hazalRestaurant.id,
        username: 'hazal_mutfak',
        password: '123456',
        name: 'Hazal Mutfak',
        role: 'kitchen',
        status: 'active'
      }
    ];

    const createdStaff = [];
    
    for (const staffData of staffMembers) {
      try {
        // Check if staff already exists
        const existingStaff = await Staff.findOne({
          where: { 
            restaurantId: staffData.restaurantId,
            username: staffData.username 
          }
        });

        if (existingStaff) {
          console.log(`✅ Staff already exists: ${staffData.name}`);
          createdStaff.push(existingStaff);
        } else {
          const staff = await Staff.create(staffData);
          console.log(`✅ Staff created: ${staff.name} (${staff.id})`);
          createdStaff.push(staff);
        }
      } catch (error) {
        console.error(`❌ Error creating staff ${staffData.name}:`, error);
      }
    }

    console.log('✅ Demo staff creation completed');

    res.json({
      success: true,
      message: 'Demo staff members created successfully',
      data: createdStaff
    });

  } catch (error) {
    console.error('❌ Error creating demo staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating demo staff',
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
    const { name, email, phone, role, username, password } = req.body;

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
      status: 'active'
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
    const { name, email, phone, role, status, username, password } = req.body;

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
    console.log('🗑️ [DELETE] Staff deletion request:', req.params);
    
    if (!Staff) {
      console.log('❌ [DELETE] Staff model not loaded');
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    const { staffId } = req.params;
    console.log('🔍 [DELETE] Looking for staff with ID:', staffId, 'Type:', typeof staffId);

    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      console.log('❌ [DELETE] Staff not found:', staffId);
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    console.log('✅ [DELETE] Staff found, deleting:', staff.id);
    await staff.destroy();

    console.log('✅ [DELETE] Staff deleted successfully');
    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('❌ [DELETE] Error deleting staff:', error);
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
    
    console.log('🔍 Staff login attempt:', { username, subdomain, password: password ? '***' : 'missing' });
    console.log('🔍 Request body:', req.body);

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
      
      // Auto-create restaurant if not found
      console.log('🔧 Auto-creating restaurant for subdomain:', subdomain);
      try {
        const newRestaurant = await Restaurant.create({
          name: subdomain.charAt(0).toUpperCase() + subdomain.slice(1),
          username: subdomain,
          email: `${subdomain}@${subdomain}.com`,
          password: '123456',
          phone: '+90 555 000 0000',
          address: `${subdomain}, İstanbul`,
          description: `Restaurant ${subdomain}`,
          logo: null,
          coverImage: null,
          status: 'active'
        });
        
        console.log('✅ Restaurant auto-created:', newRestaurant.name, 'ID:', newRestaurant.id);
        
        // Auto-create demo staff
        console.log('🔧 Auto-creating demo staff for restaurant:', newRestaurant.id);
        const demoStaff = await Staff.create({
          restaurantId: newRestaurant.id,
          username: `${subdomain}_kasa`,
          password: '123456',
          name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Kasa`,
          role: 'cashier',
          status: 'active'
        });
        
        console.log('✅ Demo staff auto-created:', demoStaff.name);
        
        // Use the auto-created restaurant
        restaurant = newRestaurant;
      } catch (error) {
        console.error('❌ Error auto-creating restaurant:', error);
        return res.status(500).json({
          success: false,
          message: 'Error creating restaurant'
        });
      }
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
    console.log('📋 [RESTAURANTS] Fetching all restaurants...');
    console.log('📋 [RESTAURANTS] Restaurant model exists:', !!Restaurant);
    
    if (!Restaurant) {
      console.error('❌ [RESTAURANTS] Restaurant model not loaded');
      return res.status(503).json({
        success: false,
        message: 'Restaurant system temporarily unavailable'
      });
    }

    const restaurants = await Restaurant.findAll({
      attributes: ['id', 'name', 'username', 'email'],
      order: [['name', 'ASC']]
    });

    console.log('✅ [RESTAURANTS] Found restaurants:', restaurants.length);
    console.log('📊 [RESTAURANTS] Data:', JSON.stringify(restaurants, null, 2));

    res.json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('❌ [RESTAURANTS] Error getting restaurants:', error);
    console.error('❌ [RESTAURANTS] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/staff/all - List all staff (debug)
router.get('/all', async (req, res) => {
  try {
    console.log('🔍 Getting all staff...');
    
    if (!Staff) {
      console.log('❌ Staff model not loaded');
      return res.status(503).json({
        success: false,
        message: 'Staff model not loaded'
      });
    }

    // En basit kontrol: tablo/bağlantı hazır mı?
    let count = 0;
    try {
      count = await Staff.count();
    } catch (err) {
      console.error('❌ Staff.count() failed:', err.message);
      return res.status(503).json({ success: false, message: 'Staff table not ready', error: err.message });
    }
    console.log('✅ Staff count:', count);

    let staff = [];
    try {
      staff = await Staff.findAll({ order: [['createdAt', 'DESC']] });
    } catch (err) {
      console.error('❌ Staff.findAll() failed:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to query staff', error: err.message });
    }

    const simpleStaff = staff.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      username: member.username,
      role: member.role,
      status: member.status,
      restaurantId: member.restaurantId,
      createdAt: member.createdAt
    }));

    res.json({ success: true, data: simpleStaff, count });
  } catch (error) {
    console.error('❌ Error getting all staff:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/staff/test - Simple test endpoint
router.get('/test', async (req, res) => {
  try {
    console.log('🔍 Staff test endpoint called');
    
    if (!Staff) {
      console.log('❌ Staff model not loaded');
      return res.status(503).json({
        success: false,
        message: 'Staff model not loaded'
      });
    }

    console.log('✅ Staff model loaded, testing query...');

    // En basit query
    const count = await Staff.count();
    console.log('✅ Staff count:', count);

    res.json({
      success: true,
      message: 'Staff test successful',
      count: count,
      modelLoaded: !!Staff
    });
  } catch (error) {
    console.error('❌ Staff test error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Staff test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/staff/restore-restaurants - Restore restaurant data
router.post('/restore-restaurants', async (req, res) => {
  try {
    console.log('🔍 Restoring restaurant data...');
    
    if (!Restaurant) {
      console.log('❌ Restaurant model not loaded');
      return res.status(503).json({
        success: false,
        message: 'Restaurant model not loaded'
      });
    }

    console.log('✅ Restaurant model loaded, creating restaurants...');

    // Restaurant verilerini yeniden oluştur
    const restaurants = [
      {
        name: 'Aksaray',
        username: 'aksaray',
        email: 'aksaray@aksaray.guzellestir.com',
        password: '123456', // Password eklendi
        phone: '+90 555 123 4567',
        address: 'Aksaray, İstanbul',
        description: 'Geleneksel Türk mutfağı',
        logo: null,
        coverImage: null,
        status: 'active'
      },
      {
        name: 'Hazal',
        username: 'hazal',
        email: 'hazal@hazal.com',
        password: '123456', // Password eklendi
        phone: '+90 555 234 5678',
        address: 'Hazal, İstanbul',
        description: 'Modern Türk mutfağı',
        logo: null,
        coverImage: null,
        status: 'active'
      },
      {
        name: 'Test Restoran',
        username: 'testuser',
        email: 'test@test.com',
        password: '123456', // Password eklendi
        phone: '+90 555 345 6789',
        address: 'Test, İstanbul',
        description: 'Test restoranı',
        logo: null,
        coverImage: null,
        status: 'active'
      }
    ];

    const createdRestaurants = [];
    
    for (const restaurantData of restaurants) {
      try {
        // Mevcut restaurant'ı kontrol et
        const existingRestaurant = await Restaurant.findOne({
          where: { username: restaurantData.username }
        });

        if (existingRestaurant) {
          console.log(`✅ Restaurant already exists: ${restaurantData.name}`);
          createdRestaurants.push(existingRestaurant);
        } else {
          const restaurant = await Restaurant.create(restaurantData);
          console.log(`✅ Restaurant created: ${restaurant.name} (${restaurant.id})`);
          createdRestaurants.push(restaurant);
        }
      } catch (error) {
        console.error(`❌ Error creating restaurant ${restaurantData.name}:`, error);
      }
    }

    console.log('✅ Restaurant restoration completed');

    res.json({
      success: true,
      message: 'Restaurants restored successfully',
      data: createdRestaurants
    });
  } catch (error) {
    console.error('❌ Error restoring restaurants:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Error restoring restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
