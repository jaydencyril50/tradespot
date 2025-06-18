import React, { useEffect, useState } from 'react';
import './Market.css';
import { getStocks, purchaseStock, getPortfolio } from '../services/api';
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
  const [spotBalance, setSpotBalance] = useState<number>(0);
  const [showInsufficientOverlay, setShowInsufficientOverlay] = useState(false);
  const [confirmPurchase, setConfirmPurchase] = useState<{ open: boolean; product?: Product } | null>(null);

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
    const fetchBalance = async () => {
      try {
        const portfolio = await getPortfolio();
        setSpotBalance(portfolio.spotBalance || 0);
      } catch {
        setSpotBalance(0);
      }
    };
    fetchStocks();
    fetchBalance();
  }, []);

  const handlePurchase = async (stockId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    // Find the product
    const product = products.find(p => p.id === stockId);
    if (!product) {
      setError('Product not found');
      setLoading(false);
      return;
    }
    // Check spot balance
    if (spotBalance < product.purchaseAmount) {
      setShowInsufficientOverlay(true);
      setLoading(false);
      return;
    }
    // Show confirmation modal
    setConfirmPurchase({ open: true, product });
    setLoading(false);
  };

  const confirmAndPurchase = async () => {
    if (!confirmPurchase?.product) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await purchaseStock(confirmPurchase.product.id);
      setSuccess(res.message || 'Purchase successful!');
      setShowSuccessOverlay(true);
      setConfirmPurchase(null);
      // Refresh balance after purchase
      try {
        const portfolio = await getPortfolio();
        setSpotBalance(portfolio.spotBalance || 0);
      } catch {}
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

  useEffect(() => {
    if (showInsufficientOverlay) {
      const timer = setTimeout(() => setShowInsufficientOverlay(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showInsufficientOverlay]);

  return (
    <div className="market-page" style={{ marginTop: 0, paddingTop: 0 }}>
      {showInsufficientOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(231,76,60,0.13)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            border: '2px solid #e74c3c',
            color: '#e74c3c',
            fontWeight: 700,
            fontSize: 22,
            borderRadius: 10,
            padding: '32px 48px',
            boxShadow: '0 8px 32px 0 rgba(231,76,60,0.18)',
            textAlign: 'center',
            minWidth: 260,
            maxWidth: 380,
            position: 'relative',
          }}>
            <button onClick={() => setShowInsufficientOverlay(false)} style={{
              position: 'absolute',
              top: 10,
              right: 16,
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#e74c3c',
              cursor: 'pointer',
            }}>&times;</button>
            <div style={{ fontSize: 32, marginBottom: 12 }}>Insufficient Balance</div>
            <div style={{ fontSize: 18, color: '#25324B', marginBottom: 8 }}>
              You do not have enough SPOT to purchase this plan.
            </div>
            <div style={{ fontSize: 15, color: '#888' }}>
              Please deposit or convert funds to SPOT and try again.
            </div>
          </div>
        </div>
      )}
      {showSuccessOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(16,201,143,0.13)',
          zIndex: 3000,
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
            boxShadow: '0 8px 32px 0 rgba(16,201,143,0.18)',
            textAlign: 'center',
            minWidth: 260,
            maxWidth: 380,
            position: 'relative',
          }}>
            <button onClick={() => setShowSuccessOverlay(false)} style={{
              position: 'absolute',
              top: 10,
              right: 16,
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#10c98f',
              cursor: 'pointer',
            }}>&times;</button>
            <div style={{ fontSize: 32, marginBottom: 12 }}>Purchase Successful</div>
            <div style={{ fontSize: 18, color: '#25324B', marginBottom: 8 }}>
              {success}
            </div>
          </div>
        </div>
      )}
      <div className="market-header-center" style={{ width: '100%', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 170, paddingLeft: 3 }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#25324B', flex: 'none' }}>SPOT MARKET</h1>
        <button onClick={fetchHistory} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 12 }} title="View Purchase History">
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
      {/* Confirmation Modal */}
      {confirmPurchase?.open && confirmPurchase.product && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(30,60,114,0.18)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            border: '2px solid #1e3c72',
            color: '#1e3c72',
            fontWeight: 700,
            fontSize: 20,
            borderRadius: 10,
            padding: '32px 36px',
            boxShadow: '0 8px 32px 0 rgba(30,60,114,0.18)',
            textAlign: 'center',
            minWidth: 260,
            maxWidth: 380,
            position: 'relative',
          }}>
            <button onClick={() => setConfirmPurchase(null)} style={{
              position: 'absolute',
              top: 10,
              right: 16,
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#1e3c72',
              cursor: 'pointer',
            }}>&times;</button>
            <div style={{ fontSize: 24, marginBottom: 12 }}>Confirm Purchase</div>
            <div style={{ fontSize: 17, color: '#25324B', marginBottom: 8 }}>
              Are you sure you want to purchase <b>{confirmPurchase.product.name}</b> for <b>{confirmPurchase.product.purchaseAmount.toFixed(2)} SPOT</b>?
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 18 }}>
              <button onClick={confirmAndPurchase} style={{ background: '#10c98f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #eaf1fb' }} disabled={loading}>
                {loading ? 'Processing...' : 'Yes, Purchase'}
              </button>
              <button onClick={() => setConfirmPurchase(null)} style={{ background: '#ffeaea', color: '#d32f2f', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #eaf1fb' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Remove the inline error for insufficient balance, keep only for other errors */}
      {error && error !== 'Insufficient SPOT balance to purchase this plan.' && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {showHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(30, 44, 80, 0.22)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
        }}>
          <div style={{
            background: '#fff',
            border: 'none',
            borderRadius: 18,
            padding: 0,
            maxWidth: 620,
            width: '95vw',
            maxHeight: '92vh',
            overflow: 'hidden',
            boxShadow: '0 16px 48px 0 rgba(30,60,114,0.22), 0 2px 8px 0 rgba(30,60,114,0.10)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px 6px 18px', // Reduced header size
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              background: 'linear-gradient(90deg, #eaf1fb 0%, #f6f9fe 100%)',
              borderBottom: '1px solid #e3e6ef',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#1e3c72"/><path d="M12 6v6l4 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#1e3c72', letterSpacing: 1 }}>Purchase History</span>
              </div>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', fontWeight: 700, marginLeft: 8, marginTop: -2, transition: 'color 0.2s' }} title="Close" onMouseOver={e => (e.currentTarget.style.color = '#e74c3c')} onMouseOut={e => (e.currentTarget.style.color = '#888')}>
                ✕
              </button>
            </div>
            <div style={{ borderBottom: '1px solid #e3e6ef', margin: '0 0 0 0' }} />
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 12px 18px 12px' }}>
              {loadingHistory ? <div>Loading...</div> : (
                <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse', fontSize: 15, background: '#f7f8fa', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px #eaf1fb' }}>
                  <thead>
                    <tr style={{ background: '#f1f3f6', color: '#1e3c72' }}>
                      <th style={{ padding: 10, border: 'none', fontWeight: 700 }}>Plan Name</th>
                      <th style={{ padding: 10, border: 'none', fontWeight: 700 }}>Amount</th>
                      <th style={{ padding: 10, border: 'none', fontWeight: 700 }}>Date Purchased</th>
                      <th style={{ padding: 10, border: 'none', fontWeight: 700 }}>Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 16, color: '#888' }}>No history found.</td></tr>}
                    {history.map((h, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f7f8fa', transition: 'background 0.2s' }} onMouseOver={e => (e.currentTarget.style.background = '#eaf1fb')} onMouseOut={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f7f8fa')}>
                        <td style={{ padding: 10, border: 'none', fontWeight: 600, color: '#25324B' }}>{h.planName || ''}</td>
                        <td style={{ padding: 10, border: 'none', color: '#10c98f', fontWeight: 700 }}>{h.purchaseAmount}</td>
                        <td style={{ padding: 10, border: 'none', color: '#2a5298' }}>{h.startDate ? new Date(h.startDate).toLocaleString() : '-'}</td>
                        <td style={{ padding: 10, border: 'none', color: '#e67e22' }}>{h.expiresAt ? new Date(h.expiresAt).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
