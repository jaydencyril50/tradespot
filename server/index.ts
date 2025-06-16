import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Announcement from './models/Announcement';
import Activity from './models/Activity';
import DepositSession from './models/DepositSession';
import ChatMessage from './models/ChatMessage';
import trashRoutes from './routes/trash';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Define ChatMessage interface for type safety
interface ChatMessage {
  email: string;
  text: string;
  image?: string;
  createdAt: Date;
}

// Helper: get chat history for a spotid
async function getChatHistory(spotid: string): Promise<any[]> {
  return await ChatMessageModel.find({ spotid }).sort({ createdAt: 1 }).lean();
}

io.on('connection', (socket) => {
  const { spotid, role } = socket.handshake.query;
  if (!spotid) {
    socket.disconnect();
    return;
  }

   // Send chat history on connect
  getChatHistory(spotid as string).then((history: any[]) => {
    socket.emit('chat_history', history.map((msg) => ({
      from: msg.email === 'admin@tradespot.com' ? 'admin' : 'user',
      text: msg.text,
      image: msg.image,
      createdAt: msg.createdAt,
      status: msg.status,
      unread: msg.unread,
      _id: msg._id,
    })));
  });

   // Listen for chat messages
  socket.on('chat_message', async (data) => {
    try {
      if (!data || !data.spotid || (!data.text && !data.image) || !data.from) return;
      let email = '';
      let userId = null;

      if (data.from === 'admin') {
        email = 'admin@tradespot.com';
      } else {
        const user = await User.findOne({ spotid: data.spotid });
        if (!user) {
          socket.emit('chat_error', { error: 'User not found' });
          return;
        }
        email = user.email;
        userId = user._id;
      }
        const chatMsg = new ChatMessage({
        userId: data.from === 'admin' ? null : userId,
        spotid: data.spotid,
        email,
        text: data.text,
        image: data.image,
        status: 'sent',
        unread: true,
      });
      await chatMsg.save();

     // Broadcast to all sockets in this chat
      io.sockets.sockets.forEach(s => {
        if (s.handshake.query.spotid === data.spotid) {
          s.emit('chat_message', {
            from: data.from,
            text: data.text,
            image: data.image,
            createdAt: chatMsg.createdAt,
            status: chatMsg.status,
            unread: chatMsg.unread,
            _id: chatMsg._id,
          });
        }
      });
    } catch (err) {
      socket.emit('chat_error', { error: 'Failed to send message' });
    }
  });
});

const MONGO_URI = process.env.MONGO_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;

mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err: any) => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    wallet: String,
    usdtBalance: { type: Number, default: 0 },
    spotBalance: { type: Number, default: 0 },
    recentTransactions: {
        type: [
            {
                type: { type: String },
                amount: Number,
                currency: String,
                date: Date
            }
        ],
        default: []
    },
    profilePicture: String, // Add profilePicture field to schema
    referralCode: { type: String, unique: true, required: true },
    referredBy: String, // referral code of the user who referred
    teamMembers: [
        {
            userId: mongoose.Schema.Types.ObjectId,
            joinedAt: Date
        }
    ],
    spotid: { type: String, unique: true, required: true }, // Add spotid field
    fundsLocked: { type: Boolean, default: false } // Add this field
});
userSchema.add({
    twoFA: {
        enabled: { type: Boolean, default: false },
        secret: { type: String, default: '' },
    }
});
// Add a TypeScript interface for the User document to fix property errors
interface IUser extends mongoose.Document {
    fullName: string;
    email: string;
    password: string;
    wallet: string;
    usdtBalance: number;
    spotBalance: number;
    recentTransactions: Array<any>;
    profilePicture?: string;
    referralCode: string;
    referredBy?: string;
    teamMembers: Array<{ userId: mongoose.Types.ObjectId; joinedAt: Date }>;
    spotid: string;
    twoFA?: {
        enabled: boolean;
        secret?: string;
    };
    fundsLocked: boolean;
}

const User = mongoose.model<IUser>('User', userSchema);

// Stock schema (available stocks in the market)
const stockSchema = new mongoose.Schema({
    name: String,
    price: Number, // price in SPOT
    profit: { type: Number, default: 0.02 }, // daily profit rate (2%)
    purchaseAmount: Number, // minimum purchase amount in SPOT
    durationDays: { type: Number, default: 365 }, // e.g. 365
    createdAt: { type: Date, default: Date.now }
});
const Stock = mongoose.model('Stock', stockSchema);

// StockPurchase schema (user's purchased stocks)
const stockPurchaseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
    purchaseAmount: Number, // in SPOT
    profit: Number, // daily profit rate
    startDate: { type: Date, default: Date.now },
    expiresAt: Date,
    completed: { type: Boolean, default: false },
    lastCredited: Date, // last date profit was credited
    totalCredited: { type: Number, default: 0 }
});
const StockPurchase = mongoose.model('StockPurchase', stockPurchaseSchema);

// Notification schema (user notifications)
const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', notificationSchema);

// Withdrawal schema (user withdrawal requests)
const withdrawalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    spotid: String,
    wallet: String,
    amount: Number,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

// --- CHAT MESSAGE MODEL ---
// Remove duplicate import and model definition
const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  spotid: String,
  email: String,
  text: String,
  image: String
}, { timestamps: true });

const ChatMessageModel = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

// Utility to wrap async route handlers
function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Helper to log activity
type ActivityType =
  | 'USER_SIGNUP'
  | 'WITHDRAWAL_SUBMITTED'
  | 'DEPOSIT'
  | 'USER_UPDATE'
  | 'STOCK_PURCHASE'
  | 'TRANSFER';
async function logActivity(type: ActivityType, user: any, details?: any) {
  await Activity.create({
    type,
    user: {
      fullName: user.fullName,
      email: user.email,
      spotid: user.spotid,
      _id: user._id,
    },
    details,
  });
}

