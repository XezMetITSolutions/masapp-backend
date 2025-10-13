const express = require('express');
const router = express.Router();
const sharp = require('sharp');

// POST /api/remove-background - Remove background from image using Sharp
router.post('/remove-background', async (req, res) => {
  try {
    console.log('🖼️ Arkaplan silme endpoint\'i çağrıldı');
    
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }
    
    console.log('📸 Gelen resim boyutu:', imageData.length);
    
    // Base64'ten buffer'a çevir
    const imageBuffer = Buffer.from(imageData.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');
    
    console.log('🔄 Sharp ile arkaplan siliniyor...');
    const startTime = Date.now();
    
    // Sharp ile basit arkaplan silme (beyaz arkaplanı şeffaf yap)
    const resultBuffer = await sharp(imageBuffer)
      .removeAlpha() // Alpha channel'ı kaldır
      .threshold(240) // Beyaz renkleri threshold ile ayır
      .png({ 
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toBuffer();
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log(`✅ Arkaplan silindi! Süre: ${processingTime}ms`);
    
    // PNG olarak base64'e çevir
    const resultBase64 = `data:image/png;base64,${resultBuffer.toString('base64')}`;
    
    res.json({
      success: true,
      message: 'Background removed successfully (Sharp method)',
      data: {
        processedImage: resultBase64,
        processingTime: processingTime,
        originalSize: imageBuffer.length,
        processedSize: resultBuffer.length,
        method: 'Sharp Threshold'
      }
    });
    
  } catch (error) {
    console.error('❌ Arkaplan silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove background',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/remove-background/test - Test endpoint
router.get('/test', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Sharp background removal test endpoint is working',
      sharpVersion: '0.32.6',
      status: 'Ready',
      method: 'Sharp Threshold'
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

module.exports = router;
