import React, { useState } from 'react';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import AdminDeposit from './AdminDeposit';

const adminButtons = [
  { label: 'USERS', icon: '👤' },
  { label: 'CASHOUT', icon: '💸' },
  { label: 'DEPOSIT', icon: '💰' },
  { label: 'NOTICE', icon: '📢' },
  { label: 'RECENTS', icon: '🕒' },
  { label: 'SEND FUNDS', icon: '🏧' },
  { label: 'TRASH', icon: '🗑️' },
  { label: 'TEAM', icon: '👥' },
  { label: 'MESSAGE', icon: '✉️' },
  { label: 'FLEX DROP', icon: '🎁' },
  { label: 'LOGOUT', icon: '🚪' },
  { label: 'STATISTICS', icon: '📊' },
];

const userDetails = [
  { key: 'email', label: 'Email' },
  { key: 'usdt', label: 'USDT Balance' },
  { key: 'username', label: 'Username' },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<{ key: string, label: string } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showDetailsList, setShowDetailsList] = useState(false);

  const handleEditDetail = (detail: { key: string, label: string }) => {
    setEditingDetail(detail);
    setInputValue('');
    setShowDetailsList(false);
    setModalOpen(true);
  };

  const handleSave = () => {
    // Save logic here
    setModalOpen(false);
    setEditingDetail(null);
  };
  const openUserModal = () => {
    setShowDetailsList(true);
    setEditingDetail(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDetail(null);
    setShowDetailsList(false);
  };

  const handleLogout = () => {
    // Clear auth tokens or session here
    localStorage.removeItem('adminToken'); // Use the correct admin token key
    navigate('/admin/login'); // Redirect to admin login page
  };

  return (
    <div className="admin-dashboard-page">
      <h1 className="admin-dashboard-title">Admin Dashboard</h1>
      <div className="admin-dashboard-cards">
        {adminButtons.map(btn => (
          <div
            className="admin-dashboard-card"
            key={btn.label}
            onClick={() => {
              if (btn.label === 'USERS') {
                navigate('/admin/users'); 
              } else if (btn.label === 'CASHOUT') {
                navigate('/admin/withdrawals');
              } else if (btn.label === 'DEPOSIT') {
                navigate('/admin/deposit');
              } else if (btn.label === 'SEND FUNDS') {
                navigate('/admin/send-funds');
              } else if (btn.label === 'NOTICE') {
                navigate('/admin/notice');
              } else if (btn.label === 'RECENTS') {
                navigate('/admin/recents');
              } else if (btn.label === 'TRASH') {
                navigate('/admin/trash');
              } else if (btn.label === 'TEAM') {
                navigate('/admin/team');
              } else if (btn.label === 'MESSAGE') {
                navigate('/admin/chat');
              } else if (btn.label === 'FLEX DROP') {
                navigate('/admin/flex-drop'); // New route
              } else if (btn.label === 'STATISTICS') {
                navigate('/admin/platform-stats');
              } else if (btn.label === 'LOGOUT') {
                handleLogout();
              }
            }}
            style={{ userSelect: 'none', pointerEvents: 'auto' }}
          >
            <span style={{ fontSize: 36, marginBottom: 12 }}>{btn.icon}</span>
            {btn.label}
          </div>
        ))}
      </div>

      {/* Modal for editing user details */}
      {modalOpen && (
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
              minWidth: 280,
              boxShadow: '0 8px 32px rgba(30,60,114,0.40)'
            }}
          >
            {showDetailsList && !editingDetail && (
              <>
                <h2 style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>
                  Edit User Detail
                </h2>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                  {userDetails.map(detail => (
                    <li key={detail.key} style={{ marginBottom: 10 }}>
                      <button
                        style={{
                          width: '100%',
                          padding: '8px 0',
                          border: '1px solid #eee',
                          borderRadius: 4,
                          background: '#f7f7f7',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleEditDetail(detail)}
                      >
                        {detail.label}
                      </button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <button
                    onClick={closeModal}
                    style={{
                      padding: '6px 16px',
                      background: '#eee',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            {editingDetail && (
              <>
                <h2 style={{ margin: 0, marginBottom: 16, fontSize: 18 }}>
                  Edit {editingDetail.label}
                </h2>
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={`Enter new ${editingDetail.label.toLowerCase()}`}
                  style={{
                    width: '100%',
                    padding: 8,
                    marginBottom: 16,
                    borderRadius: 4,
                    border: '1px solid #ccc'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    onClick={closeModal}
                    style={{
                      padding: '6px 16px',
                      background: '#eee',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '6px 16px',
                      background: '#1e3c72',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