app.post('/auth/register', async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password, wallet, referredBy } = req.body;
    if (!fullName || !email || !password || !wallet || !referredBy) {
        res.status(400).json({ error: 'All fields required, including referral link' });
        return;
    }
    // Check that referredBy exists in the database
    const referrer = await User.findOne({ referralCode: referredBy });
    if (!referrer) {
        res.status(400).json({ error: 'Referral link is invalid or does not exist' });
        return;
    }
    const existing = await User.findOne({ email });
    if (existing) {
        res.status(400).json({ error: 'Email already exists' });
        return;
    }
    // Check for duplicate wallet address
    const walletExists = await User.findOne({ wallet });
    if (walletExists) {
        res.status(400).json({ error: 'Wallet address already exists' });
        return;
    }
    // Generate a unique 6-character referral code
    let referralCode;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    do {
        referralCode = Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (await User.findOne({ referralCode }));

    // Generate a unique 7-digit spotid
    let spotid;
    do {
        spotid = Math.floor(1000000 + Math.random() * 9000000).toString(); // 7 digits
    } while (await User.findOne({ spotid }));

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, password: hash, wallet, usdtBalance: 0, spotBalance: 0, referralCode, referredBy, spotid });
    await user.save();

    // Add this user to the referrer's teamMembers
    referrer.teamMembers.push({ userId: user._id as mongoose.Types.ObjectId, joinedAt: new Date() });
    await referrer.save();
    // Log activity
    await logActivity('USER_SIGNUP', user, { referralCode, spotid });
    res.json({ message: 'User registered successfully', referralCode, spotid });
});

app.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password, twoFAToken } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) {
        res.status(400).json({ error: 'Invalid credentials' });
        return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        res.status(400).json({ error: 'Invalid credentials' });
        return;
    }
    if (user.twoFA && user.twoFA.enabled) {
        if (!twoFAToken) {
            res.status(401).json({ error: '2FA required' });
            return;
        }
        const verified = speakeasy.totp.verify({
            secret: user.twoFA.secret || '',
            encoding: 'base32',
            token: twoFAToken,
            window: 1
        });
        if (!verified) {
            res.status(401).json({ error: 'Invalid 2FA code' });
            return;
        }
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, wallet: user.wallet, usdtBalance: user.usdtBalance, spotBalance: user.spotBalance } });
});

// Admin login endpoint
app.post('/auth/admin/login', async function (req: Request, res: Response) {
    const { email, password } = req.body;
    // Replace with your admin credentials or admin user lookup
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tradespot.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (email !== adminEmail || password !== adminPassword) {
        res.status(401).json({ error: 'Invalid admin credentials' });
        return;
    }
    // Issue a JWT token for admin
    const token = jwt.sign({ admin: true, email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
});

// JWT authentication middleware
function authenticateToken(req: Request, res: Response, next: Function): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            res.status(403).json({ error: 'Invalid token' });
            return;
        }
        (req as any).user = user;
        next();
        return;
    });
}

// Admin middleware (simple: checks JWT for admin: true)
function authenticateAdmin(req: Request, res: Response, next: Function): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err || !user || !user.admin) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        (req as any).admin = user;
        next();
    });
}

// Example protected route
app.get('/api/portfolio', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    res.json({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        wallet: user.wallet,
        usdtBalance: user.usdtBalance,
        spotBalance: user.spotBalance,
        recentTransactions: user.recentTransactions ? user.recentTransactions.slice(-5).reverse() : [],
        profilePicture: user.profilePicture, // Include profilePicture in response
        fundsLocked: user.fundsLocked // Add fundsLocked to response
    });
});

