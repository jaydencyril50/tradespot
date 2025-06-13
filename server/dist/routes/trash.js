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
const TrashItem_1 = __importDefault(require("../models/TrashItem"));
const router = express_1.default.Router();
// Get all trash items
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield TrashItem_1.default.find().sort({ createdAt: -1 });
        res.json(items);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch trash items.' });
    }
}));
// Add a new trash item
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content } = req.body;
    if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content is required.' });
    }
    try {
        // Prevent duplicate content
        const exists = yield TrashItem_1.default.findOne({ content: content.trim() });
        if (exists) {
            return res.status(400).json({ error: 'Duplicate content not allowed.' });
        }
        const newItem = new TrashItem_1.default({ content: content.trim() });
        yield newItem.save();
        res.status(201).json(newItem);
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Duplicate content not allowed.' });
        }
        res.status(500).json({ error: 'Failed to add trash item.' });
    }
}));
// Search trash items
router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { q } = req.query;
    try {
        let items;
        if (!q || !q.toString().trim()) {
            items = yield TrashItem_1.default.find().sort({ createdAt: -1 });
        }
        else {
            items = yield TrashItem_1.default.find({
                content: { $regex: q.toString().trim(), $options: 'i' }
            }).sort({ createdAt: -1 });
        }
        res.json(items);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to search trash items.' });
    }
}));
exports.default = router;
