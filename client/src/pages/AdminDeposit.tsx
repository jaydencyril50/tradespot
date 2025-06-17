import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

const tableStyles = {
  width: '100%',
  borderCollapse: 'separate' as const,
  borderSpacing: 0,
  fontSize: 14,
  background: '#f9fbfd',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(30,60,114,0.07)'
};
const thStyles = {
  background: '#eaf1fb',
  color: '#1e3c72',
  fontWeight: 700,
  padding: '12px 16px',
  textAlign: 'left' as const,
  borderBottom: '2px solid #dbeafe',
  letterSpacing: 0.5,
};
const tdStyles = {
  padding: '12px 16px',
  borderBottom: '1px solid #e3e8f0',
  color: '#1e293b',
  background: '#fff',
  fontWeight: 500,
};
const trHover = {
  transition: 'background 0.2s',
};

const AdminDeposit: React.FC = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDeposits = async () => {
    setLoading(true);
    setError('');
    try {
      // Get admin token from localStorage or sessionStorage
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await axios.get(`${API}/api/admin/deposits?status=pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setDeposits(res.data.deposits || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to fetch deposits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id + action);
    setError('');
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      await axios.post(`${API}/api/admin/deposits/${id}/${action}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      fetchDeposits();
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Action failed');
    }
    setActionLoading(null);
  };

  const handleCopyTxid = async (txid: string) => {
    try {
      await navigator.clipboard.writeText(txid);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {}
  };

  const openModal = (deposit: any) => {
    setSelectedDeposit(deposit);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDeposit(null);
    setCopied(false);
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', boxShadow: '0 2px 16px rgba(30,60,114,0.10)', padding: 18, borderRadius: 8 }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Deposit Requests</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {!loading && deposits.length === 0 && <div>No deposit requests found.</div>}
      {!loading && deposits.length > 0 && (
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={tableStyles}>
            <thead>
              <tr>
                <th style={thStyles}>User Email</th>
                <th style={thStyles}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d._id} style={{ ...trHover, background: d.status === 'pending' ? '#f6f9fe' : '#fff' }}>
                  <td style={tdStyles}>{d.userId?.email || d.userId?.spotid || '-'}</td>
                  <td style={tdStyles}>
                    <button
                      style={{ background: '#1e3c72', color: '#fff', border: 'none', padding: '6px 18px', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 4px rgba(30,60,114,0.08)' }}
                      onClick={() => openModal(d)}
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
      {/* Modal for viewing TxID and Approve/Reject */}
      {modalOpen && selectedDeposit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,60,114,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 32px rgba(30,60,114,0.18)', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: 10, right: 14, background: 'none', border: 'none', fontSize: 22, color: '#1e3c72', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ color: '#1e3c72', fontWeight: 700, marginBottom: 16, fontSize: 18 }}>Deposit Details</h3>
            <div style={{ marginBottom: 12 }}>
              <strong>User:</strong> {selectedDeposit.userId?.email || selectedDeposit.userId?.spotid || '-'}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Amount:</strong> {selectedDeposit.amount} USDT
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>TxID:</strong>
              <span
                style={{ color: '#1e3c72', wordBreak: 'break-all', cursor: 'pointer', textDecoration: copied ? 'underline solid' : 'underline dotted', fontWeight: 500, marginLeft: 8, transition: 'text-decoration 0.2s' }}
                title={copied ? 'Copied!' : 'Click to copy'}
                onClick={() => handleCopyTxid(selectedDeposit.txid)}
              >
                {selectedDeposit.txid}
              </span>
              {copied && <span style={{ color: '#10c98f', marginLeft: 6, fontSize: 13 }}>Copied!</span>}
            </div>
            <div style={{ marginBottom: 18 }}>
              <strong>Status:</strong> {selectedDeposit.status ? selectedDeposit.status.charAt(0).toUpperCase() + selectedDeposit.status.slice(1) : (selectedDeposit.credited ? 'Approved' : 'Pending')}
            </div>
            {selectedDeposit.status === 'approved' ? (
              <span style={{ color: '#10c98f', fontWeight: 600 }}>Approved</span>
            ) : selectedDeposit.status === 'rejected' ? (
              <span style={{ color: '#e74c3c', fontWeight: 600 }}>Rejected</span>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  style={{ background: '#1e3c72', color: '#fff', border: 'none', padding: '8px 18px', cursor: 'pointer', borderRadius: 4, fontSize: 15, fontWeight: 600 }}
                  disabled={actionLoading === selectedDeposit._id + 'approve'}
                  onClick={() => handleAction(selectedDeposit._id, 'approve')}
                >
                  {actionLoading === selectedDeposit._id + 'approve' ? 'Approving...' : 'Approve'}
                </button>
                <button
                  style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 18px', cursor: 'pointer', borderRadius: 4, fontSize: 15, fontWeight: 600 }}
                  disabled={actionLoading === selectedDeposit._id + 'reject'}
                  onClick={() => handleAction(selectedDeposit._id, 'reject')}
                >
                  {actionLoading === selectedDeposit._id + 'reject' ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeposit;
