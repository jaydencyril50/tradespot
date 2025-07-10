import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatTradeSpotTime } from '../utils/tradeSpotTime';

const API = process.env.REACT_APP_API_BASE_URL;

interface Transaction {
  type: string;
  amount: number;
  currency: string;
  date: string;
}

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Sort transactions by date descending (newest first)
        const sortedTransactions = (res.data.transactions || []).sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(sortedTransactions);
      } catch (e: any) {
        setError('Failed to load transactions.');
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', border: '1.5px solid rgba(120,130,150,0.13)', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', letterSpacing: 1, fontFamily: 'serif' }}>
          TRANSACTION HISTORY
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        {loading && <div style={{ color: 'var(--primary)', fontWeight: 500 }}>Loading...</div>}
        {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {!loading && !error && transactions.length === 0 && (
          <div style={{ color: 'var(--secondary)', fontSize: 16, textAlign: 'center', margin: '40px 0' }}>No transactions found.</div>
        )}
        {!loading && !error && transactions.length > 0 && (
          transactions.map((tx, idx) => {
            const increaseTypes = ['deposit', 'withdrawal refund', 'transfer in', 'stock profit', 'referral reward'];
            const decreaseTypes = ['withdraw', 'transfer out', 'stock purchase'];
            const typeLower = tx.type.toLowerCase();
            const isIncrease = increaseTypes.some(t => typeLower.includes(t));
            const isDecrease = decreaseTypes.some(t => typeLower.includes(t));
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: 0,
                  boxShadow: 'var(--card-shadow)',
                  border: '1px solid rgba(120,130,150,0.13)',
                  padding: '12px 16px',
                  minWidth: 200,
                  maxWidth: 380,
                  width: '100%',
                  textAlign: 'center',
                  marginBottom: 0,
                  fontFamily: 'inherit',
                  height: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 6 }}>
                  {isIncrease && <span style={{ color: '#27ae60', fontSize: 20 }} title="Increase">⬆️</span>}
                  {isDecrease && <span style={{ color: '#e74c3c', fontSize: 20 }} title="Decrease">⬇️</span>}
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem', letterSpacing: 1 }}>{tx.type}</span>
                </div>
                <div style={{ fontSize: '1.05rem', color: isIncrease ? '#27ae60' : isDecrease ? '#e74c3c' : 'var(--text)', fontWeight: 600, marginBottom: 2 }}>
                  {isIncrease ? '+' : isDecrease ? '-' : ''}{tx.amount} {tx.currency}
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: 2 }}>
                  {formatTradeSpotTime(tx.date)}
                </div>
              </div>
            );
          })
        )}
        <style>
          {`
            @media (max-width: 600px) {
              div[style*="box-shadow"] {
                max-width: 90vw !important;
                min-width: 0 !important;
                width: 90vw !important;
                margin-left: 5vw !important;
                margin-right: 5vw !important;
                padding: 10px 2vw !important;
                height: 90px !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default TransactionHistory;
