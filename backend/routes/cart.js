import express from 'express';
import { getDatabase, promisifyDb } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { generateId } from '../utils/id.js';

const router = express.Router();

// Get cart
router.get('/', authenticate, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    let cart = await dbAsync.get('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);

    if (!cart) {
      const cartId = generateId();
      await dbAsync.run('INSERT INTO carts (id, user_id) VALUES (?, ?)', [cartId, req.user.id]);
      cart = { id: cartId, user_id: req.user.id };
    }

    const items = await dbAsync.all(
      'SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
      [cart.id]
    );

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.json({
      cart: { ...cart, items, total },
    });
  } catch (error) {
    next(error);
  }
});

// Add to cart
router.post('/items', authenticate, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ error: 'Invalid product or quantity' });
    }

    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    // Check product exists and has stock
    const product = await dbAsync.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Get or create cart
    let cart = await dbAsync.get('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);
    if (!cart) {
      const cartId = generateId();
      await dbAsync.run('INSERT INTO carts (id, user_id) VALUES (?, ?)', [cartId, req.user.id]);
      cart = { id: cartId };
    }

    // Check if item already in cart
    const existingItem = await dbAsync.get(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cart.id, productId]
    );

    if (existingItem) {
      await dbAsync.run(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existingItem.id]
      );
    } else {
      const itemId = generateId();
      await dbAsync.run(
        'INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES (?, ?, ?, ?)',
        [itemId, cart.id, productId, quantity]
      );
    }

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Update cart item
router.put('/items/:itemId', authenticate, async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    await dbAsync.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [
      quantity,
      req.params.itemId,
    ]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Remove from cart
router.delete('/items/:itemId', authenticate, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    await dbAsync.run('DELETE FROM cart_items WHERE id = ?', [req.params.itemId]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Clear cart
router.delete('/', authenticate, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    const cart = await dbAsync.get('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);
    if (cart) {
      await dbAsync.run('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
