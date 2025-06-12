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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const BYBIT_API_KEY = process.env.BYBIT_API_KEY;
const BYBIT_API_SECRET = process.env.BYBIT_API_SECRET;
const BYBIT_API_URL = "https://api.bybit.com";
// Helper: Get USDT (TRC20) deposit records using Bybit v5 API
function getRecentDeposits() {
    return __awaiter(this, void 0, void 0, function* () {
        // Bybit v5 API endpoint for deposit records
        // https://bybit-exchange.github.io/docs/v5/asset/deposit
        const endpoint = "/v5/asset/deposit/query-record";
        // You may need to sign requests for private endpoints
        // For now, this is a placeholder for a GET request (add signing if needed)
        const params = {
            coin: "USDT",
            chainType: "TRC20",
            limit: 20,
        };
        // TODO: Add proper Bybit API signing for production
        const response = yield axios_1.default.get(BYBIT_API_URL + endpoint, {
            params,
            headers: {
                "X-BAPI-API-KEY": BYBIT_API_KEY,
                // Add signature and timestamp headers if required
            },
        });
        return response.data;
    });
}
exports.getRecentDeposits = getRecentDeposits;
