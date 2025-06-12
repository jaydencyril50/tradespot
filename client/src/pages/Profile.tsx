import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  wallet: string;
  profilePicture?: string;
  usdtBalance?: number;
  spotBalance?: number;
  recentTransactions?: any[];
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await axios.get(`${API}/api/portfolio`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({
          ...res.data,
          profilePicture: res.data.profilePicture || undefined,
          usdtBalance: res.data.usdtBalance || 0,
          spotBalance: res.data.spotBalance || 0,
        });
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!user) return <div>No profile data found.</div>;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', boxShadow: '0 2px 16px rgba(30,60,114,0.10)', padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        <label htmlFor="profile-upload" style={{ cursor: 'pointer', marginRight: 28 }}>
          <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: '#eaf1fb' }}>
            {uploading ? (
              <svg width="36" height="36" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#1e3c72" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
                </circle>
              </svg>
            ) : (
              <img
                src={user.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName)}
                alt="Profile"
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, background: '#eaf1fb', display: 'block' }}
              />
            )}
          </div>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files && e.target.files[0];
              if (!file) return;
              setUploading(true);
              const formData = new FormData();
              formData.append('file', file);
              formData.append('upload_preset', 'tradespotppics'); // Replace with your Cloudinary upload preset
              try {
                const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dxnajmalc/image/upload', {
                  method: 'POST',
                  body: formData,
                });
                const data = await cloudRes.json();
                if (data.secure_url) {
                  setUser((prev) => prev ? { ...prev, profilePicture: data.secure_url } : prev);
                  // Save to backend
                  const token = localStorage.getItem('token');
                  if (token) {
                    await axios.put('https://tradespot-server.onrender.com/api/portfolio', { profilePicture: data.secure_url }, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                  }
                }
              } catch (err) {
                alert('Failed to upload image.');
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#1e3c72', marginBottom: 6 }}>{user.fullName}</div>
          <div style={{ color: '#888', fontSize: 15 }}>{user.email}</div>
        </div>
      </div>
      <div style={{ background: '#f7faff', boxShadow: '0 1px 8px rgba(30,60,114,0.06)', padding: 24, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontWeight: 600, color: '#1e3c72', fontSize: 17 }}>USDT Balance: <span style={{ color: '#10c98f', fontWeight: 700 }}>{user.usdtBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        <div style={{ fontWeight: 600, color: '#1e3c72', fontSize: 17 }}>SPOT Balance: <span style={{ color: '#2a5298', fontWeight: 700 }}>{user.spotBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        <div style={{ fontWeight: 600, color: '#1e3c72', fontSize: 17 }}>
          Wallet Address:
          <span style={{
            color: '#e67e22',
            fontWeight: 700,
            wordBreak: 'break-all',
            display: 'block',
            fontSize: 16,
            marginTop: 4,
            lineHeight: 1.3,
            maxWidth: '100%',
            overflowWrap: 'break-word',
          }}>{user.wallet}</span>
        </div>
      </div>
      {/* Recent Transactions Card */}
      <div style={{ background: '#f7faff', boxShadow: '0 1px 8px rgba(30,60,114,0.06)', padding: 24, marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontWeight: 700, color: '#1e3c72', fontSize: 18, marginBottom: 10 }}>Recent Transactions</div>
        {user.recentTransactions && user.recentTransactions.length > 0 ? (
          <>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: showAllTransactions ? 400 : 'none', overflowY: showAllTransactions ? 'auto' : 'visible' }}>
              {(showAllTransactions
                ? user.recentTransactions
                : user.recentTransactions.slice(0, 5)
              ).map((tx: any, idx: number) => (
                <li key={idx} style={{ marginBottom: 8, fontSize: 15, color: '#2a5298', background: '#fff', padding: '8px 12px', borderRadius: 4, boxShadow: '0 1px 4px #eaf1fb' }}>
                  <span style={{ fontWeight: 600 }}>{tx.type}</span> &bull; {tx.amount} {tx.currency} <span style={{ color: '#888', fontWeight: 400 }}>on {new Date(tx.date).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            {user.recentTransactions.length >= 5 && !showAllTransactions && (
              <button
                style={{
                  marginTop: 8,
                  background: '#eaf1fb',
                  color: '#1e3c72',
                  border: 'none',
                  padding: '6px 18px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 600,
                  alignSelf: 'center',
                  boxShadow: '0 1px 4px #eaf1fb',
                  fontSize: 15
                }}
                onClick={() => {
                  navigate('/transaction-history');
                }}
              >
                See All
              </button>
            )}
            {showAllTransactions && user.recentTransactions.length >= 5 && (
              <button
                style={{
                  marginTop: 8,
                  background: '#f7faff',
                  color: '#d32f2f',
                  border: 'none',
                  padding: '6px 18px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 600,
                  alignSelf: 'center',
                  boxShadow: '0 1px 4px #eaf1fb',
                  fontSize: 15
                }}
                onClick={() => setShowAllTransactions(false)}
              >
                Show Less
              </button>
            )}
          </>
        ) : (
          <div style={{ color: '#888', fontSize: 15 }}>No recent transactions.</div>
        )}
      </div>
      <button
        style={{
          marginTop: 16,
          background: '#ffeaea',
          color: '#d32f2f',
          border: 'none',
          padding: '10px 24px',
          borderRadius: 0,
          cursor: 'pointer',
          fontWeight: 600,
          width: '100%',
          boxShadow: '0 1px 4px #f8d7da',
        }}
        onClick={() => {
          localStorage.removeItem('token');
          navigate('/login');
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
