const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { QRToken, Restaurant } = require('../models');
const { Op } = require('sequelize');

// Helper: Generate secure token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper: Check if token is expired
const isTokenExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

// POST /api/qr/generate - Generate QR token for a table
router.post('/generate', async (req, res) => {
  try {
    const { restaurantId, tableNumber, duration = 2 } = req.body; // duration in hours
    
    if (!restaurantId || !tableNumber) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID and table number are required'
      });
    }
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Deactivate old tokens for this table
    await QRToken.update(
      { isActive: false },
      {
        where: {
          restaurantId,
          tableNumber,
          isActive: true
        }
      }
    );
    
    // Generate new token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000); // duration hours from now
    
    const qrToken = await QRToken.create({
      restaurantId,
      tableNumber,
      token,
      expiresAt,
      isActive: true,
      createdBy: req.body.createdBy || 'waiter'
    });
    
    // Generate QR URL
    const qrUrl = `${process.env.FRONTEND_URL || 'https://guzellestir.com'}/menu/?t=${token}`;
    
    res.status(201).json({
      success: true,
      data: {
        id: qrToken.id,
        token: qrToken.token,
        tableNumber: qrToken.tableNumber,
        expiresAt: qrToken.expiresAt,
        qrUrl,
        qrData: qrUrl // URL to encode in QR code
      }
    });
    
  } catch (error) {
    console.error('Generate QR token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/qr/verify/:token - Verify QR token
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const qrToken = await QRToken.findOne({
      where: { token },
      include: [{
        model: Restaurant,
        attributes: ['id', 'name', 'username']
      }]
    });
    
    if (!qrToken) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }
    
    // Check if token is active
    if (!qrToken.isActive) {
      return res.status(403).json({
        success: false,
        message: 'QR code has been deactivated'
      });
    }
    
    // Check if token is expired
    if (isTokenExpired(qrToken.expiresAt)) {
      // Auto-deactivate expired token
      await qrToken.update({ isActive: false });
      
      return res.status(403).json({
        success: false,
        message: 'QR code has expired',
        expiresAt: qrToken.expiresAt
      });
    }
    
    // Update last used time
    await qrToken.update({ usedAt: new Date() });
    
    res.json({
      success: true,
      data: {
        restaurantId: qrToken.restaurantId,
        restaurant: qrToken.Restaurant,
        tableNumber: qrToken.tableNumber,
        expiresAt: qrToken.expiresAt,
        remainingMinutes: Math.floor((new Date(qrToken.expiresAt) - new Date()) / 60000)
      }
    });
    
  } catch (error) {
    console.error('Verify QR token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/qr/refresh/:token - Refresh token expiration (waiter only)
router.post('/refresh/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { duration = 2 } = req.body; // duration in hours
    
    const qrToken = await QRToken.findOne({
      where: { token }
    });
    
    if (!qrToken) {
      return res.status(404).json({
        success: false,
        message: 'QR token not found'
      });
    }
    
    const newExpiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
    
    await qrToken.update({
      expiresAt: newExpiresAt,
      isActive: true
    });
    
    res.json({
      success: true,
      data: {
        expiresAt: newExpiresAt,
        message: `QR code refreshed for ${duration} hours`
      }
    });
    
  } catch (error) {
    console.error('Refresh QR token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/qr/restaurant/:restaurantId/tables - Get all active QR codes for restaurant
router.get('/restaurant/:restaurantId/tables', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const tokens = await QRToken.findAll({
      where: {
        restaurantId,
        isActive: true,
        expiresAt: {
          [Op.gt]: new Date() // Not expired
        }
      },
      order: [['tableNumber', 'ASC']],
      attributes: ['id', 'tableNumber', 'token', 'expiresAt', 'usedAt', 'createdAt']
    });
    
    // Add QR URLs
    const tokensWithUrls = tokens.map(token => ({
      ...token.toJSON(),
      qrUrl: `${process.env.FRONTEND_URL || 'https://guzellestir.com'}/menu/?t=${token.token}`,
      remainingMinutes: Math.floor((new Date(token.expiresAt) - new Date()) / 60000)
    }));
    
    res.json({
      success: true,
      data: tokensWithUrls
    });
    
  } catch (error) {
    console.error('Get restaurant QR tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/qr/deactivate/:token - Deactivate QR token
router.delete('/deactivate/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const qrToken = await QRToken.findOne({
      where: { token }
    });
    
    if (!qrToken) {
      return res.status(404).json({
        success: false,
        message: 'QR token not found'
      });
    }
    
    await qrToken.update({ isActive: false });
    
    res.json({
      success: true,
      message: 'QR code deactivated successfully'
    });
    
  } catch (error) {
    console.error('Deactivate QR token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cron job helper: Clean up expired tokens (call this periodically)
router.post('/cleanup', async (req, res) => {
  try {
    const result = await QRToken.update(
      { isActive: false },
      {
        where: {
          expiresAt: {
            [Op.lt]: new Date()
          },
          isActive: true
        }
      }
    );
    
    res.json({
      success: true,
      message: `Cleaned up ${result[0]} expired tokens`
    });
    
  } catch (error) {
    console.error('Cleanup expired tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

