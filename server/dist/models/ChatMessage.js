"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chatMessageSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    spotid: { type: String, required: true },
    email: { type: String, required: true },
    text: { type: String },
    image: { type: String },
    createdAt: { type: Date, default: Date.now }
});
const ChatMessage = mongoose_1.default.model('ChatMessage', chatMessageSchema);
exports.default = ChatMessage;
