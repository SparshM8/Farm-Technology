import { verifyToken, extractToken } from '../utils/jwt.js';
import { getDatabase, promisifyDb } from '../db/database.js';

export async function authenticate(req, res, next) {
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const db = await getDatabase();
    const dbAsync = promisifyDb(db);
    const user = await dbAsync.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export async function adminOnly(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export function validateRequest(rules) {
  return (req, res, next) => {
    const errors = {};

    for (const [field, validators] of Object.entries(rules)) {
      const value = req.body[field];

      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
}
