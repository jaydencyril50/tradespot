import express, { Request, Response, NextFunction } from 'express';
import Chat from '../models/Chat';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import authenticateAdmin from '../middleware/authenticateAdmin';
import { adminRateLimiter } from '../middleware/rateLimiters';
import auditLogger from '../middleware/auditLogger';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set');
}

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: any;
}

// GET /api/chat - Fetch all chat messages
router.get('/', async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find().sort({ createdAt: 1 });
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Middleware to authenticate and attach user to req
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  jwt.verify(token, JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    req.user = user;
    next();
  });
}

// POST /api/chat - Save a new chat message (only)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const chat = new Chat({ userEmail: user.email, message });
    await chat.save();
    res.status(201).json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save chat message' });
  }
});

// GET /api/admin/chat-messages/:email - Fetch chat messages by user email
router.get('/admin/chat-messages/:email', authenticateAdmin, adminRateLimiter, auditLogger, async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const messages = await Chat.find({ userEmail: email }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// GET /api/admin/chat-messages - Fetch latest chat message per user (for admin message management)
router.get('/admin/chat-messages', authenticateAdmin, adminRateLimiter, auditLogger, async (req: Request, res: Response) => {
  try {
    // Get all chat messages, group by userEmail, keep only the latest per user
    const messages = await Chat.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userEmail",
          email: { $first: "$userEmail" },
          message: { $first: "$message" },
          imageUrl: { $first: "$imageUrl" },
          createdAt: { $first: "$createdAt" }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    // Optionally, join with User collection to get spotid
    const users = await User.find({}, 'email spotid');
    const userMap = new Map(users.map((u: { email: string; spotid: string }) => [u.email, u.spotid]));
    const result = messages.map((msg: any) => ({
      email: msg.email,
      message: msg.message,
      imageUrl: msg.imageUrl,
      createdAt: msg.createdAt,
      spotid: userMap.get(msg.email) || null
    }));
    res.json({ messages: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

export default router;
