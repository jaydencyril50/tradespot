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
        setTransactions(res.data.transactions || []);
      } catch (e: any) {
        setError('Failed to load transactions.');
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  return (
    <div style={{
      maxWidth: 600,
      margin: '0 auto 0 auto',
      background: '#fff',
      boxShadow: '0 2px 16px rgba(30,60,114,0.10)',
      padding: 32,
      borderRadius: 0,
      minHeight: 400,
    }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Transaction History</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {!loading && !error && transactions.length === 0 && (
        <div style={{ color: '#888', fontSize: 15 }}>No transactions found.</div>
      )}
      {!loading && !error && transactions.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, color: '#25324B' }}>Type</th>
              <th style={{ textAlign: 'right', padding: 8, color: '#25324B' }}>Amount</th>
              <th style={{ textAlign: 'right', padding: 8, color: '#25324B' }}>Currency</th>
              <th style={{ textAlign: 'right', padding: 8, color: '#25324B' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eaf1fb' }}>
                <td style={{ padding: 8 }}>{tx.type}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{tx.amount}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{tx.currency}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{new Date(tx.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionHistory;
