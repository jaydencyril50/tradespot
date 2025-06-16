import React, { useEffect, useState } from 'react';
import './Market.css';
import { getStocks, purchaseStock } from '../services/api';
import { FaHistory } from 'react-icons/fa';

const API = process.env.REACT_APP_API_BASE_URL;

interface Product {
  id: string;
  name: string;
  price: number;
  profit: number;
  purchaseAmount: number;
  expiresAt: string; // ISO date string
}

const Market: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const stocks = await getStocks();
        setProducts(
          stocks.map((s: any) => ({
            id: s._id,
            name: s.name,
            price: s.price,
            profit: s.profit,
            purchaseAmount: s.purchaseAmount,
            expiresAt: new Date(Date.now() + s.durationDays * 24 * 60 * 60 * 1000).toISOString(),
          }))
        );
      } catch (e: any) {
        setError(e.message || 'Failed to load market data');
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const handlePurchase = async (stockId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await purchaseStock(stockId);
      setSuccess(res.message || 'Purchase successful!');
      setShowSuccessOverlay(true);
      setTimeout(() => {
        setShowSuccessOverlay(false);
      }, 2500);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${API}/api/stock/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistory(data);
      setShowHistory(true);
    } catch (e: any) {
      setError(e.message || 'Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="market-page" style={{ marginTop: 0, paddingTop: 0 }}>
      {showSuccessOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(30,44,80,0.10)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            border: '2px solid #10c98f',
            color: '#10c98f',
            fontWeight: 700,
            fontSize: 22,
            borderRadius: 10,
            padding: '32px 48px',
            boxShadow: '0 8px 32px 0 rgba(30,60,114,0.18)',
            textAlign: 'center',
            minWidth: 220,
          }}>
            {success}
          </div>
        </div>
      )}
      <div className="market-header-center" style={{ width: '100%', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0 }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#25324B' }}>SPOT MARKET</h1>
        <button onClick={fetchHistory} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 16, padding: 0 }} title="View Purchase History">
          <FaHistory size={22} color="#25324B" />
        </button>
      </div>
      <div className="market-cards-row">
        {products.map((product) => {
          // Remove date/time from display name
          const displayName = product.name.replace(/\sPlan\s\d{4}-\d{1,2}-\d{1,2}(\s\d{1,2}:00)?/, '').trim();
          // Format price and profit to 2 decimal places
          const formattedPrice = product.purchaseAmount.toFixed(2);
          // Calculate 2% daily profit for 365 days (not compounded)
          const dailyProfit = product.purchaseAmount * 0.02;
          const totalProfit = dailyProfit * 365;
          const formattedProfit = totalProfit.toFixed(2);
          return (
            <div className={`market-card ${product.name.toLowerCase().includes('gold') ? 'gold-card' : 'silver-card'}`} key={product.id}>
              <h2>{displayName}</h2>
              <div className="market-card-amount">Price: {formattedPrice} SPOT</div>
              <div className="market-card-earn">Profit (365 days @ 2%/day): <span>{formattedProfit} SPOT</span></div>
              <button className={`market-card-btn ${product.name.toLowerCase().includes('gold') ? 'gold' : 'silver'}`} onClick={() => handlePurchase(product.id)} disabled={loading}>
                {loading ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          );
        })}
      </div>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {showHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(30, 44, 80, 0.18)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto', // Ensure modal is scrollable
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #e3e6ef',
            borderRadius: 8,
            padding: 20,
            maxWidth: 600,
            width: '95vw',
            maxHeight: '90vh',
            overflow: 'auto', // Make modal content scrollable
            boxShadow: '0 8px 32px 0 rgba(30,60,114,0.18)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>Purchase History</span>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            {loadingHistory ? <div>Loading...</div> : (
              <div style={{ overflowX: 'auto', overflowY: 'auto', maxWidth: '100%', maxHeight: 320 }}>
                <table style={{ width: '600px', minWidth: '500px', borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#f1f3f6' }}>
                      <th style={{ padding: 8, border: '1px solid #eaeaea' }}>Plan Name</th>
                      <th style={{ padding: 8, border: '1px solid #eaeaea' }}>Amount</th>
                      <th style={{ padding: 8, border: '1px solid #eaeaea' }}>Date Purchased</th>
                      <th style={{ padding: 8, border: '1px solid #eaeaea' }}>Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 12 }}>No history found.</td></tr>}
                    {history.map((h, i) => (
                      <tr key={i}>
                        <td style={{ padding: 8, border: '1px solid #eaeaea' }}>{h.stockName || h.planName || ''}</td>
                        <td style={{ padding: 8, border: '1px solid #eaeaea' }}>{h.purchaseAmount}</td>
                        <td style={{ padding: 8, border: '1px solid #eaeaea' }}>{h.startDate ? new Date(h.startDate).toLocaleString() : '-'}</td>
                        <td style={{ padding: 8, border: '1px solid #eaeaea' }}>{h.expiresAt ? new Date(h.expiresAt).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