app.put('/api/portfolio', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId;
    const { profilePicture } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (profilePicture) {
            user.profilePicture = profilePicture;
        }
        await user.save();
        // Log activity for profile update
        await logActivity('USER_UPDATE', user, { updated: 'profilePicture' });
        res.json({ message: 'Profile updated', profilePicture: user.profilePicture });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Convert endpoint: USDT <-> SPOT
app.post('/api/convert', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId;
    const { direction, amount } = req.body;
    const CONVERT_RATE = 500;
    if (!direction || !amount || isNaN(amount) || amount <= 0) {
        res.status(400).json({ error: 'Invalid conversion request' });
        return;
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (direction === 'USDT_TO_SPOT') {
            if (user.usdtBalance < amount) {
                res.status(400).json({ error: 'Insufficient USDT balance' });
                return;
            }
            user.usdtBalance -= amount;
            user.spotBalance += amount / CONVERT_RATE;
            user.recentTransactions.push({ type: 'Convert', amount: amount / CONVERT_RATE, currency: 'SPOT', date: new Date() });
            await user.save();
            res.json({ message: `Converted ${amount} USDT to ${(amount / CONVERT_RATE)} SPOT.`, usdtBalance: user.usdtBalance, spotBalance: user.spotBalance });
        } else if (direction === 'SPOT_TO_USDT') {
            if (user.spotBalance < amount) {
                res.status(400).json({ error: 'Insufficient SPOT balance' });
                return;
            }
            user.spotBalance -= amount;
            user.usdtBalance += amount * CONVERT_RATE;
            user.recentTransactions.push({ type: 'Convert', amount, currency: 'USDT', date: new Date() });
            await user.save();
            res.json({ message: `Converted ${amount} SPOT to ${amount * CONVERT_RATE} USDT.`, usdtBalance: user.usdtBalance, spotBalance: user.spotBalance });
        } else {
            res.status(400).json({ error: 'Invalid conversion direction' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Conversion failed' });
    }
});

// Team info endpoint
app.get('/api/team', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    // Build referral link
    const referralLink = `https://tradespot.online/register?ref=${user.referralCode}`;
    // Get team members' info
    const members = await Promise.all(
        (user.teamMembers || []).map(async (tm: any) => {
            const member = await User.findById(tm.userId);
            if (!member) return null;
            // Check if member has any active stock purchase
            const hasActiveStock = await StockPurchase.exists({ userId: member._id, completed: false });
            return {
                id: member._id,
                fullName: member.fullName,
                email: member.email,
                joinedAt: tm.joinedAt,
                activeStock: !!hasActiveStock
            };
        })
    );
    res.json({ referralLink, members: members.filter(Boolean) });
});

// Validate referral code endpoint
app.get('/api/validate-referral/:code', async (req: Request, res: Response) => {
    const code = req.params.code;
    // Case-insensitive match for referral code
    const user = await User.findOne({ referralCode: { $regex: `^${code}$`, $options: 'i' } });
    if (user) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});

// Endpoint: Get available stocks
app.get('/api/stock', async (req: Request, res: Response) => {
    const stocks = await Stock.find();
    res.json(stocks);
});

// Endpoint: Purchase stock
app.post('/api/stock/purchase', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { stockId } = req.body;
    const user = await User.findById(userId);
    const stock = await Stock.findById(stockId);
    if (!user || !stock) {
        res.status(404).json({ error: 'User or stock not found' });
        return;
    }
    if (typeof stock.purchaseAmount !== 'number' || typeof stock.durationDays !== 'number' || typeof stock.profit !== 'number') {
        res.status(400).json({ error: 'Stock data is invalid' });
        return;
    }
    if (user.spotBalance < stock.purchaseAmount) {
        res.status(400).json({ error: 'Insufficient SPOT balance' });
        return;
    }
    // Deduct spot balance
    user.spotBalance -= stock.purchaseAmount;
    user.recentTransactions.push({ type: 'Stock Purchase', amount: stock.purchaseAmount, currency: 'SPOT', date: new Date() });
    await user.save();
    // Create purchase record
    const expiresAt = new Date(Date.now() + stock.durationDays * 24 * 60 * 60 * 1000);
    const purchase = new StockPurchase({
        userId,
        stockId: stock._id,
        purchaseAmount: stock.purchaseAmount,
        profit: stock.profit,
        startDate: new Date(),
        expiresAt,
        lastCredited: new Date(),
        completed: false
    });
    await purchase.save();

    // Referral reward: credit 5% of purchase amount to referrer if exists
    if (user.referredBy) {
        const referrer = await User.findOne({ referralCode: user.referredBy });
        if (referrer) {
            const reward = +(stock.purchaseAmount * 0.05);
            referrer.spotBalance += reward;
            referrer.recentTransactions = referrer.recentTransactions || [];
            referrer.recentTransactions.push({
                type: 'Referral Reward',
                amount: reward,
                currency: 'SPOT',
                date: new Date(),
                from: user.email,
                note: `5% reward from team member stock purchase`
            });
            await referrer.save();
        }
    }

    // Notify user of stock purchase
    await Notification.create({
        userId: user._id,
        message: `You purchased stock plan '${stock.name}' for ${stock.purchaseAmount} SPOT.`,
        read: false
    });
    // Log activity
    await logActivity('STOCK_PURCHASE', user, { stockId: stock._id, amount: stock.purchaseAmount });
    res.json({ message: 'Stock purchased successfully', purchase });
});

// Endpoint: Get user's stock purchase history (active and completed)
app.get('/api/stock/history', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const purchases = await StockPurchase.find({ userId }).populate('stockId');
    const result = purchases.map((p: any) => ({
        stockName: p.stockId?.name || '',
        purchaseAmount: p.purchaseAmount,
        completed: p.completed,
        startDate: p.startDate,
        expiresAt: p.expiresAt
    }));
    res.json(result);
});

// Cron job: credit daily profit and mark completed stocks
cron.schedule('0 0 * * *', async () => {
    // Runs every day at 00:00 UTC
    const now = new Date();
    const purchases = await StockPurchase.find({ completed: false });
    for (const p of purchases) {
        if (typeof p.expiresAt !== 'object' || !(p.expiresAt instanceof Date)) continue;
        if (now >= p.expiresAt) {
            p.completed = true;
            await p.save();
            continue;
        }
        // Only credit if lastCredited is before today
        const last = p.lastCredited || p.startDate;
        const lastDate = new Date(last);
        if (lastDate.toDateString() === now.toDateString()) continue;
        // Credit daily profit
        if (typeof p.purchaseAmount !== 'number' || typeof p.profit !== 'number') continue;
        const dailyProfit = Number(p.purchaseAmount) * Number(p.profit);
        await User.findByIdAndUpdate(p.userId, {
            $inc: { spotBalance: dailyProfit },
            $push: { recentTransactions: { type: 'Stock Profit', amount: dailyProfit, currency: 'SPOT', date: now } }
        });
        p.lastCredited = now;
        p.totalCredited += dailyProfit;
        await p.save();
    }
    console.log('Daily stock profit credited at', now.toISOString());
}, { timezone: 'UTC' });

