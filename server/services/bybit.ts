import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const BYBIT_API_KEY = process.env.BYBIT_API_KEY!;
const BYBIT_API_SECRET = process.env.BYBIT_API_SECRET!;
const BYBIT_API_URL = "https://api.bybit.com";
const RECV_WINDOW = "5000";

// Debug flag to control logging
const debugMode = false;

// Helper: Generate Bybit v5 signature
function signBybitRequest(params: Record<string, string | number>, timestamp: string) {
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');

  const preHash = timestamp + BYBIT_API_KEY + RECV_WINDOW + queryString;
  const signature = crypto.createHmac('sha256', BYBIT_API_SECRET).update(preHash).digest('hex');

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
export async function getRecentDeposits() {
  const endpoint = "/v5/asset/deposit/query-record";
  const params: Record<string, string | number> = {
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
    interface BybitDepositResponse {
      result?: {
        rows?: any[];
      };
      [key: string]: any;
    }

    const response = await axios.get<BybitDepositResponse>(BYBIT_API_URL + endpoint + "?" + queryString, {
      headers,
    });

    if (debugMode) {
      console.log("Raw Bybit API response:", JSON.stringify(response.data, null, 2));
    }

    const deposits = response.data?.result?.rows || [];

    if (debugMode) {
      if (deposits.length === 0) {
        console.log("No deposit data found.");
      } else {
        console.log("Recent Deposits:", deposits);
      }
    }
    return deposits;
  } catch (error: any) {
    console.error("Bybit API error:", error?.response?.data || error.message);
    return [];
  }
}

// Only run the monitor if debugMode is true
if (debugMode) getRecentDeposits();
