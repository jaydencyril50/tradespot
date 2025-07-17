import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const API = process.env.REACT_APP_API_BASE_URL;

interface Buyer {
  _id: string;
  username: string;
  userId: string;
  vipLevel: number;
  minLimit: number;
  maxLimit: number;
  status: string;
  rating: number;
  reviews: string[];
  price: number; // Add price field
}

// Helper to format numbers with K/M/B suffix
const formatNumber = (n: number): string => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2).replace(/\.00$/, '') + 'K';
  return n.toString();
};

const SellSpotPage: React.FC = () => {
  const { theme } = useTheme();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userSpotBalance, setUserSpotBalance] = useState<number | null>(null);
  const [userVipLevel, setUserVipLevel] = useState<number | null>(null);
  const [spotAmount, setSpotAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState(0);
  const [inputError, setInputError] = useState('');
  const [dailyLimitWarning, setDailyLimitWarning] = useState('');
  const navigate = useNavigate();

  const fetchBuyers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/api/p2p/sellers`); // fetch from sellers endpoint
      setBuyers(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch logged-in user's SPOT balance and VIP level
  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${API}/api/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserSpotBalance(res.data.spotBalance || 0);
      setUserVipLevel(res.data.vipLevel || 1); // Expect vipLevel from backend
    } catch (err: any) {
      setUserSpotBalance(null);
      setUserVipLevel(null);
    }
  };

  useEffect(() => {
    fetchBuyers();
    fetchUserBalance();
    const interval = setInterval(() => {
      fetchBuyers();
    }, 24 * 60 * 60 * 1000); // 24 hours in ms
    return () => clearInterval(interval);
  }, []);

  // Poll user SPOT balance every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserBalance();
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Only show sellers matching user's VIP level, sorted by minLimit ascending
  const filteredBuyers = buyers
    .filter((buyer) =>
      buyer.username.toLowerCase().includes(search.toLowerCase()) &&
      (userVipLevel === null || buyer.vipLevel === userVipLevel)
    )
    .sort((a, b) => a.minLimit - b.minLimit);

  // Live calculation and validation
  useEffect(() => {
    if (!selectedBuyer) return;
    const spot = parseFloat(spotAmount);
    if (isNaN(spot) || spot <= 0) {
      setUsdtAmount(0);
      setInputError('');
      return;
    }
    const usdt = spot * (selectedBuyer.price || 500); // Use per-user price
    setUsdtAmount(usdt);
    let error = '';
    if (usdt < selectedBuyer.minLimit) {
      error = `Minimum trade is ${selectedBuyer.minLimit} USDT (${(selectedBuyer.minLimit/(selectedBuyer.price || 500)).toFixed(2)} spot)`;
    } else if (usdt > selectedBuyer.maxLimit) {
      error = `Maximum trade is ${selectedBuyer.maxLimit} USDT (${(selectedBuyer.maxLimit/(selectedBuyer.price || 500)).toFixed(2)} spot)`;
    } else if (userSpotBalance !== null && spot > userSpotBalance) {
      error = `You do not have enough SPOT. Your balance: ${userSpotBalance} SPOT`;
    }
    setInputError(error);
  }, [spotAmount, selectedBuyer, userSpotBalance]);


  // Poll trade limits every 12 hours and update min/max limits for each seller
  useEffect(() => {
    if (!buyers.length) return;
    const updateTradeLimits = async () => {
      try {
        // Fetch latest sellers from backend
        const res = await axios.get(`${API}/api/p2p/sellers`);
        const latestSellers = res.data;
        setBuyers(prevBuyers => prevBuyers.map(buyer => {
          const updated = latestSellers.find((s: any) => s._id === buyer._id);
          if (updated) {
            return {
              ...buyer,
              minLimit: updated.minLimit,
              maxLimit: updated.maxLimit
            };
          }
          return buyer;
        }));
      } catch (err) {
        // Optionally handle error
      }
    };
    const interval = setInterval(updateTradeLimits, 12 * 60 * 60 * 1000); // 12 hours
    return () => clearInterval(interval);
  }, [buyers.length]);

  // --- Place Sell Order ---
  const handleSell = async () => {
    if (!selectedBuyer || !spotAmount || !!inputError) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      setLoading(true);
      setError('');
      const res = await axios.post(
        `${API}/api/p2p/sell-orders`,
        {
          buyerId: selectedBuyer.userId,
          buyerUsername: selectedBuyer.username,
          price: selectedBuyer.price,
          spotAmount: parseFloat(spotAmount),
          usdtAmount: usdtAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowModal(false);
      setSpotAmount('');
      setUsdtAmount(0);
      setInputError('');
      fetchUserBalance(); // Refresh balance
      navigate('/order'); // Redirect to order page after placing sell order
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Failed to place sell order';
      if (msg.includes('You can only complete 1 sell order per day')) {
        setDailyLimitWarning(msg);
        setShowModal(false);
        window.scrollTo(0, 0);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear warning on mount (refresh)
    setDailyLimitWarning('');
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', border: '1.5px solid var(--primary)', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif' }}>
          SELL SPOT
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 10 }}>
        {/* Search bar */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search seller username..."
          style={{
            width: '100%',
            maxWidth: 375,
            padding: 10,
            border: '1px solid rgba(120,140,180,0.45)',
            borderRadius: 6,
            marginBottom: 10,
            fontSize: 16,
            fontFamily: 'inherit',
            background: 'var(--bg)',
            color: 'var(--text)'
          }}
        />
        {/* Error */}
        {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {loading && <div style={{ color: '#1e3c72', fontWeight: 500 }}>Loading...</div>}
        {/* Warning for daily sell order limit */}
        {dailyLimitWarning && (
          <div style={{
            color: 'var(--text)',
            background: 'var(--card-bg)',
            border: '1px solid var(--primary)',
            borderRadius: 8,
            padding: '14px 18px',
            margin: '18px 0 10px 0',
            maxWidth: 420,
            textAlign: 'center',
            fontSize: '1.08rem',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(211,47,47,0.05)',
            lineHeight: 1.5,
            alignSelf: 'center',
          }}>
            {dailyLimitWarning}
          </div>
        )}
        {/* Buyers list */}
        {filteredBuyers.length === 0 && !loading && (
          <div style={{ color: 'var(--text)', fontSize: 16, textAlign: 'center', margin: '40px 0' }}>No matching buyers found.</div>
        )}
        {!loading && !error && filteredBuyers.length > 0 && (
          filteredBuyers.map((buyer) => {
            const isDisabled = buyer.status === 'offline' || buyer.status === 'recently';
            return (
              <div
                key={buyer._id}
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: 0,
                  boxShadow: 'var(--card-shadow)',
                  border: '1px solid rgba(120,140,180,0.18)',
                  padding: '12px 16px',
                  minWidth: 200,
                  maxWidth: 380,
                  width: '100%',
                  textAlign: 'center',
                  marginBottom: 14, // Add gap between cards
                  fontFamily: 'inherit',
                  height: 170,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  pointerEvents: isDisabled ? 'none' : 'auto',
                  color: 'var(--text)'
                }}
                onClick={() => {
                  if (!isDisabled) {
                    setSelectedBuyer(buyer);
                    setShowModal(true);
                    setSpotAmount('');
                    setInputError('');
                    setUsdtAmount(0);
                  }
                }}
                tabIndex={isDisabled ? -1 : 0}
                role="button"
                aria-label={`Sell to ${buyer.username}`}
                aria-disabled={isDisabled}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem', letterSpacing: 1 }}>{buyer.username}#{buyer.userId}</span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
                  <span style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    marginRight: 6,
                    background: buyer.status === 'online' ? '#27ae60' : buyer.status === 'recently' ? '#f1c40f' : '#888',
                    boxShadow: '0 0 4px ' + (buyer.status === 'online' ? '#27ae60' : buyer.status === 'recently' ? '#f1c40f' : '#888'),
                  }}></span>
                  <strong style={{ color: buyer.status === 'online' ? '#27ae60' : buyer.status === 'recently' ? '#f1c40f' : 'var(--text)', marginRight: 8 }}>
                    {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}
                  </strong>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    VIP Level: {buyer.vipLevel === 1 ? '🏅' : buyer.vipLevel === 2 ? '💎' : '👑'}
                  </span>
                </div>
                <div style={{ fontSize: '0.98rem', color: 'var(--text)', marginBottom: 2 }}>
                  Trade Limit: {formatNumber(buyer.minLimit)} – {formatNumber(buyer.maxLimit)} USDT
                </div>
                <div style={{ fontSize: '0.98rem', color: 'var(--text)', marginBottom: 2 }}>
                  Rating: <span style={{ color: '#f1c40f', fontWeight: 700 }}>⭐ {buyer.rating}</span>
                </div>
                <div style={{ fontSize: '0.98rem', color: 'var(--text)', marginBottom: 2 }}>
                  <strong>Price:</strong> <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{buyer.price} USDT/SPOT</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    marginTop: 4,
                    marginBottom: 0,
                    minHeight: 22,
                  }}
                >
                  {buyer.reviews.map((review, idx) => (
                    <span
                      key={idx}
                      style={{
                        color: 'var(--text)',
                        fontSize: 14,
                        fontStyle: 'italic',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#f6f9fe',
                        borderRadius: 6,
                        padding: '2px 8px',
                        margin: 0,
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {review}
                    </span>
                  ))}
                </div>
              </div>
            )
          })
        )}
        {/* Modal for selling spot */}
        {showModal && selectedBuyer && (
          <Modal onClose={() => setShowModal(false)}>
            <div style={{ padding: 20, minWidth: 300, background: 'var(--card-bg)', borderRadius: 0 }}>
              <h2 style={{
                marginBottom: 10,
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                width: '100%'
              }}>
                Sell to {selectedBuyer.username}#{selectedBuyer.userId}
              </h2>
              <div style={{ marginBottom: 8 }}>
                <strong>Price per Spot:</strong> <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedBuyer.price} USDT</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Your SPOT Balance:</strong> {userSpotBalance !== null ? userSpotBalance : '...'}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Trader's Trade Limit:</strong> {formatNumber(selectedBuyer.minLimit)} – {formatNumber(selectedBuyer.maxLimit)} USDT
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Enter Spot Amount:</strong>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={spotAmount}
                  onChange={e => setSpotAmount(e.target.value)}
                  style={{ marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid rgba(120,140,180,0.45)', width: 160, background: 'var(--bg)', color: 'var(--text)' }}
                  placeholder="Spot amount"
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>USDT You Will Get:</strong> {usdtAmount}
              </div>
              {inputError && <div style={{ color: '#e74c3c', marginBottom: 8, textAlign: 'center', fontSize: 15 }}>{inputError}</div>}
              <button
                style={{
                  background: 'var(--secondary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '10px 0',
                  fontWeight: 600,
                  cursor: inputError || !spotAmount ? 'not-allowed' : 'pointer',
                  opacity: inputError || !spotAmount ? 0.6 : 1,
                  marginTop: 12,
                  width: 220,
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  fontSize: 17,
                  letterSpacing: 1
                }}
                disabled={!!inputError || !spotAmount}
                onClick={handleSell}
              >
                Sell Spot
              </button>
            </div>
          </Modal>
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
                height: 140px !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default SellSpotPage;