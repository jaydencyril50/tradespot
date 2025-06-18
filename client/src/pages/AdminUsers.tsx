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
  const [search, setSearch] = useState('');

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
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f6f9fe',
        padding: '16px 24px 10px 18px',
        border: '1.5px solid #232b36',
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0
      }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          USERS MANAGEMENT
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        {/* Search Bar */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          style={{ maxWidth: 364, width: '100%', padding: 8, fontSize: 15, border: '1px solid #e3e6ef', borderRadius: 0, marginBottom: 0 }}
        />
        {loading && <div style={{ color: '#1e3c72', fontWeight: 500 }}>Loading...</div>}
        {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {!loading && users.filter(user =>
          user.fullName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.spotid.toLowerCase().includes(search.toLowerCase()) ||
          user.wallet.toLowerCase().includes(search.toLowerCase())
        ).length === 0 && (
          <div style={{ color: '#888', fontSize: 16, textAlign: 'center', margin: '40px 0' }}>No users found.</div>
        )}
        {!loading && users.filter(user =>
          user.fullName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.spotid.toLowerCase().includes(search.toLowerCase()) ||
          user.wallet.toLowerCase().includes(search.toLowerCase())
        ).length > 0 && (
          users.filter(user =>
            user.fullName.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.spotid.toLowerCase().includes(search.toLowerCase()) ||
            user.wallet.toLowerCase().includes(search.toLowerCase())
          ).map((user, idx, arr) => (
            <div
              key={user._id}
              style={{
                background: '#fff',
                borderRadius: 0,
                boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
                border: '1px solid #e3e6ef',
                padding: '12px 16px',
                minWidth: 200,
                maxWidth: 420,
                width: '100%',
                textAlign: 'center',
                marginBottom: idx === arr.length - 1 ? 20 : 0,
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <button
                style={{ position: 'absolute', top: 10, right: 10, background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 0, padding: '4px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
                onClick={() => {
                  setSelectedUser(user);
                  setModalOpen(true);
                }}
              >
                Edit
              </button>
              <div style={{ fontWeight: 700, color: '#25324B', fontSize: '1.1rem', letterSpacing: 1, marginBottom: 6 }}>{user.fullName}</div>
              <div style={{ fontSize: '1.05rem', color: '#1e3c72', fontWeight: 600, marginBottom: 2 }}>{user.email}</div>
              <div style={{ fontSize: '1rem', color: '#555', marginBottom: 2 }}><b>Spot ID:</b> {user.spotid}</div>
              <div style={{ fontSize: '1rem', color: '#555', marginBottom: 2, wordBreak: 'break-all' }}><b>Wallet:</b> {user.wallet}</div>
              <div style={{ fontSize: '1rem', color: '#27ae60', marginBottom: 2 }}><b>USDT:</b> {user.usdtBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div style={{ fontSize: '1rem', color: '#1e3c72', marginBottom: 2 }}><b>SPOT:</b> {user.spotBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          ))
        )}
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
                borderRadius: 0,
                boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
                border: '1px solid #e3e6ef',
                padding: '24px 20px',
                minWidth: 320,
                maxWidth: 400,
                width: '100%',
                fontFamily: 'inherit',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: 16, fontSize: 18, color: '#232b36', fontWeight: 700, letterSpacing: 1 }}>Edit User Details</h2>
              {error && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{error}</div>}
              <form onSubmit={handleSaveUserEdit}>
                <div style={{ marginBottom: 12 }}>
                  <b>Name:</b>
                  <input
                    type="text"
                    value={selectedUser.fullName}
                    onChange={e => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                    style={{ width: '96%', padding: 6, marginTop: 4, borderRadius: 0, border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <b>Email:</b>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    style={{ width: '96%', padding: 6, marginTop: 4, borderRadius: 0, border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <b>Spot ID:</b>
                  <input
                    type="text"
                    value={selectedUser.spotid}
                    onChange={e => setSelectedUser({ ...selectedUser, spotid: e.target.value })}
                    style={{ width: '96%', padding: 6, marginTop: 4, borderRadius: 0, border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <b>Wallet:</b>
                  <input
                    type="text"
                    value={selectedUser.wallet}
                    onChange={e => setSelectedUser({ ...selectedUser, wallet: e.target.value })}
                    style={{ width: '96%', padding: 6, marginTop: 4, borderRadius: 0, border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <b>USDT Balance:</b>
                  <input
                    type="number"
                    value={selectedUser.usdtBalance}
                    onChange={e => setSelectedUser({ ...selectedUser, usdtBalance: parseFloat(e.target.value) })}
                    style={{ width: '96%', padding: 6, marginTop: 4, borderRadius: 0, border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <b>SPOT Balance:</b>
                  <input
                    type="number"
                    value={selectedUser.spotBalance}
                    onChange={e => setSelectedUser({ ...selectedUser, spotBalance: parseFloat(e.target.value) })}
                    style={{ width: '96%', padding: 6, marginTop: 4, borderRadius: 0, border: '1px solid #ccc' }}
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
                      borderRadius: 0,
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
                      borderRadius: 0,
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

export default AdminUsers;
