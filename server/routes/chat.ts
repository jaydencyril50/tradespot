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

// GET /api/chat - Fetch all chat messages for a user/spotid
router.get('/', async (req, res) => {
  try {
    const { userEmail, spotid } = req.query;
    if (!userEmail || !spotid) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }
    const chats = await Chat.find({ userEmail, spotid }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

export default router;
