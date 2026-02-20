import express from 'express';
import { getDatabase, promisifyDb } from '../db/database.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { generateId } from '../utils/id.js';
import { validators } from '../middleware/validators.js';
import { validateRequest } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post(
  '/register',
  validateRequest({
    email: [validators.required(), validators.email],
    name: [validators.required(), validators.minLength(3, 'Name must be 3+ characters')],
    password: [validators.required(), validators.minLength(6, 'Password must be 6+ characters')],
  }),
  async (req, res, next) => {
    try {
      const { email, name, password, phone } = req.body;
      const db = await getDatabase();
      const dbAsync = promisifyDb(db);

      // Check if user exists
      const existingUser = await dbAsync.get('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await hashPassword(password);
      const userId = generateId();

      await dbAsync.run(
        'INSERT INTO users (id, email, name, password, phone) VALUES (?, ?, ?, ?, ?)',
        [userId, email, name, hashedPassword, phone || null]
      );

      const token = generateToken(userId);
      res.status(201).json({
        success: true,
        token,
        user: { id: userId, email, name, phone },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  validateRequest({
    email: [validators.required(), validators.email],
    password: [validators.required()],
  }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const db = await getDatabase();
      const dbAsync = promisifyDb(db);

      const user = await dbAsync.get('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user.id);
      res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
