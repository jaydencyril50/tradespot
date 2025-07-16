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
    <div className="bot-settings-root" style={{
      background: 'var(--bg)',
      minHeight: '100vh',
      width: '100vw',
      height: '100vh',
      position: 'relative',
      boxSizing: 'border-box',
    }}>
      {/* Header Bar - not fixed */}
      <div className="bot-settings-header" style={{
        background: 'var(--card-bg)',
        borderBottom: '1.5px solid var(--primary)',
        width: '100%',
        padding: '0.75rem 0 0.75rem 1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxSizing: 'border-box',
      }}>
        <span className="market-header-title" style={{
          color: 'var(--primary)',
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '0.02em',
        }}>
          AUTOMATED BOT
        </span>
      </div>

      {/* Bot Cards Section - one per row */}
      <div style={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 0.5rem',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {[{ name: 'AlphaBot', img: 'https://i.postimg.cc/ZKbLVGMn/security.png', range: '1-50 USDT' },
          { name: 'Fireblaze', img: 'https://i.postimg.cc/2ymDBkTC/technical-support.png', range: '51-150 USDT' },
          { name: 'Trademaster', img: 'https://i.postimg.cc/28tBhgpP/chatbot.png', range: '151-300 USDT' },
          { name: 'ProfitPilot', img: 'https://i.postimg.cc/Jz3jbP1m/robot-1.png', range: '301-500 USDT' },
          { name: 'MarketMaven', img: 'https://i.postimg.cc/gJy07BTk/robotic-process-automation.png', range: '501-1000 USDT' },
          { name: 'SignalSeeker', img: 'https://i.postimg.cc/B6fWdSr2/bot.png', range: '1001-2000 USDT' },
          { name: 'QuantumBot', img: 'https://i.postimg.cc/Hxs3hFST/robot.png', range: '2001-MAX USDT' },
        ].map((bot, idx) => (
          <div key={bot.name} style={{
            background: '#fff',
            borderRadius: 2,
            boxShadow: '0 4px 18px rgba(0,0,0,0.10)',
            width: '100%',
            maxWidth: 400,
            minWidth: 0,
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem 1rem 1rem 1rem',
            border: '1.5px solid #e5e7eb',
            boxSizing: 'border-box',
          }}>
            <img src={bot.img} alt={bot.name} style={{ width: 40, height: 40, marginBottom: 14, borderRadius: 10, background: '#f3f4f6', objectFit: 'cover' }} />
            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#222', marginBottom: 4, textAlign: 'center' }}>{bot.name}</div>
            <div style={{
              fontWeight: 500,
              fontSize: '0.98rem',
              color: '#10b981',
              background: '#e6f9f3',
              borderRadius: 6,
              padding: '3px 12px',
              marginBottom: 10,
              textAlign: 'center',
              display: 'inline-block',
              letterSpacing: '0.01em',
            }}>{bot.range}</div>
            <button style={{
              background: 'var(--primary, #10b981)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              width: '100%',
              marginTop: 'auto',
              boxShadow: '0 2px 8px rgba(16,185,129,0.08)'
            }}>Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BotSettings;
