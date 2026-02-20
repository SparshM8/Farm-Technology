import express from 'express';
import { getDatabase, promisifyDb } from '../db/database.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { generateId } from '../utils/id.js';

const router = express.Router();

// Get dashboard stats (admin only)
router.get('/dashboard/stats', authenticate, adminOnly, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    const totalOrders = await dbAsync.get('SELECT COUNT(*) as count FROM orders');
    const totalRevenue = await dbAsync.get('SELECT SUM(final_amount) as total FROM orders');
    const pendingOrders = await dbAsync.get(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
    );
    const totalProducts = await dbAsync.get('SELECT COUNT(*) as count FROM products');

    res.json({
      totalOrders: totalOrders.count,
      totalRevenue: totalRevenue.total || 0,
      pendingOrders: pendingOrders.count,
      totalProducts: totalProducts.count,
    });
  } catch (error) {
    next(error);
  }
});

// Add product (admin only)
router.post('/products', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { name, category, price, description, stock, sku } = req.body;

    if (!name || !category || !price || price < 0) {
      return res.status(400).json({ error: 'Invalid product data' });
    }

    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    const productId = generateId();
    await dbAsync.run(
      'INSERT INTO products (id, name, category, price, description, stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [productId, name, category, price, description || null, stock || 0, sku || null]
    );

    res.status(201).json({ success: true, productId });
  } catch (error) {
    next(error);
  }
});

// Update product (admin only)
router.put('/products/:productId', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { name, category, price, description, stock } = req.body;

    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    await dbAsync.run(
      'UPDATE products SET name = ?, category = ?, price = ?, description = ?, stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, category, price, description, stock, req.params.productId]
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Delete product (admin only)
router.delete('/products/:productId', authenticate, adminOnly, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    await dbAsync.run('DELETE FROM products WHERE id = ?', [req.params.productId]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get all orders (admin only)
router.get('/orders', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.query;
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    let query = 'SELECT id, order_number, total_amount, final_amount, status, payment_status, created_at FROM orders';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const orders = await dbAsync.all(query, params);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Update order status (admin only)
router.put('/orders/:orderId/status', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    await dbAsync.run(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, req.params.orderId]
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get contacts (admin only)
router.get('/contacts', authenticate, adminOnly, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    const contacts = await dbAsync.all(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );

    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

// Update contact status (admin only)
router.put('/contacts/:contactId/status', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;

    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    await dbAsync.run('UPDATE contacts SET status = ? WHERE id = ?', [
      status,
      req.params.contactId,
    ]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
