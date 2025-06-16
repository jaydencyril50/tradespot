import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDeposit: React.FC = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchDeposits = async () => {
    setLoading(true);
    setError('');
    try {
      // Only fetch pending deposits
      const res = await axios.get('/api/admin/deposits?status=pending');
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
      await axios.post(`/api/admin/deposits/${id}/${action}`);
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

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', boxShadow: '0 2px 16px rgba(30,60,114,0.10)', padding: 8, borderRadius: 0 }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Deposit Requests</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {!loading && deposits.length === 0 && <div>No deposit requests found.</div>}
      {!loading && deposits.length > 0 && (
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ minWidth: 320, width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>TxID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d._id} style={{ background: d.status === 'pending' ? '#f6f9fe' : '#fff' }}>
                  <td>{d.userId?.email || d.userId?.spotid || '-'}</td>
                  <td>{d.amount} USDT</td>
                  <td>
                    <span
                      style={{ color: '#1e3c72', wordBreak: 'break-all', cursor: 'pointer', textDecoration: 'underline dotted', fontWeight: 500 }}
                      title={copied ? 'Copied!' : 'Click to copy'}
                      onClick={() => handleCopyTxid(d.txid)}
                    >
                      {d.txid}
                    </span>
                    {copied && <span style={{ color: '#10c98f', marginLeft: 6, fontSize: 13 }}>Copied!</span>}
                  </td>
                  <td>{d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : (d.credited ? 'Approved' : 'Pending')}</td>
                  <td>
                    {d.status === 'approved' ? (
                      <span style={{ color: '#10c98f', fontWeight: 600 }}>Approved</span>
                    ) : d.status === 'rejected' ? (
                      <span style={{ color: '#e74c3c', fontWeight: 600 }}>Rejected</span>
                    ) : (
                      <>
                        <button
                          style={{ background: '#1e3c72', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: 4, fontSize: 14, fontWeight: 600, marginRight: 6 }}
                          disabled={actionLoading === d._id + 'approve'}
                          onClick={() => handleAction(d._id, 'approve')}
                        >
                          {actionLoading === d._id + 'approve' ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: 4, fontSize: 14, fontWeight: 600 }}
                          disabled={actionLoading === d._id + 'reject'}
                          onClick={() => handleAction(d._id, 'reject')}
                        >
                          {actionLoading === d._id + 'reject' ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDeposit;
