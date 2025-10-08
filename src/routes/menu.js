const express = require('express');
const router = express.Router();
const { Restaurant, MenuCategory, MenuItem } = require('../models');

// GET /api/restaurants/:restaurantId/menu - Get complete menu (categories + items)
router.get('/:restaurantId/menu', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    const categories = await MenuCategory.findAll({
      where: { restaurantId },
      include: [
        {
          model: MenuItem,
          as: 'items',
          required: false
        }
      ],
      order: [['displayOrder', 'ASC'], [{ model: MenuItem, as: 'items' }, 'displayOrder', 'ASC']]
    });
    
    // Flatten items from all categories
    const items = categories.flatMap(cat => cat.items || []);
    
    res.json({
      success: true,
      data: {
        categories,
        items
      }
    });
    
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/restaurants/:restaurantId/menu/categories - Get all categories for a restaurant
router.get('/:restaurantId/menu/categories', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    const categories = await MenuCategory.findAll({
      where: { restaurantId },
      include: [
        {
          model: MenuItem,
          as: 'items',
          required: false
        }
      ],
      order: [['displayOrder', 'ASC'], [{ model: MenuItem, as: 'items' }, 'displayOrder', 'ASC']]
    });
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Get menu categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/restaurants/:restaurantId/menu/categories - Create new category
router.post('/:restaurantId/menu/categories', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, description, displayOrder, isActive } = req.body;
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    const category = await MenuCategory.create({
      restaurantId,
      name,
      description,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    res.status(201).json({
      success: true,
      data: category
    });
    
  } catch (error) {
    console.error('Create menu category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/restaurants/:restaurantId/menu/categories/:categoryId - Update category
router.put('/:restaurantId/menu/categories/:categoryId', async (req, res) => {
  try {
    const { restaurantId, categoryId } = req.params;
    const { name, description, displayOrder, isActive } = req.body;
    
    const category = await MenuCategory.findOne({
      where: { id: categoryId, restaurantId }
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      displayOrder: displayOrder !== undefined ? displayOrder : category.displayOrder,
      isActive: isActive !== undefined ? isActive : category.isActive
    });
    
    res.json({
      success: true,
      data: category
    });
    
  } catch (error) {
    console.error('Update menu category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/restaurants/:restaurantId/menu/categories/:categoryId - Delete category
router.delete('/:restaurantId/menu/categories/:categoryId', async (req, res) => {
  try {
    const { restaurantId, categoryId } = req.params;
    
    const category = await MenuCategory.findOne({
      where: { id: categoryId, restaurantId }
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Delete all items in this category first
    await MenuItem.destroy({
      where: { categoryId }
    });
    
    // Delete the category
    await category.destroy();
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete menu category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/restaurants/:restaurantId/menu/items - Get all menu items for a restaurant
router.get('/:restaurantId/menu/items', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    const items = await MenuItem.findAll({
      include: [
        {
          model: MenuCategory,
          as: 'category',
          where: { restaurantId },
          attributes: ['id', 'name']
        }
      ],
      order: [['displayOrder', 'ASC']]
    });
    
    res.json({
      success: true,
      data: items
    });
    
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/restaurants/:restaurantId/menu/items - Create new menu item
router.post('/:restaurantId/menu/items', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { 
      categoryId, 
      name, 
      description, 
      price, 
      image, 
      allergens, 
      ingredients, 
      nutritionInfo,
      displayOrder,
      isActive,
      isAvailable 
    } = req.body;
    
    // Verify category belongs to restaurant
    const category = await MenuCategory.findOne({
      where: { id: categoryId, restaurantId }
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }
    
    const item = await MenuItem.create({
      restaurantId,
      categoryId,
      name,
      description,
      price: parseFloat(price),
      imageUrl: image,
      displayOrder: displayOrder || 0,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });
    
    res.status(201).json({
      success: true,
      data: item
    });
    
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/restaurants/:restaurantId/menu/items/:itemId - Update menu item
router.put('/:restaurantId/menu/items/:itemId', async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;
    const updateData = req.body;
    
    // Find item and verify it belongs to the restaurant
    const item = await MenuItem.findOne({
      include: [
        {
          model: MenuCategory,
          as: 'category',
          where: { restaurantId }
        }
      ],
      where: { id: itemId }
    });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    // If categoryId is being updated, verify new category belongs to restaurant
    if (updateData.categoryId) {
      const newCategory = await MenuCategory.findOne({
        where: { id: updateData.categoryId, restaurantId }
      });
      
      if (!newCategory) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }
    
    await item.update(updateData);
    
    res.json({
      success: true,
      data: item
    });
    
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/restaurants/:restaurantId/menu/items/:itemId - Delete menu item
router.delete('/:restaurantId/menu/items/:itemId', async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;
    
    // Find item and verify it belongs to the restaurant
    const item = await MenuItem.findOne({
      include: [
        {
          model: MenuCategory,
          as: 'category',
          where: { restaurantId }
        }
      ],
      where: { id: itemId }
    });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    await item.destroy();
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