// Cron job: regenerate 50 randomized stock plans every hour
cron.schedule('0 * * * *', async () => {
    // Remove all existing plans
    await Stock.deleteMany({});
    const now = new Date();
    const planRanges = [
        [0.06, 0.1], [0.1, 0.4], [0.4, 1], [1, 2.5], [2.5, 5],
        [5, 7.5], [7.5, 10], [10, 12.5], [12.5, 15], [15, 20]
    ];
    const adjectives = [
        'Mega', 'Ultra', 'Prime', 'Elite', 'Quantum', 'Nova', 'Titan', 'Apex', 'Zenith', 'Vortex',
        'Pinnacle', 'Genesis', 'Vertex', 'Pulse', 'Matrix', 'Fusion', 'Blaze', 'Aurora', 'Spectra', 'Eclipse',
        'Ignite', 'Radiant', 'Stellar', 'Nebula', 'Legend', 'Hyper', 'Supreme', 'Infinity', 'Velocity', 'Synergy',
        'Crystal', 'Phantom', 'Mirage', 'Odyssey', 'Phoenix', 'Storm', 'Glory', 'Victory', 'Turbo', 'Flash',
        'Blitz', 'Stratos', 'Nimbus', 'Orbit', 'Cosmic', 'Pulse', 'Vivid', 'Spark', 'Surge', 'Drift',
        // Added new names
        'Obsidian', 'Prism', 'Catalyst', 'NovaCore', 'Equinox', 'Tempest', 'Ionix', 'Ascend', 'Rogue',
        'Singularity', 'Pulsefire', 'Halo', 'Lumen', 'Warp', 'Eon', 'Crimson', 'Zypher', 'OmegaX', 'Mythos',
        'EclipseX', 'Arcadia', 'Xeno', 'Ember', 'Cypher', 'Tundra', 'Reactor', 'Aether', 'Onyx', 'Bolt'
    ];
    const usedNames = new Set();
    let plans = [];
    for (let i = 0; i < planRanges.length; i++) {
        const [min, max] = planRanges[i];
        for (let j = 0; j < 5; j++) {
            // Random purchase amount in range
            const purchaseAmount = +(Math.random() * (max - min) + min).toFixed(4);
            // Random profit between 3.5% and 4%
            const profit = +(Math.random() * (0.04 - 0.035) + 0.035).toFixed(4);
            // Unique name
            let name;
            do {
                const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
                name = `${adj} Plan ${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${Math.floor(Math.random()*10000)}`;
            } while (usedNames.has(name));
            usedNames.add(name);
            plans.push({
                name,
                price: purchaseAmount,
                profit,
                purchaseAmount,
                durationDays: 60,
                createdAt: now
            });
        }
    }
    await Stock.insertMany(plans);
    console.log('Regenerated 50 random stock plans at', now.toISOString());

    // Notify all users of market refresh
    const allUsers = await User.find({}, '_id');
    for (const u of allUsers) {
      await Notification.create({
        userId: u._id,
        message: 'Market refreshed: New stock plans are now available.',
        read: false
      });
    }
});

app.post('/api/transfer', authenticateToken, (req: Request, res: Response) => {
    (async () => {
        try {
            const senderId = (req as any).user.userId;
            const { recipientEmail, amount, twoFAToken } = req.body;
            if (!recipientEmail || !amount || isNaN(amount) || amount <= 0 || !twoFAToken) {
                res.status(400).json({ error: 'Recipient email, valid amount, and 2FA code are required' });
                return;
            }
            const sender = await User.findById(senderId);
            if (!sender) { res.status(404).json({ error: 'Sender not found' }); return; }
            if (sender.email === recipientEmail) { res.status(400).json({ error: 'Cannot transfer to yourself' }); return; }
            if (sender.spotBalance < amount) { res.status(400).json({ error: 'Insufficient SPOT balance' }); return; }
            // Require 2FA enabled and valid code
            if (!sender.twoFA || !sender.twoFA.enabled || !sender.twoFA.secret) {
                res.status(400).json({ error: '2FA must be enabled to transfer funds' });
                return;
            }
            const verified = speakeasy.totp.verify({
                secret: sender.twoFA.secret,
                encoding: 'base32',
                token: twoFAToken,
                window: 1
            });
            if (!verified) {
                res.status(400).json({ error: 'Invalid 2FA code' });
                return;
            }
            const recipient = await User.findOne({ email: recipientEmail });
            if (!recipient) { res.status(404).json({ error: 'Recipient not found' }); return; }
            sender.spotBalance -= amount;
            recipient.spotBalance += amount;
            sender.recentTransactions.push({ type: 'Transfer Out', amount, currency: 'SPOT', date: new Date(), to: recipientEmail });
            recipient.recentTransactions.push({ type: 'Transfer In', amount, currency: 'SPOT', date: new Date(), from: sender.email });
            await sender.save();
            await recipient.save();
            // Notify both sender and recipient
            await Notification.create({
                userId: sender._id,
                message: `You sent ${amount} SPOT to ${recipientEmail}.`,
                read: false
            });
            await Notification.create({
                userId: recipient._id,
                message: `You received ${amount} SPOT from ${sender.email}.`,
                read: false
            });
            // Log activity
            await logActivity('TRANSFER', sender, { recipientEmail, amount });
            res.json({ message: `Transferred ${amount} SPOT to ${recipientEmail}` });
        } catch (err) {
            res.status(500).json({ error: 'Transfer failed' });
        }
    })();
});

// Helper: 10 min expiry in ms
const CODE_EXPIRY_MS = 10 * 60 * 1000;

// Helper: set code with timestamp
type CodeWithTime = { code: string, created: number };
function setCode(globalKey: string, email: string, code: string) {
    (global as any)[globalKey] = (global as any)[globalKey] || {};
    (global as any)[globalKey][email] = { code, created: Date.now() };
}
// Helper: get code object
type CodeObj = { code: string, created: number };
function getCode(globalKey: string, email: string): CodeObj | undefined {
    const codes = (global as any)[globalKey] || {};
    return codes[email];
}
// Helper: delete code
function deleteCode(globalKey: string, email: string) {
    const codes = (global as any)[globalKey] || {};
    delete codes[email];
}
// Helper: verify code and expiry
function verifyCode(globalKey: string, email: string, inputCode: string): boolean {
    const obj = getCode(globalKey, email);
    if (!obj) return false;
    if (obj.code !== inputCode) return false;
    if (Date.now() - obj.created > CODE_EXPIRY_MS) {
        deleteCode(globalKey, email);
        return false;
    }
    return true;
}

