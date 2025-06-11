import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Add this import

interface ChatMessage {
  _id: string;
  email: string;
  spotid: string;
  text?: string;
  image?: string;
  createdAt?: string;
}

const AdminMessage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Add this line

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');
        const res = await axios.get('http://localhost:5000/api/admin/chat-messages', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Group messages by spotid, keep only the latest message per user
        const grouped: { [spotid: string]: ChatMessage } = {};
        (res.data.messages || []).forEach((msg: ChatMessage) => {
          if (!grouped[msg.spotid] || new Date(msg.createdAt || 0) > new Date(grouped[msg.spotid].createdAt || 0)) {
            grouped[msg.spotid] = msg;
          }
        });
        setMessages(Object.values(grouped));
      } catch (e: any) {
        setError(e?.response?.data?.error || e.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', boxShadow: '0 4px 32px rgba(30,60,114,0.18)', padding: 24, borderRadius: 0, minHeight: 400 }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Message Management</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ overflowX: 'auto', maxHeight: 420 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 700 }}>
          <thead>
            <tr style={{ background: '#f7faff' }}>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Email</th>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Spot ID</th>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Date</th>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Open</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 && !loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 18 }}>No messages found.</td></tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg._id} style={{ borderBottom: '1px solid #eaf1fb' }}>
                  <td style={{ padding: 10, textAlign: 'center' }}>{msg.email}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{msg.spotid}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                  </td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <button
                      style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/chat/${msg.spotid}`)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMessage;
