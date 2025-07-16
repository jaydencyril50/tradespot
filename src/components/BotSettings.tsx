import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BotSettings: React.FC = () => {
  const [botEnabled, setBotEnabled] = useState(false);
  const [botDailyOrderAmount, setBotDailyOrderAmount] = useState(0);
  const [botOrderType, setBotOrderType] = useState<'buy' | 'sell' | 'both'>('buy');
  const [botRunTime, setBotRunTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch current bot settings
    setLoading(true);
    axios.get('/api/user/me') // Adjust endpoint if needed
      .then(res => {
        const user = res.data;
        setBotEnabled(!!user.botEnabled);
        setBotDailyOrderAmount(user.botDailyOrderAmount || 0);
        setBotOrderType(user.botOrderType || 'buy');
        setBotRunTime(user.botRunTime || '09:00');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.put('/api/bot-settings', {
        botEnabled,
        botDailyOrderAmount,
        botOrderType,
        botRunTime,
      });
      setMessage(res.data.message || 'Settings updated!');
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bot-settings-container" style={{
      maxWidth: 420,
      margin: '40px auto',
      background: 'var(--background, #1e293b)',
      borderRadius: 16,
      boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
      padding: '32px 28px',
      color: 'var(--text, #e2e8f0)',
    }}>
      <h2 style={{
        fontSize: '1.7rem',
        fontWeight: 700,
        marginBottom: 24,
        color: 'var(--accent, #10b981)'
      }}>Automated Order Bot Settings</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={botEnabled}
            onChange={e => setBotEnabled(e.target.checked)}
            style={{ accentColor: 'var(--accent, #10b981)', width: 20, height: 20 }}
          />
          Enable Bot
        </label>
        <label style={{ fontWeight: 500 }}>
          Daily Order Amount:
          <input
            type="number"
            min={0}
            value={botDailyOrderAmount}
            onChange={e => setBotDailyOrderAmount(Number(e.target.value))}
            required
            style={{
              marginLeft: 12,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#e2e8f0',
              width: 120
            }}
          />
        </label>
        <label style={{ fontWeight: 500 }}>
          Order Type:
          <select
            value={botOrderType}
            onChange={e => setBotOrderType(e.target.value as any)}
            style={{
              marginLeft: 12,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#e2e8f0',
              width: 120
            }}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label style={{ fontWeight: 500 }}>
          Run Time (HH:MM):
          <input
            type="time"
            value={botRunTime}
            onChange={e => setBotRunTime(e.target.value)}
            required
            style={{
              marginLeft: 12,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#e2e8f0',
              width: 120
            }}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 10,
            padding: '10px 0',
            borderRadius: 8,
            background: 'var(--accent, #10b981)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1.08rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            boxShadow: '0 2px 8px rgba(16,185,129,0.08)'
          }}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
      {message && <p style={{ marginTop: 18, color: message.includes('Failed') ? '#ef4444' : '#10b981', fontWeight: 500 }}>{message}</p>}
    </div>
  );
};

export default BotSettings;
