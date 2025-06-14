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
        const res = await fetch(`${API}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log('Notifications API response:', data); // Debug log
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
    <div style={{
      maxWidth: 520,
      margin: '0 auto',
      background: '#fff',
      boxShadow: '0 2px 16px rgba(30,60,114,0.10)',
      padding: 32,
      borderRadius: 0,
      minHeight: 400,
    }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Notifications</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {!loading && notifications.length === 0 && !error && (
        <div style={{ color: '#888', fontSize: 15 }}>No notifications.</div>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {notifications.map((n, idx) => (
          <li key={n._id || idx} style={{
            marginBottom: 12,
            background: n.read ? '#f7faff' : '#eaf1fb',
            padding: '12px 16px',
            borderRadius: 6,
            boxShadow: '0 1px 4px #eaf1fb',
            color: '#25324B',
            fontWeight: n.read ? 400 : 600,
            fontSize: 15
          }}>
            <div>{n.message}</div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;
