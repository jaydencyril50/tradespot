"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bybit_1 = require("./bybit");
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
mongoose_1.default
    .connect(process.env.MONGO_URI, {})
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
// Polling interval in ms (e.g., 1 minute)
const POLL_INTERVAL = 60 * 1000;
function pollDeposits() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1. Get all pending deposit sessions (not expired, not completed)
            const now = new Date();
            const sessions = yield (yield Promise.resolve().then(() => __importStar(require("../models/DepositSession")))).default.find({
                credited: false,
                expiresAt: { $gt: now },
            });
            if (!sessions.length)
                return;
            // 2. Fetch recent deposits from Bybit
            const deposits = yield (0, bybit_1.getRecentDeposits)();
            if (!deposits.result || !deposits.result.rows)
                return;
            // 3. For each session, try to match a deposit
            for (const session of sessions) {
                const match = deposits.result.rows.find((d) => d.amount === session.amount.toString() &&
                    d.toAddr === session.address &&
                    d.status === "success" &&
                    new Date(d.updatedTime) >= session.createdAt);
                if (match) {
                    // 4. Credit user balance
                    yield User_1.default.findByIdAndUpdate(session.userId, {
                        $inc: { usdtBalance: session.amount },
                    });
                    // 5. Mark session as credited
                    session.credited = true;
                    session.txid = match.txID || match.txid;
                    yield session.save();
                    console.log(`Deposit credited: userId=${session.userId}, amount=${session.amount}, txid=${session.txid}`);
                    // Optionally: notify frontend via websocket/event
                }
                else if (now > session.expiresAt) {
                    session.credited = false;
                    yield session.save();
                    console.log(`Deposit session expired: userId=${session.userId}, amount=${session.amount}, address=${session.address}`);
                    // Optionally: notify frontend of failure
                }
            }
        }
        catch (err) {
            console.error("Deposit polling error:", err);
        }
    });
}
// Start polling
timer();
function timer() {
    pollDeposits();
    setTimeout(timer, POLL_INTERVAL);
}
exports.default = timer;
