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
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
const authenticateAdmin_1 = __importDefault(require("../middleware/authenticateAdmin"));
const router = express_1.default.Router();
// --- ADMIN: GET ALL CHAT MESSAGES ---
router.get('/api/admin/chat-messages', authenticateAdmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield ChatMessage_1.default.find({}, 'email spotid text image createdAt').sort({ createdAt: -1 }).lean();
        res.json({ messages });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
}));
exports.default = router;