// --- NAME CHANGE ---
app.post('/api/send-name-verification', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user || typeof user.email !== 'string') {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCode('nameChangeCodes', user.email, code);
    // Send email
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your Name Change Verification Code',
            html: getStyledEmailHtml(
              'Name Change Verification',
              `Your verification code is: <b style="font-size:20px;color:#1e3c72;">${code}</b>`
            )
        });
        res.json({ message: 'Verification code sent' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/api/change-name', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { newName, code } = req.body;
    const user = await User.findById(userId);
    if (!user || typeof user.email !== 'string') {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    if (!verifyCode('nameChangeCodes', user.email, code)) {
        res.status(400).json({ error: 'Invalid or expired verification code' });
        return;
    }
    user.fullName = newName;
    await user.save();
    deleteCode('nameChangeCodes', user.email);
    // Log activity
    await logActivity('USER_UPDATE', user, { changedFields: ['fullName'] });
    res.json({ message: 'Name updated successfully' });
});

// --- EMAIL CHANGE ---
app.post('/api/send-email-verification', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user || typeof user.email !== 'string') {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCode('emailChangeCodes', user.email, code);
    // Send email
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your Email Change Verification Code',
            html: getStyledEmailHtml(
              'Email Change Verification',
              `Your email change verification code is: <b style="font-size:20px;color:#1e3c72;">${code}</b>`
            )
        });
        res.json({ message: 'Verification code sent' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/api/change-email', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { newEmail, spotid } = req.body;
    const user = await User.findById(userId);
    if (!user || typeof user.email !== 'string') {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    // Check spotid matches
    if (user.spotid !== spotid) {
        res.status(400).json({ error: 'Invalid spotid' });
        return;
    }
    // Check if new email already exists
    const existing = await User.findOne({ email: newEmail });
    if (existing) {
        res.status(400).json({ error: 'Email already exists' });
        return;
    }
    user.email = newEmail;
    await user.save();
    // Log activity
    await logActivity('USER_UPDATE', user, { changedFields: ['email'] });
    res.json({ message: 'Email updated successfully' });
});

// --- WALLET CHANGE ---
app.post('/api/send-wallet-verification', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user || typeof user.email !== 'string') {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCode('walletChangeCodes', user.email, code);
    // Send email
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Wallet Change Verification Code',
            html: getStyledEmailHtml(
              'Wallet Change Verification',
              `Your wallet change verification code is: <b style="font-size:20px;color:#1e3c72;">${code}</b>`
            )
        });
        res.json({ message: 'Verification code sent' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/api/change-wallet', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { newWallet, code, spotid, twoFAToken } = req.body;
    const user = await User.findById(userId);
    if (!user || typeof user.email !== 'string') {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    // Validate all required fields
    if (!newWallet || !code || !spotid || !twoFAToken) {
        res.status(400).json({ error: 'newWallet, code, spotid, and twoFAToken are required' });
        return;
    }
    // Validate spotid
    if (user.spotid !== spotid) {
        res.status(400).json({ error: 'Invalid spotid' });
        return;
    }
    // Validate 2FA code (always required)
    let secret = '';
    if (user.twoFA && user.twoFA.secret) {
        secret = user.twoFA.secret;
    }
    if (!secret) {
        res.status(400).json({ error: '2FA is not set up for this account' });
        return;
    }
    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: twoFAToken,
        window: 1
    });
    if (!verified) {
        res.status(400).json({ error: 'Invalid 2FA code' });
        return;
    }
    if (!verifyCode('walletChangeCodes', user.email, code)) {
        res.status(400).json({ error: 'Invalid or expired verification code' });
        return;
    }
    // Check if new wallet already exists
    const existing = await User.findOne({ wallet: newWallet });
    if (existing) {
        res.status(400).json({ error: 'Wallet address already exists' });
        return;
    }
    user.wallet = newWallet;
    await user.save();
    deleteCode('walletChangeCodes', user.email);
    // Log activity
    await logActivity('USER_UPDATE', user, { changedFields: ['wallet'] });
    res.json({ message: 'Wallet updated successfully' });
});

// --- PASSWORD CHANGE ---
app.post('/api/send-password-verification', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user || typeof user.email !== 'string') {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCode('passwordChangeCodes', user.email, code);
    // Send email
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Change Verification Code',
            html: getStyledEmailHtml(
              'Password Change Verification',
              `Your password change verification code is: <b style="font-size:20px;color:#1e3c72;">${code}</b>`
            )
        });
        res.json({ message: 'Verification code sent' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/api/change-password', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { newPassword, code, spotid } = req.body; // REMOVE twoFAToken
    const user = await User.findById(userId);
    if (!user || typeof user.email !== 'string') {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    if (!newPassword || !code || !spotid) {
        res.status(400).json({ error: 'newPassword, code, and spotid are required' });
        return;
    }
    if (user.spotid !== spotid) {
        res.status(400).json({ error: 'Invalid spotid' });
        return;
    }
    // REMOVE 2FA checks for password change
    if (!verifyCode('passwordChangeCodes', user.email, code)) {
        res.status(400).json({ error: 'Invalid or expired verification code' });
        return;
    }
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();
    deleteCode('passwordChangeCodes', user.email);
    res.json({ message: 'Password updated successfully' });
});

// --- WITHDRAWAL ---
app.post('/api/send-withdrawal-verification', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user || typeof user.email !== 'string') {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCode('withdrawalCodes', user.email, code);
    // Send email
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Withdrawal Verification Code',
            html: getStyledEmailHtml(
              'Withdrawal Verification',
              `Your withdrawal verification code is: <b style="font-size:20px;color:#1e3c72;">${code}</b>`
            )
        });
        res.json({ message: 'Verification code sent' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/api/withdraw', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { amount, verificationCode, twoFACode } = req.body;
    if (!amount || isNaN(amount) || amount < 10) {
        res.status(400).json({ error: 'Minimum withdrawal amount is 10 USDT' });
        return;
    }
    const user = await User.findById(userId);
    if (!user || typeof user.email !== 'string') {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    if (user.usdtBalance < amount) {
        res.status(400).json({ error: 'Insufficient USDT balance' });
        return;
    }
    // Check withdrawal verification code
    const codes = (global as any).withdrawalCodes || {};
    const emailKey = user.email;
    if (!emailKey || !codes[emailKey] || codes[emailKey].code !== verificationCode) {
        res.status(400).json({ error: 'Invalid or expired verification code' });
        return;
    }
    // Check 2FA
    let secret = '';
    if (user.twoFA && user.twoFA.secret) {
        secret = user.twoFA.secret;
    }
    if (!secret) {
        res.status(400).json({ error: '2FA is not set up for this account' });
        return;
    }
    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: twoFACode,
        window: 1
    });
    if (!verified) {
        res.status(400).json({ error: 'Invalid 2FA code' });
        return;
    }
    // Deduct balance and log transaction
    user.usdtBalance -= amount;
    user.recentTransactions = user.recentTransactions || [];
    user.recentTransactions.push({
        type: 'Withdraw',
        amount,
        currency: 'USDT',
        date: new Date()
    });
    await user.save();
    delete codes[emailKey];
    // Create withdrawal request for admin review
    await Withdrawal.create({
        userId: user._id,
        spotid: user.spotid,
        wallet: user.wallet,
        amount,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
    });
    // Notify user of withdrawal
    await Notification.create({
        userId: user._id,
        message: `Withdrawal of ${amount} USDT requested successfully.`,
        read: false
    });
    // Log activity
    await logActivity('WITHDRAWAL_SUBMITTED', user, { amount });
    res.json({ message: 'Withdrawal request submitted successfully.' });
});

