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
const authenticateAdmin_1 = __importDefault(require("../middleware/authenticateAdmin"));
const Trash_1 = __importDefault(require("../models/Trash"));
const router = express_1.default.Router();
// Get all trash items
router.get('/', authenticateAdmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield Trash_1.default.find().sort({ createdAt: -1 });
        res.json({ items });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch trash items' });
    }
}));
// Add a new trash item
router.post('/', authenticateAdmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text is required' });
        }
        const item = new Trash_1.default({ text });
        yield item.save();
        res.json({ item });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to save trash item' });
    }
}));
exports.default = router;
