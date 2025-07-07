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
    <div style={{ maxWidth: 480, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px #e3e6ef', padding: 0, minHeight: 500, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#25324B', color: '#fff', padding: 16, borderTopLeftRadius: 8, borderTopRightRadius: 8, fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>Chat with Admin</div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f7f8fa' }}>
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
      <div style={{ display: 'flex', borderTop: '1px solid #eee', padding: 12, background: '#fff', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Type your message..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, padding: 8, borderRadius: 6, background: '#f7f8fa' }}
        />
        <button onClick={sendMessage} style={{ marginLeft: 8, background: '#10c98f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  );
};

export default UserChat;
