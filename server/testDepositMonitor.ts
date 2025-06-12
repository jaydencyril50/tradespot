import { getRecentDeposits } from "./services/bybit";

function formatTimestamp(ts: string | number | undefined): string {
  if (!ts) return "";
  // Bybit returns ms as string, sometimes as number
  const n = typeof ts === 'string' ? parseInt(ts) : ts;
  if (!n || isNaN(n)) return String(ts);
  const d = new Date(n);
  return d.toLocaleString();
}

(async () => {
  try {
    const deposits = await getRecentDeposits();
    // Print the raw response for debugging
    console.log("Raw Bybit API response:", JSON.stringify(deposits, null, 2));

    let rows: any[] = [];
    if (Array.isArray(deposits)) {
      rows = deposits;
    } else if (deposits && typeof deposits === 'object') {
      rows = (deposits as any)?.result?.rows || (deposits as any)?.result?.list || (deposits as any)?.rows || (deposits as any)?.list || [];
    }

    if (Array.isArray(rows) && rows.length > 0) {
      console.log("Last 10 TRC20 USDT deposits:");
      rows.slice(0, 10).forEach((d: any, i: number) => {
        const time = formatTimestamp(d.successAt || d.updatedTime);
        console.log(`#${i + 1}: Amount: ${d.amount}, Address: ${d.toAddress || d.toAddr}, Status: ${d.status}, Time: ${time}, TxID: ${d.txID || d.txid}`);
      });
    } else {
      console.log("No deposit data found or API response format changed.");
    }
  } catch (err) {
    console.error("Error fetching deposits:", err);
  }
})();
