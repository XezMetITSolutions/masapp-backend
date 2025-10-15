const express = require('express');
const router = express.Router();
const { Order, OrderItem, Restaurant, MenuItem, MenuCategory, QRToken } = require('../models');

// GET /api/orders?restaurantId=...&status=...
router.get('/', async (req, res) => {
  try {
    const { restaurantId, status } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'restaurantId is required' });
    }

    const where = { restaurantId };
    if (status) where.status = status;

    const orders = await Order.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    // Attach items (join OrderItem -> MenuItem) and normalize shape for frontends
    const orderIds = orders.map(o => o.id);
    const items = await OrderItem.findAll({
      where: { orderId: orderIds },
      include: [{ model: MenuItem, as: 'menuItem', attributes: ['id', 'name', 'price', 'categoryId'] }]
    });

    const orderIdToItems = new Map();
    for (const it of items) {
      const list = orderIdToItems.get(it.orderId) || [];
      list.push({
        id: it.menuItemId || it.id,
        name: it.menuItem?.name || 'Ürün',
        quantity: Number(it.quantity || 1),
        price: Number(it.unitPrice || 0),
        notes: it.notes || '',
        // Basit varsayım: tüm ürünler food; paneller kategoriye göre filtreliyor
        category: 'food',
        status: 'preparing',
        prepTime: 10
      });
      orderIdToItems.set(it.orderId, list);
    }

    const data = orders.map(o => ({
      ...o.toJSON(),
      items: orderIdToItems.get(o.id) || []
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('GET /orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { restaurantId, tableNumber, customerName, items = [], notes, orderType = 'dine_in' } = req.body;
    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'restaurantId and items are required' });
    }

    // Basic total calc if client did not send
    let totalAmount = 0;
    for (const it of items) {
      const qty = Number(it.quantity || 1);
      const unitPrice = Number(it.unitPrice || it.price || 0);
      totalAmount += qty * unitPrice;
    }

    const order = await Order.create({
      restaurantId,
      tableNumber: tableNumber || null,
      customerName: customerName || null,
      status: 'pending',
      totalAmount,
      notes: notes || null,
      orderType
    });

    for (const it of items) {
      const qty = Number(it.quantity || 1);
      const unitPrice = Number(it.unitPrice || it.price || 0);

      // Resolve a valid menuItemId: prefer provided UUID; else try name lookup; else create placeholder
      let resolvedMenuItemId = it.menuItemId;
      const looksLikeUuid = typeof resolvedMenuItemId === 'string' && resolvedMenuItemId.length >= 8 && resolvedMenuItemId.includes('-');
      if (!resolvedMenuItemId || !looksLikeUuid) {
        try {
          // Try find by name within this restaurant
          if (it.name) {
            const found = await MenuItem.findOne({ where: { restaurantId, name: it.name } });
            if (found) {
              resolvedMenuItemId = found.id;
            } else {
              // ensure default category exists
              let defCat = await MenuCategory.findOne({ where: { restaurantId, name: 'Genel' } });
              if (!defCat) {
                defCat = await MenuCategory.create({ restaurantId, name: 'Genel' });
              }
              const created = await MenuItem.create({
                restaurantId,
                categoryId: defCat.id,
                name: it.name,
                price: unitPrice,
                description: it.notes || null
              });
              resolvedMenuItemId = created.id;
            }
          }
        } catch (e) {
          console.warn('MenuItem resolve failed, using null id:', e?.message);
        }
      }

      await OrderItem.create({
        orderId: order.id,
        menuItemId: resolvedMenuItemId,
        quantity: qty,
        unitPrice,
        totalPrice: qty * unitPrice,
        notes: it.notes || null
      });
    }

    // Order started: keep QR active until payment; do NOT deactivate here
    // Deactivation should occur after payment is completed. Placeholder logic below if needed later:
    // await QRToken.update({ isActive: false }, { where: { restaurantId, tableNumber, isActive: true } });

    res.status(201).json({ success: true, data: order, message: 'Order created' });
  } catch (error) {
    console.error('POST /orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/orders/:id (status update)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'invalid status' });
    }

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status) order.status = status;
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('PUT /orders/:id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;


