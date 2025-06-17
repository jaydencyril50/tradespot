import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div style={{
      maxWidth: 700,
      margin: '40px auto',
      background: 'linear-gradient(135deg, #f8fafc 0%, #eaf1fb 100%)',
      boxShadow: '0 4px 32px rgba(30,60,114,0.13)',
      padding: 40,
      borderRadius: 18,
      minHeight: 420,
      fontFamily: 'Segoe UI, Arial, sans-serif',
    }}>
      <h2 style={{ fontWeight: 800, color: '#1e3c72', marginBottom: 24, fontSize: 26, letterSpacing: 1 }}>Transaction History</h2>
      {loading && <div style={{ color: '#1e3c72', fontWeight: 500 }}>Loading...</div>}
      {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
      {!loading && !error && transactions.length === 0 && (
        <div style={{ color: '#888', fontSize: 16, textAlign: 'center', margin: '40px 0' }}>No transactions found.</div>
      )}
      {!loading && !error && transactions.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 16, background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(30,60,114,0.04)' }}>
            <thead>
              <tr style={{ background: '#f4f8fb' }}>
                <th style={{ textAlign: 'left', padding: '14px 10px', color: '#25324B', fontWeight: 700, borderTopLeftRadius: 12 }}>Type</th>
                <th style={{ textAlign: 'right', padding: '14px 10px', color: '#25324B', fontWeight: 700 }}>Amount</th>
                <th style={{ textAlign: 'right', padding: '14px 10px', color: '#25324B', fontWeight: 700 }}>Currency</th>
                <th style={{ textAlign: 'right', padding: '14px 10px', color: '#25324B', fontWeight: 700, borderTopRightRadius: 12 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => {
                const isDeposit = tx.type.toLowerCase().includes('deposit');
                const isWithdraw = tx.type.toLowerCase().includes('withdraw');
                return (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#f8fafc' : '#fff', transition: 'background 0.2s', borderBottom: '1px solid #eaf1fb' }}>
                    <td style={{ padding: '12px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isDeposit && <span style={{ color: '#27ae60', fontSize: 18, marginRight: 4 }} title="Deposit">⬆️</span>}
                      {isWithdraw && <span style={{ color: '#e74c3c', fontSize: 18, marginRight: 4 }} title="Withdraw">⬇️</span>}
                      <span style={{ fontWeight: 500 }}>{tx.type}</span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 600, color: isDeposit ? '#27ae60' : isWithdraw ? '#e74c3c' : '#25324B' }}>
                      {isDeposit ? '+' : isWithdraw ? '-' : ''}{tx.amount}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', color: '#25324B', fontWeight: 500 }}>{tx.currency}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', color: '#888', fontWeight: 400 }}>{new Date(tx.date).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
