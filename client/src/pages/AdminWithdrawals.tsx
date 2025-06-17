import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

const AdminWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modalWithdrawal, setModalWithdrawal] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'txid' | 'manage' | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await axios.get(`${API}/admin/withdrawals`, {
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

  const sortedWithdrawals = [...withdrawals].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return (b._id > a._id ? 1 : -1);
  });

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id + action);
    setError('');
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      await axios.post(`${API}/admin/withdrawals/${id}/${action}`, {}, {
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
    } catch (err) {}
  };

  // Modal close helper
  const closeModal = () => {
    setModalWithdrawal(null);
    setModalType(null);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', boxShadow: '0 2px 16px rgba(30,60,114,0.10)', padding: 24, borderRadius: 8 }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Withdrawal Orders</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {!loading && withdrawals.length === 0 && <div>No withdrawal orders found.</div>}
      {!loading && withdrawals.length > 0 && (
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ minWidth: 480, width: '100%', borderCollapse: 'collapse', fontSize: 14, tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 4px', color: '#25324B', whiteSpace: 'nowrap', textAlign: 'center', width: '12%' }}>User</th>
                <th style={{ padding: '10px 4px', color: '#25324B', whiteSpace: 'nowrap', textAlign: 'center', width: '14%' }}>Amount</th>
                <th style={{ padding: '10px 4px', color: '#25324B', whiteSpace: 'nowrap', textAlign: 'center', width: '18%' }}>TxID</th>
                <th style={{ padding: '10px 4px', color: '#25324B', whiteSpace: 'nowrap', textAlign: 'center', width: '14%' }}>Status</th>
                <th style={{ padding: '10px 4px', color: '#25324B', whiteSpace: 'nowrap', textAlign: 'center', width: '18%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedWithdrawals.map((w) => (
                <tr key={w._id} style={{ borderBottom: '1px solid #eaf1fb' }}>
                  <td style={{ padding: '10px 4px', textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{w.userId?.email || '-'}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'center', verticalAlign: 'middle' }}>{w.amount} USDT</td>
                  <td style={{ padding: '10px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <button
                      style={{ background: '#1e3c72', color: '#fff', border: 'none', padding: '5px 14px', cursor: 'pointer', borderRadius: 4, fontSize: 13, fontWeight: 600 }}
                      onClick={() => { setModalWithdrawal(w); setModalType('txid'); }}
                    >
                      View
                    </button>
                  </td>
                  <td style={{ padding: '10px 4px', textAlign: 'center', verticalAlign: 'middle' }}>{w.status.charAt(0).toUpperCase() + w.status.slice(1)}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <button
                      style={{ background: '#1e3c72', color: '#fff', border: 'none', padding: '5px 14px', cursor: 'pointer', borderRadius: 4, fontSize: 13, fontWeight: 600 }}
                      onClick={() => { setModalWithdrawal(w); setModalType('manage'); }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* TxID Modal */}
      {modalWithdrawal && modalType === 'txid' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(30,60,114,0.10)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          <div style={{ background: '#f9fbff', borderRadius: 10, padding: '18px 18px 14px 18px', minWidth: 260, maxWidth: 340, boxShadow: '0 4px 16px rgba(30,60,114,0.13)', border: '1px solid #eaf1fb', fontFamily: 'inherit' }}>
            <h3 style={{ margin: 0, marginBottom: 10, color: '#1e3c72', fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>Transaction ID</h3>
            <div style={{ marginBottom: 18, fontSize: 15, color: '#25324B', wordBreak: 'break-all', background: '#fff', padding: 10, borderRadius: 6, border: '1px solid #eaf1fb' }}>{modalWithdrawal.txid || '-'}</div>
            <button
              style={{ background: '#888', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 6, fontSize: 14, fontWeight: 600, marginLeft: 0, boxShadow: '0 1px 4px rgba(136,136,136,0.08)', transition: 'background 0.2s' }}
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Manage Modal */}
      {modalWithdrawal && modalType === 'manage' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(30,60,114,0.10)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          <div style={{ background: '#f9fbff', borderRadius: 10, padding: '18px 12px 14px 12px', minWidth: 240, maxWidth: 320, boxShadow: '0 4px 16px rgba(30,60,114,0.13)', border: '1px solid #eaf1fb', fontFamily: 'inherit' }}>
            <h3 style={{ margin: 0, marginBottom: 10, color: '#1e3c72', fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>Manage Withdrawal</h3>
            <div style={{ marginBottom: 14, fontSize: 14, color: '#25324B', lineHeight: 1.5 }}>
              <div><b style={{ color: '#1e3c72' }}>User:</b> <span style={{ color: '#1e3c72', fontWeight: 600 }}>{modalWithdrawal.userId?.email || '-'}</span></div>
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
                onClick={() => { closeModal(); handleAction(modalWithdrawal._id, 'approve'); }}
              >
                {actionLoading === modalWithdrawal._id + 'approve' ? 'Approving...' : 'Approve'}
              </button>
              <button
                style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '7px 16px', cursor: 'pointer', borderRadius: 6, fontSize: 14, fontWeight: 600, boxShadow: '0 1px 4px rgba(231,76,60,0.08)', transition: 'background 0.2s' }}
                disabled={actionLoading === modalWithdrawal._id + 'reject'}
                onClick={() => { closeModal(); handleAction(modalWithdrawal._id, 'reject'); }}
              >
                {actionLoading === modalWithdrawal._id + 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                style={{ background: '#888', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 6, fontSize: 14, fontWeight: 600, marginLeft: 0, boxShadow: '0 1px 4px rgba(136,136,136,0.08)', transition: 'background 0.2s' }}
                onClick={closeModal}
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