// --- Deposit endpoints ---
// Remove demo in-memory pendingDeposits

// (import removed to avoid duplicate identifier error)

// Start a deposit session (real, DB-backed)
app.post('/api/deposit/start', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { amount } = req.body;
  if (!amount || isNaN(amount) || amount < 10) {
    res.status(400).json({ error: 'Minimum deposit is 10 USDT' });
    return;
  }
  // Only one pending deposit per user at a time (not expired, not credited)
  const now = new Date();
  const existingSession = await DepositSession.findOne({
    userId,
    credited: { $in: [false, null] },
    expiresAt: { $gt: now },
  });
  if (existingSession) {
    return res.json({
      address: existingSession.address,
      expiresAt: existingSession.expiresAt.getTime(),
      sessionId: existingSession._id,
    });
  }
  // Create new session
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const address = 'TSNHcwrdH83nh16RGdFQizYKQaDUyTnd7W';
  const session = await DepositSession.create({
    userId,
    amount: Number(amount),
    address,
    createdAt: now,
    credited: false,
    expiresAt,
  });
  res.json({ address, expiresAt: expiresAt.getTime(), sessionId: session._id });
});

// Poll for deposit status (real detection only)
app.get('/api/deposit/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Find the most recent pending deposit session for this user
    const session = await DepositSession.findOne({
      userId: (req as any).user._id,
      credited: { $in: [false, null] },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!session) {
      // No pending session found, check if any session expired recently
      const expired = await DepositSession.findOne({
        userId: (req as any).user._id,
        credited: false,
        expiresAt: { $lte: new Date() },
      }).sort({ createdAt: -1 });
      if (expired) {
        return res.json({ status: 'failed' });
      }
      return res.json({ status: 'failed' });
    }
    if (session.credited) {
      return res.json({ status: 'success' });
    }
    // Still pending
    return res.json({ status: 'pending' });
  } catch (err) {
    return res.status(500).json({ status: 'failed', error: 'Server error' });
  }
});

// Admin: Get all users
app.get('/api/admin/users', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const users = await User.find({}, 'fullName email spotid wallet usdtBalance spotBalance');
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Admin: Update user details
app.put('/api/admin/users/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { fullName, email, spotid, wallet, usdtBalance, spotBalance } = req.body;
    try {
        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Check for unique email, wallet, spotid (if changed)
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) {
                res.status(400).json({ error: 'Email already exists' });
                return;
            }
            user.email = email;
        }
        if (wallet && wallet !== user.wallet) {
            const exists = await User.findOne({ wallet });
            if (exists) {
                res.status(400).json({ error: 'Wallet address already exists' });
                return;
            }
            user.wallet = wallet;
        }
        if (spotid && spotid !== user.spotid) {
            const exists = await User.findOne({ spotid });
            if (exists) {
                res.status(400).json({ error: 'Spot ID already exists' });
                return;
            }
            user.spotid = spotid;
        }
        if (typeof fullName === 'string') user.fullName = fullName;
        if (typeof usdtBalance === 'number') user.usdtBalance = usdtBalance;
        if (typeof spotBalance === 'number') user.spotBalance = spotBalance;

        await user.save();
        // Log activity for admin user update
        await logActivity('USER_UPDATE', user, { updatedBy: 'admin', updatedFields: { fullName, email, spotid, wallet, usdtBalance, spotBalance } });
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// --- ADMIN: GET ALL ACTIVE STOCK PLANS ---
app.get('/api/admin/active-stocks', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    // Find all active (not completed) stock purchases, join with user info
    const activePurchases = await StockPurchase.find({ completed: false })
      .populate('userId', 'email spotid')
      .lean();
    // Map to required fields for frontend
    const result = activePurchases.map((purchase: any) => ({
      _id: purchase._id,
      email: purchase.userId?.email || '',
      spotid: purchase.userId?.spotid || '',
      purchaseAmount: purchase.purchaseAmount,
      dailyProfits: typeof purchase.purchaseAmount === 'number' && typeof purchase.profit === 'number'
        ? Number(purchase.purchaseAmount) * Number(purchase.profit)
        : 0,
    }));
    res.json({ activeStocks: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active stock plans' });
  }
});

// --- ADMIN: UPDATE ACTIVE STOCK PLAN AMOUNT ---
app.put('/api/admin/active-stocks/:id', authenticateAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { purchaseAmount } = req.body;
  if (typeof purchaseAmount !== 'number' || purchaseAmount <= 0) {
    res.status(400).json({ error: 'Invalid purchase amount' });
    return;
  }
  try {
    const purchase = await StockPurchase.findById(id);
    if (!purchase) {
      res.status(404).json({ error: 'Stock plan not found' });
      return;
    }
    purchase.purchaseAmount = purchaseAmount;
    await purchase.save();
    res.json({ message: 'Stock plan updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock plan' });
  }
});

