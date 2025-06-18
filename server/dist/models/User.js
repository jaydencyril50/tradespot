"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
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
    profilePicture: String,
    referralCode: { type: String, unique: true, required: true },
    referredBy: String,
    teamMembers: [
        {
            userId: mongoose_1.default.Schema.Types.ObjectId,
            joinedAt: Date
        }
    ],
    spotid: { type: String, unique: true, required: true },
    fundsLocked: { type: Boolean, default: false },
    twoFA: {
        enabled: { type: Boolean, default: false },
        secret: { type: String, default: '' },
    }
});
// Use global to avoid OverwriteModelError in dev/hot-reload
const User = global.User || mongoose_1.default.model('User', userSchema);
global.User = User;
exports.default = User;
