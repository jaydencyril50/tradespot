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
  flexBalance?: number;
  vipLevel?: number; // Add vipLevel
  recentTransactions?: any[];
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const getPersisted = (key: string, def: boolean) => {
    const val = localStorage.getItem(key);
    return val === null ? def : val === 'true';
  };
  const [hideName, setHideName] = useState(() => getPersisted('hideName', false));
  const [hideEmail, setHideEmail] = useState(() => getPersisted('hideEmail', false));
  const [hideWallet, setHideWallet] = useState(() => getPersisted('hideWallet', false));
  const [hideUSDT, setHideUSDT] = useState(() => getPersisted('hideUSDT', false));
  const [hideSPOT, setHideSPOT] = useState(() => getPersisted('hideSPOT', false));
  const [hideFLEX, setHideFLEX] = useState(() => getPersisted('hideFLEX', false));
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
          flexBalance: res.data.flexBalance || 0,
          vipLevel: res.data.vipLevel, // Always use backend value
        });
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // Poll balances every 5 seconds
    const interval = setInterval(fetchProfile, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!user) return <div>No profile data found.</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', border: '1.5px solid #282829', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif' }}>
          PROFILE
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20, paddingBottom: 40 }}>
        {/* Profile Info Card */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: 0,
          boxShadow: 'var(--card-shadow)',
          border: 'none',
          padding: '12px 16px',
          minWidth: 200,
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          height: 140,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          position: 'relative', // For VIP badge positioning
        }}>
          <label htmlFor="profile-upload" style={{ cursor: 'pointer', marginLeft: 8, marginRight: 12, position: 'relative' }}>
            <div style={{
              width: 70,
              height: 70,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              background: 'var(--bg)',
              position: 'relative',
            }}>
              {uploading ? (
                <svg width="36" height="36" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="var(--primary)" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
                  </circle>
                </svg>
              ) : (
                <img
                  src={user.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName)}
                  alt="Profile"
                  style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, background: 'var(--bg)', display: 'block' }}
                />
              )}
              {/* VIP Badge */}
              {typeof user.vipLevel === 'number' && (
                <span style={{
                  position: 'absolute',
                  bottom: -10,
                  right: -15,
                  fontSize: 30,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  boxShadow: 'none',
                  fontFamily: 'serif',
                  filter: 'drop-shadow(0 2px 4px rgba(30,60,114,0.18))',
                  transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                }}>
                  {user.vipLevel === 3 && '👑'}
                  {user.vipLevel === 2 && '💎'}
                  {user.vipLevel === 1 && '🏅'}
                </span>
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
                formData.append('upload_preset', 'tradespotppics');
                try {
                  const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dxnajmalc/image/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  const data = await cloudRes.json();
                  if (data.secure_url) {
                    setUser((prev) => prev ? { ...prev, profilePicture: data.secure_url } : prev);
                    const token = localStorage.getItem('token');
                    if (token) {
                      await axios.put(`${API}/api/portfolio`, { profilePicture: data.secure_url }, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                    }
                  }
                } catch (err) {
                  window.alert('Failed to upload image.');
                } finally {
                  setUploading(false);
                }
              }}
            />
          </label>
          <div style={{
            flex: 1,
            textAlign: 'left',
            marginLeft: 12, // shift text slightly to the right
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <div
              style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginBottom: 4, cursor: 'pointer', userSelect: 'none' }}
              onClick={() => { setHideName(v => { localStorage.setItem('hideName', (!v).toString()); return !v; }); }}
              title="Click to hide/show name"
            >
              {hideName ? '****' : user.fullName}
            </div>
            <div
              style={{ color: '#888', fontSize: 15, cursor: 'pointer', userSelect: 'none' }}
              onClick={() => { setHideEmail(v => { localStorage.setItem('hideEmail', (!v).toString()); return !v; }); }}
              title="Click to hide/show email"
            >
              {hideEmail ? '****' : user.email}
            </div>
          </div>
        </div>
        {/* Balances Card */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: 0,
          boxShadow: 'var(--card-shadow)',
          border: 'none',
          padding: '12px 16px',
          minWidth: 200,
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          marginBottom: 0,
          fontFamily: 'inherit',
          height: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div
            style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 16, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => { setHideUSDT(v => { localStorage.setItem('hideUSDT', (!v).toString()); return !v; }); }}
            title="Click to hide/show USDT balance"
          >
            USDT Balance: <span style={{ color: '#10c98f', fontWeight: 700 }}>{hideUSDT ? '****' : user.usdtBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div
            style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 16, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => { setHideSPOT(v => { localStorage.setItem('hideSPOT', (!v).toString()); return !v; }); }}
            title="Click to hide/show SPOT balance"
          >
            SPOT Balance: <span style={{ color: '#2a5298', fontWeight: 700 }}>{hideSPOT ? '****' : user.spotBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div
            style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 16, marginTop: 1, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => { setHideFLEX(v => { localStorage.setItem('hideFLEX', (!v).toString()); return !v; }); }}
            title="Click to hide/show FLEX balance"
          >
            FLEX Balance: <span style={{ color: '#e67e22', fontWeight: 700 }}>{hideFLEX ? '****' : user.flexBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        {/* Wallet Card */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: 0,
          boxShadow: 'var(--card-shadow)',
          border: 'none',
          padding: '12px 16px',
          minWidth: 200,
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          marginBottom: 0,
          fontFamily: 'inherit',
          height: 80,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 16 }}>
            Wallet Address:
            <span
              style={{
                color: '#e67e22',
                fontWeight: 700,
                wordBreak: 'break-all',
                display: 'block',
                fontSize: 15,
                marginTop: 4,
                lineHeight: 1.3,
                maxWidth: '100%',
                overflowWrap: 'break-word',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => { setHideWallet(v => { localStorage.setItem('hideWallet', (!v).toString()); return !v; }); }}
              title="Click to hide/show wallet address"
            >
              {hideWallet ? '****' : user.wallet}
            </span>
          </div>
        </div>
        {/* Recent Transactions Card */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: 0,
          boxShadow: 'var(--card-shadow)',
          border: 'none',
          padding: '12px 16px',
          minWidth: 200,
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          marginBottom: 0,
          fontFamily: 'inherit',
          minHeight: 320, // Ensure it's taller than the other cards
          height: 380, // Explicitly set a larger height
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 17, marginBottom: 8 }}>Recent Transactions</div>
          {user.recentTransactions && user.recentTransactions.length > 0 ? (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%', flex: 1, overflowY: 'auto' }}>
                {(showAllTransactions
                  ? user.recentTransactions
                  : user.recentTransactions.slice(0, 5)
                ).map((tx: any, idx: number) => (
                  <li key={idx} style={{ marginBottom: 8, fontSize: 15, color: 'var(--primary)', background: 'var(--bg)', padding: '8px 12px', borderRadius: 4, boxShadow: '0 1px 4px var(--bg)', textAlign: 'left' }}>
                    <span style={{ fontWeight: 600 }}>{tx.type}</span> &bull; {tx.amount} {tx.currency} <span style={{ color: '#888', fontWeight: 400 }}>on {new Date(tx.date).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              {user.recentTransactions.length >= 5 && !showAllTransactions && (
                <button
                  style={{
                    marginTop: 8,
                    background: 'var(--bg)',
                    color: 'var(--primary)',
                    border: 'none',
                    padding: '6px 18px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 600,
                    alignSelf: 'center',
                    boxShadow: '0 1px 4px var(--bg)',
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
                    background: 'var(--bg)',
                    color: '#d32f2f',
                    border: 'none',
                    padding: '6px 18px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 600,
                    alignSelf: 'center',
                    boxShadow: '0 1px 4px var(--bg)',
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
        {/* Logout Card */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: 0,
          boxShadow: 'var(--card-shadow)',
          border: 'none',
          padding: '12px 16px',
          minWidth: 200,
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          marginBottom: 0,
          fontFamily: 'inherit',
          height: 80,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <button
            style={{
              background: '#ffeaea',
              color: '#d32f2f',
              border: 'none',
              padding: '10px 24px',
              borderRadius: 0,
              cursor: 'pointer',
              fontWeight: 600,
              width: '100%',
              boxShadow: '0 1px 4px #f8d7da',
              fontSize: 16
            }}
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
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
                height: 90px !important;
              }

              /* 👇 Shift name, email & profile picture to the right on small screens */
              div[style*="display: flex"][style*="justify-content: flex-start"] {
                padding-left: 12px !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Profile;
