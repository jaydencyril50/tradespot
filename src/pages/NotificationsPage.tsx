import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_BASE_URL;

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated. Please log in.');
          setLoading(false);
          return;
        }
        // Fetch notifications only
        const res = await fetch(`${API}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setNotifications(data.notifications || []);
        // Mark all as read
        await fetch(`${API}/api/notifications/mark-read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch notifications');
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', border: '1.5px solid #282829', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif' }}>
          NOTIFICATIONS
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20, marginBottom: 40 }}>
        {loading && <div style={{ color: 'var(--primary)', fontWeight: 500 }}>Loading...</div>}
        {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {!loading && notifications.length === 0 && !error && (
          <div style={{ color: '#888', fontSize: 16, textAlign: 'center', margin: '40px 0' }}>No notifications.</div>
        )}
        {!loading && !error && notifications.length > 0 && (
          notifications.map((n, idx) => (
            <div
              key={n._id || idx}
              style={{
                background: 'var(--card-bg)',
                borderRadius: 0,
                boxShadow: 'var(--card-shadow)',
                border: '1px solid #282829',
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
                fontWeight: n.read ? 400 : 600,
                color: 'var(--text)',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15, marginBottom: 4 }}>{n.message}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{new Date(n.createdAt).toLocaleString()}</div>
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
                height: 90px !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default NotificationsPage;
