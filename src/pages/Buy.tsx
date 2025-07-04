import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
}

const BuySpotPage: React.FC = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    fetchBuyers();
  }, []);

  const filteredBuyers = buyers.filter((buyer) =>
    buyer.username.toLowerCase().includes(search.toLowerCase())
  );

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
          filteredBuyers.map((buyer) => (
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
              }}
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
                VIP Level: {buyer.vipLevel} | SPOT Balance: {buyer.spotBalance}
              </div>
              <div style={{ fontSize: '0.98rem', color: '#555', marginBottom: 2 }}>
                Trade Limit: {buyer.minLimit} USDT – {buyer.maxLimit} USDT
              </div>
              <div style={{ fontSize: '0.98rem', color: '#555', marginBottom: 2 }}>
                Rating: <span style={{ color: '#f1c40f', fontWeight: 700 }}>⭐ {buyer.rating}</span>
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
          ))
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
