import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || '/api';

const AdminWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modalWithdrawal, setModalWithdrawal] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await axios.get(`${API}/api/admin/withdrawals`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // Only keep withdrawals with status 'pending'
      setWithdrawals((res.data.withdrawals || []).filter((w: any) => !w.status || w.status === 'pending'));
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
      await axios.post(`${API}/api/admin/withdrawals/${id}/${action}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      await fetchWithdrawals();
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
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          WITHDRAWAL ORDERS
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20, marginBottom: 40 }}>
        {/* Search Bar */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search withdrawals..."
          style={{ maxWidth: 365, width: '100%', padding: 8, fontSize: 15, border: '1px solid #e3e6ef', borderRadius: 0, marginBottom: 0 }}
        />
        {loading && <div style={{ color: '#1e3c72', fontWeight: 500 }}>Loading...</div>}
        {error && <div style={{ color: 'red', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {!loading && sortedWithdrawals.filter(w =>
          (!w.status || w.status === 'pending') && (
            (w.userId?.spotid || '').toLowerCase().includes(search.toLowerCase()) ||
            (w.wallet || '').toLowerCase().includes(search.toLowerCase())
          )
        ).length === 0 && (
          <div style={{ color: '#888', fontSize: 16, textAlign: 'center', margin: '40px 0' }}>No pending withdrawal orders found.</div>
        )}
        {!loading && sortedWithdrawals.filter(w =>
          (!w.status || w.status === 'pending') && (
            (w.userId?.spotid || '').toLowerCase().includes(search.toLowerCase()) ||
            (w.wallet || '').toLowerCase().includes(search.toLowerCase())
          )
        ).length > 0 && (
          sortedWithdrawals.filter(w =>
            (!w.status || w.status === 'pending') && (
              (w.userId?.spotid || '').toLowerCase().includes(search.toLowerCase()) ||
              (w.wallet || '').toLowerCase().includes(search.toLowerCase())
            )
          ).map((w) => (
            <div key={w._id} style={{
              background: '#fff',
              borderRadius: 0,
              boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
              border: '1px solid #e3e6ef',
              padding: '14px 18px',
              minWidth: 200,
              maxWidth: 420,
              width: '100%',
              textAlign: 'center',
              marginBottom: 0,
              fontFamily: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
            }}>
              <div style={{ fontWeight: 700, color: '#1e3c72', fontSize: 17, marginBottom: 2 }}>
                Spot ID: {w.userId?.spotid || '-'}
              </div>
              <div style={{ fontSize: 15, color: '#25324B', marginBottom: 2 }}>
                Amount: <b>{w.amount} USDT</b>
              </div>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 2, wordBreak: 'break-all' }}>
                Wallet: <span style={{ color: '#1e3c72', cursor: 'pointer', textDecoration: copied ? 'underline solid' : 'underline dotted', fontWeight: 500, marginLeft: 4, transition: 'text-decoration 0.2s' }} title={copied ? 'Copied!' : 'Click to copy'} onClick={() => handleCopyWallet(w.wallet)}>{w.wallet}</span>
                {copied && <span style={{ color: '#10c98f', marginLeft: 6, fontSize: 13 }}>Copied!</span>}
              </div>
              <div style={{ fontSize: 14, color: '#555', marginBottom: 2 }}>
                Status: <b>{w.status ? w.status.charAt(0).toUpperCase() + w.status.slice(1) : 'Pending'}</b>
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 4, justifyContent: 'center' }}>
                {w.status === 'approved' ? (
                  <span style={{ color: '#10c98f', fontWeight: 600 }}>Approved</span>
                ) : w.status === 'rejected' ? (
                  <span style={{ color: '#e74c3c', fontWeight: 600 }}>Rejected</span>
                ) : (
                  <>
                    <button
                      style={{ background: '#1e3c72', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 0, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                      disabled={actionLoading === w._id + 'approve'}
                      onClick={() => handleAction(w._id, 'approve')}
                    >
                      {actionLoading === w._id + 'approve' ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 0, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                      disabled={actionLoading === w._id + 'reject'}
                      onClick={() => handleAction(w._id, 'reject')}
                    >
                      {actionLoading === w._id + 'reject' ? 'Rejecting...' : 'Reject'}
                    </button>
                  </>
                )}
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
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AdminWithdrawals;
