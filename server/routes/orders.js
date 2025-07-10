// server/routes/orders.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const app = express();
// ✅ Place an order
router.post('/place', async (req, res) => {
  const { user_id, restaurant_id, order_type, items } = req.body;

  try {
    // Calculate total amount
    const itemIds = items.map(item => item.menu_item_id);
    const placeholders = itemIds.map(() => '?').join(',');
    const [menuItems] = await db.query(
      `SELECT id, price FROM menu_items WHERE id IN (${placeholders})`,
      itemIds
    );

    let totalAmount = 0;
    for (let item of items) {
      const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
      totalAmount += menuItem.price * item.quantity;
    }

    // Insert into orders
    const [orderResult] = await db.query(
      `INSERT INTO orders (user_id, restaurant_id, order_type, total_amount)
       VALUES (?, ?, ?, ?)`,
      [user_id, restaurant_id, order_type, totalAmount]
    );
    const orderId = orderResult.insertId;

    // Insert into order_items
    for (let item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity)
         VALUES (?, ?, ?)`,
        [orderId, item.menu_item_id, item.quantity]
      );
    }

    res.status(200).json({ message: 'Order placed successfully', orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Order placement failed' });
  }
});

// ✅ Track an order
router.get('/track/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const [[order]] = await db.query(
      `SELECT o.*, r.name AS restaurant_name
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ?`,
      [orderId]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const [items] = await db.query(
      `SELECT oi.quantity, mi.name, mi.price
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// ✅ Cancel an order
router.delete('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    await db.query(`UPDATE orders SET status = 'cancelled' WHERE id = ?`, [orderId]);
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

app.post('/api/update-order-status', async (req, res) => {
  const { orderId, status } = req.body;
  await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  res.send({ message: `Order ${orderId} status updated to ${status}` });
});


module.exports = router;