// --- ADMIN: GET ALL STOCK PLANS (active and completed) ---
app.get('/api/admin/all-stock-plans', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    // Find all stock purchases, join with user info
    const allPurchases = await StockPurchase.find({})
      .populate('userId', 'email spotid')
      .lean();
    // Map to required fields for frontend
    const result = allPurchases.map((purchase: any) => ({
      _id: purchase._id,
      email: purchase.userId?.email || '',
      spotid: purchase.userId?.spotid || '',
      purchaseAmount: purchase.purchaseAmount,
      dailyProfits: typeof purchase.purchaseAmount === 'number' && typeof purchase.profit === 'number'
        ? Number(purchase.purchaseAmount) * Number(purchase.profit)
        : 0,
      completed: purchase.completed || false,
    }));
    res.json({ stockPlans: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock plans' });
  }
});

// --- ADMIN: UPDATE STOCK PLAN (purchaseAmount, dailyProfits, completed) ---
app.put('/api/admin/stock-plan/:id', authenticateAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { purchaseAmount, dailyProfits, completed } = req.body;
  if (typeof purchaseAmount !== 'number' || purchaseAmount <= 0) {
    res.status(400).json({ error: 'Invalid purchase amount' });
    return;
  }
  try {
    const purchase = await StockPurchase.findById(id);
    if (!purchase) {
      res.status(404).json({ error: 'Stock plan not found' });
      return;
    }
    purchase.purchaseAmount = purchaseAmount;
    if (typeof dailyProfits === 'number') {
      // Update profit rate to match new dailyProfits
      purchase.profit = purchase.purchaseAmount > 0 ? dailyProfits / purchase.purchaseAmount : 0;
    }
    if (typeof completed === 'boolean') {
      purchase.completed = completed;
    }
    await purchase.save();
    res.json({ message: 'Stock plan updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock plan' });
  }
});

// --- ADMIN: DELETE STOCK PLAN ---
app.delete('/api/admin/stock-plan/:id', authenticateAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const purchase = await StockPurchase.findById(id);
    if (!purchase) {
      res.status(404).json({ error: 'Stock plan not found' });
      return;
    }
    await purchase.deleteOne();
    res.json({ message: 'Stock plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete stock plan' });
  }
});

// Admin: Get all withdrawal requests
app.get('/admin/withdrawals', asyncHandler(async (req: Request, res: Response) => {
    // TODO: Add admin authentication
    const withdrawals = await Withdrawal.find().populate('userId', 'spotid wallet email');
    res.json({ withdrawals });
}));

// Admin: Approve withdrawal
app.post('/admin/withdrawals/:id/approve', asyncHandler(async (req: Request, res: Response) => {
    // TODO: Add admin authentication
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    withdrawal.status = 'approved';
    withdrawal.updatedAt = new Date();
    await withdrawal.save();
    // Optionally notify user of approval
    await Notification.create({
        userId: withdrawal.userId,
        message: `Your withdrawal of ${withdrawal.amount} USDT has been approved.`
    });
    res.json({ message: 'Withdrawal approved' });
}));

// Admin: Reject withdrawal
app.post('/admin/withdrawals/:id/reject', asyncHandler(async (req: Request, res: Response) => {
    // TODO: Add admin authentication
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    withdrawal.status = 'rejected';
    withdrawal.updatedAt = new Date();
    await withdrawal.save();
    // Notify user of rejection
    await Notification.create({
        userId: withdrawal.userId,
        message: `Your withdrawal of ${withdrawal.amount} USDT was rejected by admin.`
    });
    res.json({ message: 'Withdrawal rejected and user notified' });
}));

// --- ANNOUNCEMENT ENDPOINTS ---
app.get('/api/announcement', async (req: Request, res: Response) => {
  try {
    let announcement = await Announcement.findOne();
    if (!announcement) {
      announcement = await Announcement.create({ notice: '' });
    }
    res.json({ notice: announcement.notice });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
});

// Set/update the announcement
app.post('/api/announcement', async (req: Request, res: Response) => {
  const { notice } = req.body;
  try {
    let announcement = await Announcement.findOne();
    if (!announcement) {
      announcement = await Announcement.create({ notice });
    } else {
      announcement.notice = notice;
      announcement.updatedAt = new Date();
      await announcement.save();
    }
    // Notify all users of the new announcement
    const users = await User.find({}, '_id');
    const notifications = users.map((u: any) => ({
      userId: u._id,
      message: `Announcement: ${notice}`,
      read: false
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    res.json({ message: 'Announcement updated', notice: announcement.notice });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// --- CHAT MESSAGE ENDPOINT ---
app.post('/api/chat/send', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { text, image } = req.body;
  if (!text && !image) {
    return res.status(400).json({ error: 'Message text or image required' });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const chatMsg = new ChatMessageModel({
    userId: user._id,
    spotid: user.spotid,
    email: user.email,
    text,
    image
  });
  await chatMsg.save();
  res.json({ message: 'Message sent', chatMsg });
}));

// --- USER: SEND MESSAGE ---
app.post('/api/chat-messages/:spotid', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { spotid } = req.params;
  const { text, image } = req.body;
  if (!text && !image) return res.status(400).json({ error: 'Message text or image required' });
  const user = await User.findById(userId);
  if (!user || user.spotid !== spotid) return res.status(404).json({ error: 'User not found' });
  const chatMsg = new ChatMessage({
    userId: user._id,
    spotid: user.spotid,
    email: user.email,
    text,
    image
  });
  await chatMsg.save();
  res.json({ message: 'Message sent', chatMsg });
});

// --- USER: FETCH MESSAGES ---
app.get('/api/chat-messages/:spotid', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { spotid } = req.params;
  const user = await User.findById(userId);
  if (!user || user.spotid !== spotid) return res.status(404).json({ error: 'User not found' });
  const messages = await ChatMessage.find({ spotid }).sort({ createdAt: 1 }).lean();
  res.json({ messages });
});

// --- ADMIN: SEND MESSAGE ---
app.post('/api/admin/chat-messages/:spotid', authenticateAdmin, async (req: Request, res: Response) => {
  const { spotid } = req.params;
  const { text, image } = req.body;
  if (!text && !image) return res.status(400).json({ error: 'Message text or image required' });
  const user = await User.findOne({ spotid });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const chatMsg = new ChatMessage({
    userId: null,
    spotid,
    email: 'admin@tradespot.com',
    text,
    image,
    from: 'admin'
  });
  await chatMsg.save();
  res.json({ message: 'Message sent', chatMsg });
});

// --- ADMIN: FETCH MESSAGES ---
app.get('/api/admin/chat-messages/:spotid', authenticateAdmin, async (req: Request, res: Response) => {
  const { spotid } = req.params;
  const messages = await ChatMessage.find({ spotid }).sort({ createdAt: 1 }).lean();
  res.json({ messages });
});

// --- 2FA SETUP ENDPOINT ---
app.post('/api/2fa/setup', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  // Generate a new TOTP secret
  const secret = speakeasy.generateSecret({
    name: `TradeSpot (${user.email})`,
    length: 32
  });
  // Save the secret to the user (but do not enable 2FA yet)
  user.twoFA = { enabled: false, secret: secret.base32 };
  await user.save();
  // Generate QR code for Google Authenticator
  const otpauth: string = secret.otpauth_url || '';
  let qr = '';
  try {
    qr = await qrcode.toDataURL(otpauth);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
    return;
  }
  res.json({ qr, otpauth, secret: secret.base32 });
});

// --- 2FA VERIFY ENDPOINT ---
app.post('/api/2fa/verify', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { token } = req.body;
  const user = await User.findById(userId);
  if (!user || !user.twoFA || !user.twoFA.secret) {
    res.status(400).json({ error: '2FA setup not started' });
    return;
  }
  const verified = speakeasy.totp.verify({
    secret: user.twoFA.secret,
    encoding: 'base32',
    token,
    window: 1
  });
  if (!verified) {
    res.status(400).json({ error: 'Invalid 2FA code' });
    return;
  }
  user.twoFA.enabled = true;
  await user.save();
  res.json({ message: '2FA enabled successfully' });
});

// --- 2FA STATUS ENDPOINT ---
app.get('/api/2fa/status', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ enabled: !!(user.twoFA && user.twoFA.enabled) });
});

