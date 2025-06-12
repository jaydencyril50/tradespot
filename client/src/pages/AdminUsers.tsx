import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

interface User {
  _id: string;
  fullName: string;
  email: string;
  spotid: string;
  wallet: string;
  usdtBalance: number;
  spotBalance: number;
  faceStatus?: 'not_verified' | 'pending' | 'verified';
  faceImage?: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken'); // Use adminToken
        if (!token) throw new Error('Not authenticated');
        const res = await axios.get(`${API}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users || []);
      } catch (e: any) {
        setError(e?.response?.data?.error || e.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');
      // Call backend API to update user details
      await axios.put(
        `${API}/api/admin/users/${selectedUser._id}`,
        {
          fullName: selectedUser.fullName,
          email: selectedUser.email,
          spotid: selectedUser.spotid,
          wallet: selectedUser.wallet,
          usdtBalance: selectedUser.usdtBalance,
          spotBalance: selectedUser.spotBalance,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update users list in UI
      setUsers(users.map(u => u._id === selectedUser._id ? selectedUser : u));
      setModalOpen(false);
      setSelectedUser(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto', // changed from '24px auto' to '0 auto'
      background: '#fff',
      boxShadow: '0 4px 32px rgba(30,60,114,0.18)',
      padding: 24,
      borderRadius: 0,
      minHeight: 400,
    }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Users Management</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ overflowX: 'auto', maxHeight: 420 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 700 }}>
          <thead>
            <tr style={{ background: '#f7faff' }}>
              <th style={{ padding: 10, textAlign: 'left', color: '#1e3c72' }}>Name</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#1e3c72' }}>Email</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#1e3c72' }}>Spot ID</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#1e3c72' }}>Wallet</th>
              <th style={{ padding: 10, textAlign: 'right', color: '#1e3c72' }}>USDT</th>
              <th style={{ padding: 10, textAlign: 'right', color: '#1e3c72' }}>SPOT</th>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 18 }}>No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #eaf1fb' }}>
                  <td style={{ padding: 10 }}>{user.fullName}</td>
                  <td style={{ padding: 10 }}>{user.email}</td>
                  <td style={{ padding: 10 }}>{user.spotid}</td>
                  <td style={{ padding: 10, wordBreak: 'break-all' }}>{user.wallet}</td>
                  <td style={{ padding: 10, textAlign: 'right' }}>{user.usdtBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: 10, textAlign: 'right' }}>{user.spotBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <button style={{
                      background: '#1e3c72',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '6px 14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedUser(user);
                      setModalOpen(true);
                    }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* User Details Modal */}
      {modalOpen && selectedUser && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: 24,
              minWidth: 320,
              boxShadow: '0 8px 32px rgba(30,60,114,0.40)'
            }}
          >
            <h2 style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>Edit User Details</h2>
            {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
            <form onSubmit={handleSaveUserEdit}>
              <div style={{ marginBottom: 12 }}>
                <b>Name:</b>
                <input
                  type="text"
                  value={selectedUser.fullName}
                  onChange={e => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                  style={{ width: '100%', padding: 6, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <b>Email:</b>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  style={{ width: '100%', padding: 6, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <b>Spot ID:</b>
                <input
                  type="text"
                  value={selectedUser.spotid}
                  onChange={e => setSelectedUser({ ...selectedUser, spotid: e.target.value })}
                  style={{ width: '100%', padding: 6, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <b>Wallet:</b>
                <input
                  type="text"
                  value={selectedUser.wallet}
                  onChange={e => setSelectedUser({ ...selectedUser, wallet: e.target.value })}
                  style={{ width: '100%', padding: 6, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <b>USDT Balance:</b>
                <input
                  type="number"
                  value={selectedUser.usdtBalance}
                  onChange={e => setSelectedUser({ ...selectedUser, usdtBalance: parseFloat(e.target.value) })}
                  style={{ width: '100%', padding: 6, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <b>SPOT Balance:</b>
                <input
                  type="number"
                  value={selectedUser.spotBalance}
                  onChange={e => setSelectedUser({ ...selectedUser, spotBalance: parseFloat(e.target.value) })}
                  style={{ width: '100%', padding: 6, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setSelectedUser(null); }}
                  style={{
                    padding: '6px 16px',
                    background: '#eee',
                    color: '#333',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '6px 16px',
                    background: '#1e3c72',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
