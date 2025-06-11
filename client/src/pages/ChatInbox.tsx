import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface InboxItem {
  spotid: string;
  latest?: {
    text?: string;
    image?: string;
    from?: 'admin' | 'user';
    createdAt?: string;
  };
  unreadCount: number;
}

const ChatInbox: React.FC = () => {
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInbox = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await axios.get('http://localhost:5000/api/chat/inbox', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInbox(res.data.inbox || []);
      } catch (e: any) {
        setError(e?.response?.data?.error || e.message || 'Failed to load inbox');
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', boxShadow: '0 4px 32px rgba(30,60,114,0.18)', padding: 24, borderRadius: 0, minHeight: 400 }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Chats</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {inbox.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: 18 }}>No conversations found.</div>
      ) : (
        <div>
          {inbox.map((item) => (
            <div
              key={item.spotid}
              style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #eaf1fb',
                padding: '14px 0',
                cursor: 'pointer',
                background: item.unreadCount > 0 ? '#f2f6fd' : '#fff',
              }}
              onClick={() => navigate(`/chat/${item.spotid}`)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#25324B', fontSize: 16 }}>
                  Support
                </div>
                <div style={{ color: '#888', fontSize: 14, marginTop: 2 }}>
                  {item.latest?.text ? item.latest.text.slice(0, 40) : item.latest?.image ? '[Image]' : ''}
                </div>
              </div>
              {item.unreadCount > 0 && (
                <div style={{ background: '#10c98f', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 13, fontWeight: 600, marginLeft: 10 }}>
                  {item.unreadCount}
                </div>
              )}
              <div style={{ color: '#aaa', fontSize: 12, marginLeft: 16 }}>
                {item.latest?.createdAt ? new Date(item.latest.createdAt).toLocaleString() : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatInbox;
