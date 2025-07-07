import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './AdminChat.css';

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

const AdminChat: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch users who have messaged
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem('token');
        // --- FIXED: Use correct admin users endpoint ---
        const res = await axios.get(`${API}/api/messages/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users || []);
      } catch (e) {
        setError('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch messages for selected user
  useEffect(() => {
    if (!selectedUser) return;
    setLoadingMessages(true);
    setMessages([]);
    setError('');
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        // --- FIXED: Ensure correct API path ---
        const res = await axios.get(`${API}/api/messages/user/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.messages || []);
      } catch (e) {
        setError('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // Socket.io setup
  useEffect(() => {
    if (!selectedUser) return;
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: { token: localStorage.getItem('token') },
      });
    }
    const socket = socketRef.current;
    socket.emit('admin-join', { userId: selectedUser._id });
    socket.on('user-message', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('admin-message', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('user-message');
      socket.off('admin-message');
    };
  }, [selectedUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !selectedUser) return;
    const token = localStorage.getItem('token');
    try {
      // Send via REST for persistence
      await axios.post(`${API}/api/messages/admin/send`, {
        to: selectedUser._id,
        content: input.trim(),
      }, { headers: { Authorization: `Bearer ${token}` } });
      // Emit via socket for real-time
      socketRef.current?.emit('admin-message', {
        to: selectedUser._id,
        content: input.trim(),
      });
      setMessages((prev) => [...prev, {
        from: 'admin',
        to: selectedUser._id,
        content: input.trim(),
        createdAt: new Date().toISOString(),
      }]);
      setInput('');
    } catch (e) {
      setError('Failed to send message');
    }
  };

  return (
    <div className="admin-chat-container">
      <div className="admin-chat-sidebar">
        <h2>Users</h2>
        {loadingUsers ? <div>Loading users...</div> : null}
        <ul className="admin-chat-user-list">
          {users.map((user) => (
            <li
              key={user._id}
              className={selectedUser && selectedUser._id === user._id ? 'selected' : ''}
              onClick={() => setSelectedUser(user)}
            >
              {user.email || user.username || user._id}
            </li>
          ))}
        </ul>
      </div>
      <div className="admin-chat-main">
        {selectedUser ? (
          <>
            <div className="admin-chat-header">
              <span>Chat with: <b>{selectedUser.email || selectedUser.username || selectedUser._id}</b></span>
            </div>
            <div className="admin-chat-messages">
              {loadingMessages ? (
                <div>Loading messages...</div>
              ) : (
                messages.length === 0 ? <div className="admin-chat-empty">No messages yet.</div> :
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={msg.from === 'admin' ? 'admin-chat-bubble admin' : 'admin-chat-bubble user'}
                  >
                    <span className="admin-chat-bubble-content">{msg.content}</span>
                    <span className="admin-chat-bubble-time">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <form className="admin-chat-input-row" onSubmit={handleSend}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                autoFocus
              />
              <button type="submit" disabled={!input.trim()}>Send</button>
            </form>
            {error && <div className="admin-chat-error">{error}</div>}
          </>
        ) : (
          <div className="admin-chat-empty">Select a user to start chatting.</div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
