import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// --- FIXED SOCKET_URL: Use a safe fallback and correct protocol ---
const API = process.env.REACT_APP_API_BASE_URL || 'https://api.tradespot.online';
let SOCKET_URL = '';
if (API.startsWith('https://')) {
  SOCKET_URL = API.replace('https://', 'wss://');
} else if (API.startsWith('http://')) {
  SOCKET_URL = API.replace('http://', 'ws://');
} else {
  SOCKET_URL = 'wss://api.tradespot.online';
}

const UserChat: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    // --- FIXED: Correct chat history endpoint ---
    axios.get(`${API}/api/messages/user/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setMessages(res.data.history || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load chat history');
        setLoading(false);
      });
    // Connect socket
    const socket = io(SOCKET_URL, { transports: ['websocket'], auth: { token } });
    socketRef.current = socket;
    // --- FIXED: Correct portfolio endpoint ---
    axios.get(`${API}/api/portfolio`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        socket.emit('join', res.data.id);
      });
    // Listen for new messages
    socket.on('new_message', (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const token = localStorage.getItem('token');
    try {
      // --- FIXED: Correct send endpoint ---
      const res = await axios.post(`${API}/api/messages/user/send`, { content: input }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => [...prev, res.data.msg]);
      setInput('');
    } catch {
      setError('Failed to send message');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header fixed at top */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          USER SUPPORT
        </span>
      </div>
      {/* Chat area scrollable, between header and input */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', maxWidth: 600, width: '100%', margin: '0 auto', paddingTop: 70, paddingBottom: 70, height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ flex: 1, overflowY: 'auto', background: '#f7f8fa', padding: 16, borderRadius: 0, minHeight: 200 }}>
          {loading ? <div>Loading...</div> :
            error ? <div style={{ color: 'red' }}>{error}</div> :
              messages.length === 0 ? <div style={{ color: '#888' }}>No messages yet. Start the conversation!</div> :
                messages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    flexDirection: msg.fromAdmin ? 'row' : 'row-reverse',
                    marginBottom: 10
                  }}>
                    <div style={{
                      background: msg.fromAdmin ? '#2a5298' : '#10c98f',
                      color: '#fff',
                      borderRadius: 16,
                      padding: '8px 16px',
                      maxWidth: 280,
                      fontSize: 15,
                      boxShadow: '0 1px 4px #e3e6ef',
                    }}>{msg.content}</div>
                    <div style={{ fontSize: 11, color: '#888', margin: msg.fromAdmin ? '0 0 0 8px' : '0 8px 0 0', alignSelf: 'flex-end' }}>{new Date(msg.timestamp).toLocaleString()}</div>
                  </div>
                ))
          }
          <div ref={chatEndRef} />
        </div>
      </div>
      {/* Input fixed at bottom, now with card style */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: 'transparent', padding: 12, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <div style={{
          background: '#fff',
          boxShadow: '0 4px 16px 0 rgba(30,60,114,0.18), 0 1.5px 6px 0 rgba(30,60,114,0.10)',
          border: '1px solid #e3e6ef',
          borderRadius: 12,
          display: 'flex',
          width: '100%',
          maxWidth: 600,
          padding: 8,
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
            placeholder="Type your message..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, padding: 8, borderRadius: 6, background: '#f7f8fa' }}
          />
          <button onClick={sendMessage} style={{ marginLeft: 8, background: '#10c98f', color: '#fff', border: 'none', borderRadius: 3, padding: '8px 10px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Send</button>
        </div>
      </div>
      <style>
        {`
          @media (max-width: 600px) {
            div[style*="max-width: 600px"] {
              max-width: 100vw !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
            div[style*="position: fixed"] {
              max-width: 100vw !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default UserChat;
