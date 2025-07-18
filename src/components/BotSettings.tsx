import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://api.tradespot.online';

const BotSettings: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subLoading, setSubLoading] = useState<string | null>(null); // botId being processed
  const [error, setError] = useState('');
  const [botErrors, setBotErrors] = useState<Record<string, string>>({});
  const [usdtBalance, setUsdtBalance] = useState<number | null>(null);

  // Fetch subscriptions and balance on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${API}/api/bot/subscriptions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setSubscriptions(res.data.subscriptions || []))
      .catch(() => setSubscriptions([]));
    // Fetch user USDT balance
    axios.get(`${API}/api/funds/balance`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUsdtBalance(res.data.usdt || null))
      .catch(() => setUsdtBalance(null));
  }, []);

  // Helper to check if user is subscribed to a bot
  const isSubscribed = (botId: string) => {
    return subscriptions.some(sub => sub.botId === botId && sub.isActive);
  };

  // Subscribe to a bot with USDT balance check
  const handleSubscribe = async (bot: any) => {
    setSubLoading(bot._id);
    setError('');
    setBotErrors({});
    const token = localStorage.getItem('token');
    // Check balance before subscribing
    const minTrade = bot.rules?.minTrade || 0;
    const maxTrade = bot.rules?.maxTrade || Number.MAX_SAFE_INTEGER;
    if (usdtBalance === null) {
      setBotErrors(prev => ({ ...prev, [bot._id]: 'Unable to fetch USDT balance.' }));
      setSubLoading(null);
      return;
    }
    if (usdtBalance < minTrade || usdtBalance > maxTrade) {
      setBotErrors(prev => ({ ...prev, [bot._id]: `Your USDT balance (${usdtBalance}) is not within the bot's trade limit (${minTrade}-${maxTrade}).` }));
      setSubLoading(null);
      return;
    }
    try {
      await axios.post(`${API}/api/bot/bots/${bot._id}/subscribe`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh subscriptions
      const res = await axios.get(`${API}/api/bot/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions(res.data.subscriptions || []);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setBotErrors(prev => ({ ...prev, [bot._id]: err.response.data.error }));
      } else {
        setBotErrors(prev => ({ ...prev, [bot._id]: 'Failed to subscribe' }));
      }
    } finally {
      setSubLoading(null);
    }
  };

  // Unsubscribe from a bot
  const handleUnsubscribe = async (bot: any) => {
    setSubLoading(bot._id);
    setError('');
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API}/api/bot/bots/${bot._id}/unsubscribe`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh subscriptions
      const res = await axios.get(`${API}/api/bot/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions(res.data.subscriptions || []);
    } catch (err: any) {
      setError('Failed to unsubscribe');
    } finally {
      setSubLoading(null);
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

      {/* Show current bot if enabled */}
      {/* No botEnabled UI, since not supported by backend */}
      {/* Bot Cards Section - one per row */}
      <div style={{
        marginTop: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 0.5rem',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Map bot names to images */}
        {(() => {
          const botImages: Record<string, string> = {
            AlphaBot: 'https://i.postimg.cc/ZKbLVGMn/security.png',
            Fireblaze: 'https://i.postimg.cc/2ymDBkTC/technical-support.png',
            SignalCore: 'https://i.postimg.cc/28tBhgpP/chatbot.png',
            ProfitPilot: 'https://i.postimg.cc/Jz3jbP1m/robot-1.png',
            VoltaEdge: 'https://i.postimg.cc/gJy07BTk/robotic-process-automation.png',
            ProVoltage: 'https://i.postimg.cc/B6fWdSr2/bot.png',
            QuantumBot: 'https://i.postimg.cc/Hxs3hFST/robot.png',
          };
          const [bots, setBots] = React.useState<any[]>([]);
          React.useEffect(() => {
            axios.get(`${API}/api/bot/bots`).then(res => setBots(res.data.bots || []));
          }, []);
          return bots.map((bot, idx) => (
            <div key={bot._id} style={{
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
              <img src={botImages[bot.name] || ''} alt={bot.name} style={{ width: 40, height: 40, marginBottom: 14, borderRadius: 10, background: '#f3f4f6', objectFit: 'cover' }} />
              <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#222', marginBottom: 4, textAlign: 'center' }}>{bot.name}</div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: 10,
              }}>
                <div style={{
                  fontWeight: 500,
                  fontSize: '0.98rem',
                  color: '#10b981',
                  background: '#e6f9f3',
                  borderRadius: 6,
                  padding: '3px 12px',
                  textAlign: 'center',
                  display: 'inline-block',
                  letterSpacing: '0.01em',
                }}>{`${bot.rules?.minTrade || 0}-${bot.rules?.maxTrade || 'MAX'} USDT`}</div>
                <div style={{
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: '#2563eb',
                  background: '#e0e7ff',
                  borderRadius: 6,
                  padding: '2px 10px',
                  textAlign: 'center',
                  display: 'inline-block',
                  letterSpacing: '0.01em',
                }}>{`${bot.commissionPercent}%`}</div>
              </div>
            {isSubscribed(bot._id) ? (
              <button
                style={{
                  background: '#d1d5db',
                  color: '#888',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 0',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: 'auto',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.08)'
                }}
                onClick={() => handleUnsubscribe(bot)}
                disabled={subLoading === bot._id}
              >{subLoading === bot._id ? 'Processing...' : 'Unsubscribe'}</button>
            ) : (
              <button
                style={{
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
                }}
                onClick={() => handleSubscribe(bot)}
                disabled={subLoading === bot._id}
              >{subLoading === bot._id ? 'Processing...' : 'Subscribe'}</button>
            )}
            {/* Show error for this bot only */}
            {botErrors[bot._id] && (
              <div style={{ color: 'red', textAlign: 'center', marginTop: 8, fontSize: '0.95rem' }}>{botErrors[bot._id]}</div>
            )}
            </div>
          ));
        })()}
      </div>
      {/* Optionally, show error */}
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</div>}
    </div>
  );
};

export default BotSettings;
