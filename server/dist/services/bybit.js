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
exports.getRecentDeposits = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const BYBIT_API_KEY = process.env.BYBIT_API_KEY;
const BYBIT_API_SECRET = process.env.BYBIT_API_SECRET;
const BYBIT_API_URL = "https://api.bybit.com";
const RECV_WINDOW = "5000";
// Debug flag to control logging
const debugMode = false;
// Helper: Generate Bybit v5 signature
function signBybitRequest(params, timestamp) {
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    const preHash = timestamp + BYBIT_API_KEY + RECV_WINDOW + queryString;
    const signature = crypto_1.default.createHmac('sha256', BYBIT_API_SECRET).update(preHash).digest('hex');
    if (debugMode) {
        console.log("=== Signature Debug ===");
        console.log("Timestamp:", timestamp);
        console.log("QueryString:", queryString);
        console.log("PreHash:", preHash);
        console.log("Signature:", signature);
        console.log("=======================");
    }
    return signature;
}
// Fetch recent USDT (TRC20) deposits
function getRecentDeposits() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = "/v5/asset/deposit/query-record";
        const params = {
            coin: "USDT",
            chainType: "TRC20",
            limit: 20,
        };
        const timestamp = Date.now().toString();
        const sortedKeys = Object.keys(params).sort();
        const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
        const signature = signBybitRequest(params, timestamp);
        const headers = {
            "X-BAPI-API-KEY": BYBIT_API_KEY,
            "X-BAPI-TIMESTAMP": timestamp,
            "X-BAPI-SIGN": signature,
            "X-BAPI-RECV-WINDOW": RECV_WINDOW,
            "Content-Type": "application/json"
        };
        try {
            const response = yield axios_1.default.get(BYBIT_API_URL + endpoint + "?" + queryString, {
                headers,
            });
            if (debugMode) {
                console.log("Raw Bybit API response:", JSON.stringify(response.data, null, 2));
            }
            const deposits = ((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b.rows) || [];
            if (debugMode) {
                if (deposits.length === 0) {
                    console.log("No deposit data found.");
                }
                else {
                    console.log("Recent Deposits:", deposits);
                }
            }
            return deposits;
        }
        catch (error) {
            console.error("Bybit API error:", ((_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
            return [];
        }
    });
}
exports.getRecentDeposits = getRecentDeposits;
// Only run the monitor if debugMode is true
if (debugMode)
    getRecentDeposits();
// All chat/message related code has been removed from this build file.
