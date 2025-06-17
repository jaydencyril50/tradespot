import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Use production URL for admin endpoints
const PROD_API = 'https://api.tradespot.pro';

const AdminWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modalWithdrawal, setModalWithdrawal] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError('');
    try {
      // Get admin token from localStorage or sessionStorage
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await axios.get(`${PROD_API}/admin/withdrawals`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setWithdrawals(res.data.withdrawals || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to fetch withdrawals');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Sort withdrawals so newest are at the top (by createdAt or _id)
  const sortedWithdrawals = [...withdrawals].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // fallback to _id if createdAt is missing
    return (b._id > a._id ? 1 : -1);
  });

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id + action);
    setError('');
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      await axios.post(`${PROD_API}/admin/withdrawals/${id}/${action}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      fetchWithdrawals();
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Action failed');
    }
    setActionLoading(null);
  };

  const handleCopyWallet = async (wallet: string) => {
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      // fallback: do nothing
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: '0 auto', background: '#fff', boxShadow: '0 2px 16px rgba(30,60,114,0.10)', padding: 8, borderRadius: 0 }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Withdrawal Orders</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {!loading && withdrawals.length === 0 && <div>No withdrawal orders found.</div>}
      {!loading && withdrawals.length > 0 && (
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ minWidth: 240, width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 4px', color: '#25324B', whiteSpace: 'nowrap', textAlign: 'center', width: '18%' }}>ID</th>
                <th style={{ padding: '8px 4px', color: '#25324B', whiteSpace: 'nowrap', textAlign: 'center', width: '25%' }}>Spot ID</th>
                <th style={{ padding: '8px 4px', color: '#25324B', whiteSpace: 'nowrap', textAlign: 'center', width: '25%' }}>Status</th>
                <th style={{ padding: '8px 4px', color: '#25324B', whiteSpace: 'nowrap', textAlign: 'center', width: '26%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedWithdrawals.map((w) => (
                <tr key={w._id} style={{ borderBottom: '1px solid #eaf1fb' }}>
                  <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
                    {w.shortId || (w._id ? w._id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() : '----')}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>{w.userId?.spotid || '-'}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>{w.status}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
                    {w.status === 'pending' && (
                      <>
                        <button
                          style={{ background: '#1e3c72', color: '#fff', border: 'none', padding: '6px 16px', cursor: 'pointer', borderRadius: 4, fontSize: 14, fontWeight: 600 }}
                          onClick={() => setModalWithdrawal(w)}
                        >
                          Manage
                        </button>
                      </>
                    )}
                    {w.status !== 'pending' && <span style={{ color: w.status === 'approved' ? '#10c98f' : '#e74c3c', fontWeight: 600 }}>{w.status.charAt(0).toUpperCase() + w.status.slice(1)}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modalWithdrawal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(30,60,114,0.10)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          <div style={{ background: '#f9fbff', borderRadius: 10, padding: '18px 12px 14px 12px', minWidth: 220, maxWidth: 320, boxShadow: '0 4px 16px rgba(30,60,114,0.13)', border: '1px solid #eaf1fb', fontFamily: 'inherit' }}>
            <h3 style={{ margin: 0, marginBottom: 10, color: '#1e3c72', fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>Manage Withdrawal</h3>
            <div style={{ marginBottom: 14, fontSize: 14, color: '#25324B', lineHeight: 1.5 }}>
              <div><b style={{ color: '#1e3c72' }}>Spot ID:</b> <span style={{ color: '#1e3c72', fontWeight: 600 }}>{modalWithdrawal.userId?.spotid || '-'}</span></div>
              <div><b style={{ color: '#1e3c72' }}>Wallet:</b> <span
                style={{ color: '#1e3c72', wordBreak: 'break-all', cursor: 'pointer', textDecoration: 'underline dotted', fontWeight: 500 }}
                title={copied ? 'Copied!' : 'Click to copy'}
                onClick={() => handleCopyWallet(modalWithdrawal.wallet)}
              >{modalWithdrawal.wallet}</span>{copied && <span style={{ color: '#10c98f', marginLeft: 6, fontSize: 13 }}>Copied!</span>}</div>
              <div><b style={{ color: '#1e3c72' }}>Amount:</b> <span style={{ color: '#1e3c72', fontWeight: 600 }}>{modalWithdrawal.amount} USDT</span></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 0, justifyContent: 'center' }}>
              <button
                style={{ background: '#10c98f', color: '#fff', border: 'none', padding: '7px 16px', cursor: 'pointer', borderRadius: 6, fontSize: 14, fontWeight: 600, boxShadow: '0 1px 4px rgba(16,201,143,0.08)', transition: 'background 0.2s' }}
                disabled={actionLoading === modalWithdrawal._id + 'approve'}
                onClick={() => { setModalWithdrawal(null); handleAction(modalWithdrawal._id, 'approve'); }}
              >
                {actionLoading === modalWithdrawal._id + 'approve' ? 'Approving...' : 'Approve'}
              </button>
              <button
                style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '7px 16px', cursor: 'pointer', borderRadius: 6, fontSize: 14, fontWeight: 600, boxShadow: '0 1px 4px rgba(231,76,60,0.08)', transition: 'background 0.2s' }}
                disabled={actionLoading === modalWithdrawal._id + 'reject'}
                onClick={() => { setModalWithdrawal(null); handleAction(modalWithdrawal._id, 'reject'); }}
              >
                {actionLoading === modalWithdrawal._id + 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                style={{ background: '#888', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 6, fontSize: 14, fontWeight: 600, marginLeft: 0, boxShadow: '0 1px 4px rgba(136,136,136,0.08)', transition: 'background 0.2s' }}
                onClick={() => setModalWithdrawal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;
