import express from 'express';
import { getDatabase, promisifyDb } from '../db/database.js';
import { generateId } from '../utils/id.js';

const router = express.Router();

// Submit contact form
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    const contactId = generateId();
    await dbAsync.run(
      'INSERT INTO contacts (id, name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
      [contactId, name, email, phone || null, subject, message]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon!',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
