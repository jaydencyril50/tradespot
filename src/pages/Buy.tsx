import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL;

interface Buyer {
  _id: string;
  username: string;
  userId: string;
  vipLevel: number;
  spotBalance: number;
  minLimit: number;
  maxLimit: number;
  status: string;
  rating: number;
  reviews: string[];
  price: number; // Add price field
}

const BuySpotPage: React.FC = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userUSDTBalance, setUserUSDTBalance] = useState<number | null>(null);
  const [spotAmount, setSpotAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState(0);
  const [inputError, setInputError] = useState('');
  const navigate = useNavigate();

  const fetchBuyers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/api/p2p/buyers`);
      setBuyers(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to fetch buyers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch logged-in user's USDT balance (fetch like profile.tsx)
  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${API}/api/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserUSDTBalance(res.data.usdtBalance || 0);
    } catch (err: any) {
      setUserUSDTBalance(null);
    }
  };

  useEffect(() => {
    fetchBuyers();
    fetchUserBalance();
    // Poll for new prices every 2 hours
    const interval = setInterval(() => {
      fetchBuyers();
    }, 2 * 60 * 60 * 1000); // 2 hours in ms
    return () => clearInterval(interval);
  }, []);

  const filteredBuyers = buyers.filter((buyer) =>
    buyer.username.toLowerCase().includes(search.toLowerCase())
  );

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
    } else if (userUSDTBalance !== null && usdt > userUSDTBalance) {
      error = `You do not have enough USDT. Your balance: ${userUSDTBalance} USDT`;
    }
    setInputError(error);
  }, [spotAmount, selectedBuyer, userUSDTBalance]);

  // --- Status randomizer for buyers ---
  useEffect(() => {
    if (!buyers.length) return;
    const interval = setInterval(() => {
      setBuyers(prevBuyers => prevBuyers.map(buyer => {
        // Randomly pick a new status
        const statuses = ['online', 'offline', 'recently'];
        let newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        // Avoid repeating the same status
        while (newStatus === buyer.status && statuses.length > 1) {
          newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        }
        return { ...buyer, status: newStatus };
      }));
    }, 2 * 60 * 60 * 1000); // 2 hours in ms
    return () => clearInterval(interval);
  }, [buyers.length]);

  // Helper to format numbers with K/M/B suffix
  const formatNumber = (n: number): string => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(2).replace(/\.00$/, '') + 'K';
    return n.toString();
  };

  // Place buy logic here
  const handleBuySpot = async () => {
    if (!selectedBuyer || !spotAmount || !!inputError) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.post(
        `${API}/api/p2p/orders`,
        {
          buyerId: selectedBuyer.userId,
          buyerUsername: selectedBuyer.username,
          price: selectedBuyer.price,
          spotAmount: parseFloat(spotAmount),
          usdtAmount: usdtAmount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Close modal and go to order page (optionally pass orderId)
      setShowModal(false);
      navigate('/order', { state: { orderId: res.data.order._id } });
    } catch (err: any) {
      setInputError(err?.response?.data?.error || err.message || 'Order failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          BUY SPOT
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 10 }}>
        {/* Search bar */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search buyer username..."
          style={{
            width: '100%',
            maxWidth: 375,
            padding: 10,
            border: '1px solid #ccc',
            borderRadius: 6,
            marginBottom: 10,
            fontSize: 16,
            fontFamily: 'inherit',
          }}
        />
        {/* Error */}
        {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {loading && <div style={{ color: '#1e3c72', fontWeight: 500 }}>Loading...</div>}
        {/* Buyers list */}
        {filteredBuyers.length === 0 && !loading && (
          <div style={{ color: '#888', fontSize: 16, textAlign: 'center', margin: '40px 0' }}>No matching buyers found.</div>
        )}
        {!loading && !error && filteredBuyers.length > 0 && (
          filteredBuyers.map((buyer) => {
            const isDisabled = buyer.status === 'offline' || buyer.status === 'recently';
            return (
              <div
                key={buyer._id}
                style={{
                  background: '#fff',
                  borderRadius: 0,
                  boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
                  border: '1px solid #e3e6ef',
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
                aria-label={`Buy from ${buyer.username}`}
                aria-disabled={isDisabled}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: '#25324B', fontSize: '1.1rem', letterSpacing: 1 }}>{buyer.username}#{buyer.userId}</span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Status: 
                  <span style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    marginRight: 6,
                    background: buyer.status === 'online' ? '#27ae60' : buyer.status === 'recently' ? '#f1c40f' : '#888',
                    boxShadow: '0 0 4px ' + (buyer.status === 'online' ? '#27ae60' : buyer.status === 'recently' ? '#f1c40f' : '#888'),
                  }}></span>
                  <strong style={{ color: buyer.status === 'online' ? '#27ae60' : buyer.status === 'recently' ? '#f1c40f' : '#888' }}>{buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}</strong>
                </div>
                <div style={{ fontSize: '0.98rem', color: '#555', marginBottom: 2 }}>
                  VIP Level: {buyer.vipLevel === 1 ? '🏅' : buyer.vipLevel === 2 ? '💎' : '👑'} | SPOT Balance: {buyer.spotBalance}
                </div>
                <div style={{ fontSize: '0.98rem', color: '#555', marginBottom: 2 }}>
                  Trade Limit: {formatNumber(buyer.minLimit)} – {formatNumber(buyer.maxLimit)} USDT
                </div>
                <div style={{ fontSize: '0.98rem', color: '#555', marginBottom: 2 }}>
                  Rating: <span style={{ color: '#f1c40f', fontWeight: 700 }}>⭐ {buyer.rating}</span>
                </div>
                <div style={{ fontSize: '0.98rem', color: '#555', marginBottom: 2 }}>
                  <strong>Price:</strong> <span style={{ color: '#1e3c72', fontWeight: 700 }}>{buyer.price} USDT/SPOT</span>
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
                        color: '#888',
                        fontSize: 14,
                        fontStyle: 'italic',
                        background: '#f6f9fe',
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
        {/* Modal for buying spot */}
        {showModal && selectedBuyer && (
          <Modal onClose={() => setShowModal(false)}>
            <div style={{ padding: 20, minWidth: 300, background: '#fff', borderRadius: 0 }}>
              <h2 style={{
                marginBottom: 10,
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#25324B',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                width: '100%'
              }}>
                Buy from {selectedBuyer.username}#{selectedBuyer.userId}
              </h2>
              <div style={{ marginBottom: 8 }}>
                <strong>Price per Spot:</strong> <span style={{ color: '#1e3c72', fontWeight: 700 }}>{selectedBuyer.price} USDT/SPOT</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Your USDT Balance:</strong> {userUSDTBalance !== null ? userUSDTBalance : '...'}
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
                  style={{ marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc', width: 160 }}
                  placeholder="Spot amount"
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>USDT You Will Pay:</strong> {usdtAmount}
              </div>
              {inputError && <div style={{ color: '#e74c3c', marginBottom: 8, textAlign: 'center', fontSize: 15 }}>{inputError}</div>}
              <button
                style={{
                  background: '#1e3c72',
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
                onClick={handleBuySpot}
              >
                Buy Spot
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

export default BuySpotPage;
