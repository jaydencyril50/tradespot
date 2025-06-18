import express from 'express';
import Chat from '../models/Chat';

const router = express.Router();

// GET /api/chat - Fetch all chat messages
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: 1 });
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// POST /api/chat - Save a new chat message (only)
router.post('/', async (req, res) => {
  try {
    const { userEmail, message } = req.body;
    if (!userEmail || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const chat = new Chat({ userEmail, message });
    await chat.save();
    res.status(201).json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save chat message' });
  }
});

export default router;
