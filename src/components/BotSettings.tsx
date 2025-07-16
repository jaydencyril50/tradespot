import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BotSettings: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState<any>(null);
  const [vipLevel, setVipLevel] = useState<string>('');
  const [price, setPrice] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const handleBuyClick = async (bot: any) => {
    setSelectedBot(bot);
    setShowModal(true);
    setModalLoading(true);
    setModalError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bot/vip-level', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      setVipLevel(res.data.vipLevel || '');
    } catch (err: any) {
      setModalError('Failed to fetch VIP level');
    } finally {
      setModalLoading(false);
    }
  };

  const handleActivate = async () => {
    setModalLoading(true);
    setModalError('');
    try {
      const percent = selectedBot?.percent ? parseInt(selectedBot.percent.replace('%','')) : 4;
      const token = localStorage.getItem('token');
      await axios.put('/api/bot', {
        botEnabled: true,
        botType: selectedBot?.name,
        botPercent: percent,
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      setMessage('Bot activated!');
      setShowModal(false);
      setSelectedBot(null);
      setPrice('');
    } catch (err: any) {
      setModalError('Failed to activate bot');
    } finally {
      setModalLoading(false);
    }
  };
  const [botEnabled, setBotEnabled] = useState(false);
  const [botDailyOrderAmount, setBotDailyOrderAmount] = useState(0);
  const [botOrderType, setBotOrderType] = useState<'buy' | 'sell' | 'both'>('buy');
  const [botRunTime, setBotRunTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [currentBotType, setCurrentBotType] = useState('');
  const [currentBotPercent, setCurrentBotPercent] = useState<number>(4);
  useEffect(() => {
    // Fetch current bot settings
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get('/api/bot', {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
      .then(res => {
        const settings = res.data;
        setBotEnabled(!!settings.botEnabled);
        setBotDailyOrderAmount(settings.botDailyOrderAmount || 0);
        setBotOrderType(settings.botOrderType || 'buy');
        setBotRunTime(settings.botRunTime || '09:00');
        setCurrentBotType(settings.botType || '');
        setCurrentBotPercent(settings.botPercent ?? 4);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.put('/api/bot', {
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

      {/* Show current bot if enabled */}
      {botEnabled && (
        <div style={{margin:'1.5rem auto',maxWidth:400,background:'#e0e7ff',borderRadius:8,padding:'1rem 1.5rem',color:'#222',fontWeight:500}}>
          <div>Active Bot: <b>{currentBotType}</b></div>
          <div>Commission: <b>{currentBotPercent}%</b></div>
        </div>
      )}
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
        {[
          { name: 'AlphaBot', img: 'https://i.postimg.cc/ZKbLVGMn/security.png', range: '1-50 USDT', percent: '4%' },
          { name: 'Fireblaze', img: 'https://i.postimg.cc/2ymDBkTC/technical-support.png', range: '51-150 USDT', percent: '5%' },
          { name: 'SignalCore', img: 'https://i.postimg.cc/28tBhgpP/chatbot.png', range: '151-300 USDT', percent: '6%' },
          { name: 'ProfitPilot', img: 'https://i.postimg.cc/Jz3jbP1m/robot-1.png', range: '301-500 USDT', percent: '7%' },
          { name: 'VoltaEdge', img: 'https://i.postimg.cc/gJy07BTk/robotic-process-automation.png', range: '501-1000 USDT', percent: '8%' },
          { name: 'ProVoltage', img: 'https://i.postimg.cc/B6fWdSr2/bot.png', range: '1001-2000 USDT', percent: '9%' },
          { name: 'QuantumBot', img: 'https://i.postimg.cc/Hxs3hFST/robot.png', range: '2001-MAX USDT', percent: '10%' },
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
              }}>{bot.range}</div>
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
              }}>{bot.percent}</div>
            </div>
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
            onClick={() => handleBuyClick(bot)}
          >Buy</button>
          </div>
        ))}
      </div>
      {/* Modal for Buy button */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 10,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            padding: '2rem 1.5rem',
            minWidth: 320,
            maxWidth: 380,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}>
            <button
              style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}
              onClick={() => { setShowModal(false); setSelectedBot(null); setPrice(''); }}
              aria-label="Close"
            >×</button>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: 10, color: '#222' }}>
              Activate {selectedBot?.name}
            </div>
            {modalLoading ? (
              <div style={{ margin: '1.5rem 0', color: '#888' }}>Loading...</div>
            ) : (
              <>
                <div style={{ marginBottom: 10, fontSize: '1.05rem', color: '#444' }}>
                  <strong>VIP Level:</strong> {vipLevel || 'N/A'}
                </div>
                <div style={{ marginBottom: 10, fontSize: '1.05rem', color: '#444' }}>
                  <strong>Bot:</strong> {selectedBot?.name}
                </div>
                {modalError && <div style={{ color: 'red', marginBottom: 10 }}>{modalError}</div>}
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
                    marginTop: 8,
                    boxShadow: '0 2px 8px rgba(16,185,129,0.08)'
                  }}
                  onClick={handleActivate}
                  disabled={modalLoading}
                >Activate</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BotSettings;
