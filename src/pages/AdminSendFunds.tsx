import React, { useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://api.tradespot.online';

const AdminSendFunds: React.FC = () => {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('FLEX');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${API}/api/admin/send-funds`,
        { email, amount, currency, tag },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Funds sent successfully!');
      setEmail('');
      setAmount('');
      setCurrency('FLEX');
      setTag('');
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to send funds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f6f9fe',
        padding: '16px 24px 10px 18px',
        border: '1.5px solid #232b36',
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        marginBottom: 24
      }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          SEND FUNDS TO USER
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 80px)',
          paddingBottom: 40,
          gap: 20,
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 0,
            boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
            border: '1px solid #e3e6ef',
            padding: '24px 20px',
            minWidth: 320,
            maxWidth: 400,
            width: '100%',
            fontFamily: 'inherit',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="User Email"
                required
                style={{ width: '96%', padding: 10, borderRadius: 0, border: '1px solid #e3eafc', marginBottom: 0 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Amount"
                required
                min={0.01}
                step={0.01}
                style={{ width: '96%', padding: 10, borderRadius: 0, border: '1px solid #e3eafc', marginBottom: 0 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                style={{ width: '96%', padding: 10, borderRadius: 0, border: '1px solid #e3eafc', marginBottom: 0 }}
              >
                <option value="FLEX">FLEX</option>
                <option value="USDT">USDT</option>
                <option value="SPOT">SPOT</option>
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <input
                type="text"
                value={tag}
                onChange={e => setTag(e.target.value)}
                placeholder="Transaction Tag (e.g. team rewards)"
                required
                style={{ width: '96%', padding: 10, borderRadius: 0, border: '1px solid #e3eafc', marginBottom: 0 }}
              />
            </div>
            {error && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{error}</div>}
            {success && <div style={{ color: '#10c98f', marginBottom: 10 }}>{success}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#1e3c72', color: '#fff', padding: 12, border: 'none', borderRadius: 0, fontWeight: 600, fontSize: 15 }}>
              {loading ? 'Sending...' : 'Send Funds'}
            </button>
          </form>
        </div>
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
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AdminSendFunds;
