"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Chat_1 = __importDefault(require("../models/Chat"));
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
// GET /api/chat - Fetch all chat messages
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield Chat_1.default.find().sort({ createdAt: 1 });
        res.json({ chats });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
}));
// Middleware to authenticate and attach user to req
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ error: 'Invalid token' });
            return;
        }
        req.user = user;
        next();
    });
}
// POST /api/chat - Save a new chat message (only)
router.post('/', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c._id);
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const chat = new Chat_1.default({ userEmail: user.email, message });
        yield chat.save();
        res.status(201).json({ success: true, chat });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to save chat message' });
    }
}));
exports.default = router;
