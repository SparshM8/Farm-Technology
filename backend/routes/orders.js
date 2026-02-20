import express from 'express';
import { getDatabase, promisifyDb } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { generateId, generateOrderNumber } from '../utils/id.js';
import { sendOrderConfirmation } from '../utils/email.js';

const router = express.Router();

// Create order from cart
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Missing shipping address or payment method' });
    }

    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    // Get cart items
    const cart = await dbAsync.get('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);
    if (!cart) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const cartItems = await dbAsync.all(
      'SELECT ci.product_id, ci.quantity, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
      [cart.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = generateId();
    const orderNumber = generateOrderNumber();

    // Create order
    await dbAsync.run(
      'INSERT INTO orders (id, user_id, order_number, total_amount, final_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orderId, req.user.id, orderNumber, totalAmount, totalAmount, shippingAddress, paymentMethod]
    );

    // Create order items
    for (const item of cartItems) {
      const orderItemId = generateId();
      await dbAsync.run(
        'INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderItemId, orderId, item.product_id, item.quantity, item.price]
      );

      // Update product stock
      await dbAsync.run('UPDATE products SET stock = stock - ? WHERE id = ?', [
        item.quantity,
        item.product_id,
      ]);
    }

    // Clear cart
    await dbAsync.run('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);

    // Send confirmation email
    try {
      await sendOrderConfirmation(req.user.email, {
        order_number: orderNumber,
        final_amount: totalAmount,
        created_at: new Date().toISOString(),
      });
    } catch (emailError) {
      console.error('Email send failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      orderId,
      orderNumber,
      totalAmount,
    });
  } catch (error) {
    next(error);
  }
});

// Get user orders
router.get('/', authenticate, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    const orders = await dbAsync.all(
      'SELECT id, order_number, total_amount, final_amount, status, payment_status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Get order details
router.get('/:orderId', authenticate, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    const order = await dbAsync.get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.orderId, req.user.id]
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await dbAsync.all(
      'SELECT oi.product_id, oi.quantity, oi.price, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [req.params.orderId]
    );

    res.json({ ...order, items });
  } catch (error) {
    next(error);
  }
});

export default router;
