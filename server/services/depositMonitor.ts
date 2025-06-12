import mongoose from "mongoose";
import dotenv from "dotenv";
import { getRecentDeposits } from "./bybit";
import User from "../models/User";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI!, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Polling interval in ms (e.g., 1 minute)
const POLL_INTERVAL = 60 * 1000;

async function pollDeposits() {
  try {
    // 1. Get all pending deposit sessions (not expired, not completed)
    const now = new Date();
    const sessions = await (await import("../models/DepositSession")).default.find({
      credited: false,
      expiresAt: { $gt: now },
    });

    if (!sessions.length) return;

    // 2. Fetch recent deposits from Bybit
    const deposits: any = await getRecentDeposits();
    if (!deposits.result || !deposits.result.rows) return;

    // 3. For each session, try to match a deposit
    for (const session of sessions) {
      const match = deposits.result.rows.find((d: any) =>
        d.amount === session.amount.toString() &&
        d.toAddr === session.address &&
        d.status === "success" &&
        new Date(d.updatedTime) >= session.createdAt
      );
      if (match) {
        // 4. Credit user balance
        await User.findByIdAndUpdate(session.userId, {
          $inc: { usdtBalance: session.amount },
        });
        // 5. Mark session as credited
        session.credited = true;
        session.txid = match.txID || match.txid;
        await session.save();
        console.log(`Deposit credited: userId=${session.userId}, amount=${session.amount}, txid=${session.txid}`);
        // Optionally: notify frontend via websocket/event
      } else if (now > session.expiresAt) {
        session.credited = false;
        await session.save();
        console.log(`Deposit session expired: userId=${session.userId}, amount=${session.amount}, address=${session.address}`);
        // Optionally: notify frontend of failure
      }
    }
  } catch (err) {
    console.error("Deposit polling error:", err);
  }
}

// Start polling
timer();
function timer() {
  pollDeposits();
  setTimeout(timer, POLL_INTERVAL);
}

export default timer;
