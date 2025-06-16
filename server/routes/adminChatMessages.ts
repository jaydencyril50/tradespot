import express, { Request, Response } from 'express';
import ChatMessage from '../models/ChatMessage';
// Use authenticateAdmin from main index.ts
const { authenticateAdmin } = require('../index');

const router = express.Router();

// --- ADMIN: GET ALL CHAT MESSAGES ---
router.get('/api/admin/chat-messages', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const messages = await ChatMessage.find({}, 'email spotid text image createdAt').sort({ createdAt: -1 }).lean();
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

export default router;