app.post('/api/chat/mark-read', async (req: Request, res: Response) => {
  try {
    const spotid = req.body.spotid;
    const fromVal = req.body.from; // 'admin' or 'user'
    await ChatMessage.updateMany({ spotid, from: fromVal, unread: true }, { $set: { unread: false, status: 'read' } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// --- ADMIN: GET RECENT ACTIVITIES ---
app.get('/api/admin/recent-activities', authenticateAdmin, async (req, res) => {
  try {
    const activities = await Activity.find({}).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Auto-delete activities older than 24 hours (run every hour)
cron.schedule('0 * * * *', async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    const result = await Activity.deleteMany({ createdAt: { $lt: cutoff } });
    if (result.deletedCount) {
      console.log(`[Activity Cleanup] Deleted ${result.deletedCount} activities older than 24h`);
    }
  } catch (err) {
    console.error('[Activity Cleanup] Error:', err);
  }
});

app.use('/api/trash', trashRoutes);

server.listen(5000, () => console.log('Server running on port 5000'));

// --- EMAIL STYLING UTILITY ---
function getStyledEmailHtml(subject: string, body: string) {
  return `
    <div style="background:#f4f6fb;padding:0;margin:0;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:0;margin:0;">
        <tr>
          <td align="center" style="padding:48px 0 32px 0;">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 4px 32px rgba(30,60,114,0.10);padding:0;overflow:hidden;">
              <tr>
                <td align="center" style="background:#1e3c72;padding:40px 0 24px 0;">
                  <span style="display:block;font-size:40px;font-weight:900;letter-spacing:2px;color:#fff;line-height:1.1;">TRADESPOT</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 36px 0 36px;">
                  <h2 style="color:#1e3c72;font-size:24px;font-weight:700;margin:0 0 18px 0;letter-spacing:1px;">${subject}</h2>
                  <div style="font-size:17px;color:#25324B;margin-bottom:18px;line-height:1.7;">
                    ${body}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 36px 32px 36px;">
                  <div style="margin-top:32px;font-size:14px;color:#888;text-align:center;">
                    If you did not request this, please ignore this email.<br>
                    <span style="color:#1e3c72;font-weight:700;">Tradespot Security Team</span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

// Start deposit monitor polling service
import "./services/depositMonitor";
// --- DEPOSIT STATUS ENDPOINT ---
// (import removed to avoid duplicate identifier error)

app.get('/api/deposit/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Find the most recent pending deposit session for this user
    const session = await DepositSession.findOne({
      userId: (req as any).user._id,
      credited: { $in: [false, null] },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!session) {
      // No pending session found, check if any session expired recently
      const expired = await DepositSession.findOne({
        userId: (req as any).user._id,
        credited: false,
        expiresAt: { $lte: new Date() },
      }).sort({ createdAt: -1 });
      if (expired) {
        return res.json({ status: 'failed' });
      }
      return res.json({ status: 'failed' });
    }
    if (session.credited) {
      return res.json({ status: 'success' });
    }
    // Still pending
    return res.json({ status: 'pending' });
  } catch (err) {
    return res.status(500).json({ status: 'failed', error: 'Server error' });
  }
});

// Get user's recent transactions
app.get('/api/transactions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Return all recent transactions, or limit if needed
    res.json({ transactions: user.recentTransactions || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// --- NOTIFICATIONS API ---
// Get all notifications for the logged-in user
app.get('/api/notifications', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.json({ notifications });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark all notifications as read for the logged-in user
app.patch('/api/notifications/mark-read', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
});

// --- FUNDS PRIVACY VERIFICATION CODE ---
app.post('/api/send-funds-privacy-code', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user || typeof user.email !== 'string') {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCode('fundsPrivacyCodes', user.email, code);
    // Send email
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
                       auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Funds Privacy Verification Code',
            html: getStyledEmailHtml(
              'Funds Privacy Verification',
              `Your funds privacy verification code is: <b style="font-size:20px;color:#1e3c72;">${code}</b>`
            )
        });
        res.json({ message: 'Verification code sent' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send email' });
    }
});