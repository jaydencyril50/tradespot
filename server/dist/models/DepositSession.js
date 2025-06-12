"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const depositSessionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    address: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    credited: { type: Boolean, default: false },
    txid: { type: String },
    expiresAt: { type: Date, required: true },
});
const DepositSession = mongoose_1.default.model('DepositSession', depositSessionSchema);
exports.default = DepositSession;
