import express from 'express';
import { getDatabase, promisifyDb } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all products or filter by category
router.get('/', async (req, res, next) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    let query = 'SELECT * FROM products WHERE stock > 0';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const products = await dbAsync.all(query, params);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Get single product with reviews
router.get('/:id', async (req, res, next) => {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    const product = await dbAsync.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const reviews = await dbAsync.all(
      'SELECT r.id, r.rating, r.title, r.comment, r.created_at, u.name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC',
      [req.params.id]
    );

    res.json({ ...product, reviews });
  } catch (error) {
    next(error);
  }
});

// Get all categories
router.get('/categories/all', async (req, res, next) => {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    const categories = await dbAsync.all(
      'SELECT DISTINCT category FROM products ORDER BY category'
    );
    res.json(categories.map(c => c.category));
  } catch (error) {
    next(error);
  }
});

// Add review (requires authentication)
router.post('/:id/reviews', authenticate, async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    const product = await dbAsync.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const reviewId = require('uuid').v4();
    await dbAsync.run(
      'INSERT INTO reviews (id, product_id, user_id, rating, title, comment) VALUES (?, ?, ?, ?, ?, ?)',
      [reviewId, req.params.id, req.user.id, rating, title || null, comment || null]
    );

    res.status(201).json({ success: true, reviewId });
  } catch (error) {
    next(error);
  }
});

export default router;
