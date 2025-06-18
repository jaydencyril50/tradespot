import express from 'express';
import Chat from '../models/Chat';

const router = express.Router();

// POST /api/chat - Save a new chat message
router.post('/', async (req, res) => {
  try {
    const { userEmail, spotid, message, imageUrl } = req.body;
    if (!userEmail || !spotid || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const chat = new Chat({ userEmail, spotid, message, imageUrl });
    await chat.save();
    res.status(201).json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save chat message' });
  }
});

export default router;
