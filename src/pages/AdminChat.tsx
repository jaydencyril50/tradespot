import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
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
  const [showUserList, setShowUserList] = useState(true);
  const socketRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch users who have messaged
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem('adminToken');
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
        const token = localStorage.getItem('adminToken');
        // --- FIXED: Use correct admin history endpoint ---
        const res = await axios.get(`${API}/api/messages/admin/history/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.history || []);
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
        auth: { token: localStorage.getItem('adminToken') },
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
    const token = localStorage.getItem('adminToken');
    try {
      // Send via REST for persistence
      await axios.post(`${API}/api/messages/admin/send/${selectedUser._id}`, {
        content: input.trim(),
      }, { headers: { Authorization: `Bearer ${token}` } });
      // Emit via socket for real-time
      socketRef.current?.emit('admin-message', {
        to: selectedUser._id,
        content: input.trim(),
      });
      setMessages((prev) => [...prev, {
        from: 'admin',
        fromAdmin: true, // FIX: add fromAdmin for consistency
        to: selectedUser._id,
        content: input.trim(),
        createdAt: new Date().toISOString(),
      }]);
      setInput('');
    } catch (e) {
      setError('Failed to send message');
    }
  };

  // When a user is selected, show chat area and hide user list on mobile
  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setShowUserList(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header styled to match Settings.tsx */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f6f9fe',
        padding: '16px 24px 10px 18px',
        border: '1.5px solid #232b36',
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
      }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          ADMIN CHAT
        </span>
      </div>
      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', maxWidth: 900, width: '100%', margin: '0 auto', paddingTop: 70, paddingBottom: 70, height: '100vh', boxSizing: 'border-box', position: 'relative' }}>
        {/* User list section, full screen on mobile or if no user selected */}
        <div
          className="admin-chat-sidebar"
          style={{
            width: showUserList || !selectedUser ? '100%' : 220,
            background: '#fff',
            borderRight: showUserList || !selectedUser ? 'none' : '1px solid #e3e6ef',
            padding: '0',
            display: showUserList || !selectedUser ? 'flex' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: showUserList || !selectedUser ? 'absolute' : 'relative',
            left: 0,
            top: 0,
            height: '100%',
            zIndex: showUserList || !selectedUser ? 20 : 1,
            transition: 'all 0.3s',
            minHeight: 400,
            maxWidth: showUserList || !selectedUser ? '100vw' : 220,
          }}
        >
          <div style={{ flex: 1, width: '100%', overflowY: 'auto', padding: '18px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {loadingUsers ? <div>Loading users...</div> : null}
            <ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
              {users.map((user) => (
                <li
                  key={user._id}
                  style={{
                    padding: '10px 18px',
                    cursor: 'pointer',
                    background: selectedUser && selectedUser._id === user._id ? '#e3e6ef' : 'transparent',
                    fontWeight: selectedUser && selectedUser._id === user._id ? 700 : 400,
                    color: '#232b36',
                    borderLeft: selectedUser && selectedUser._id === user._id ? '4px solid #10c98f' : '4px solid transparent',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => handleSelectUser(user)}
                >
                  {user.email || user.username || user._id}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Chat main area, full screen on mobile if user selected */}
        {selectedUser && !showUserList && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: '#f7f8fa', minHeight: 400, position: 'absolute', left: 0, top: 0, width: '100vw', height: '100%', zIndex: 30, transition: 'all 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 0 18px' }}>
              <div style={{ fontWeight: 700, color: '#25324B', fontSize: '1.1rem', letterSpacing: 1 }}>
                Chat with: <b>{selectedUser.email || selectedUser.username || selectedUser._id}</b>
              </div>
              <FaTimes style={{ fontSize: 22, color: '#232b36', cursor: 'pointer' }} onClick={() => setShowUserList(true)} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 0 18px', marginBottom: 8 }}>
              {loadingMessages ? (
                <div>Loading messages...</div>
              ) : (
                messages.length === 0 ? <div style={{ color: '#888' }}>No messages yet.</div> :
                  messages.map((msg, idx) => {
                    // FIX: Detect admin message by fromAdmin or from
                    const isAdmin = msg.from === 'admin' || msg.fromAdmin === true;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          flexDirection: isAdmin ? 'row-reverse' : 'row',
                          alignItems: 'flex-end',
                          marginBottom: 12,
                        }}
                      >
                        {/* Message bubble */}
                        <div style={{
                          background: isAdmin ? '#2a5298' : '#fff',
                          color: isAdmin ? '#fff' : '#232b36',
                          borderRadius: isAdmin
                            ? '18px 18px 4px 18px'
                            : '18px 18px 18px 4px',
                          padding: '10px 16px',
                          maxWidth: 280,
                          fontSize: 15,
                          boxShadow: isAdmin
                            ? '0 1px 4px #b3c6ef'
                            : '0 1px 4px #e3e6ef',
                          border: isAdmin ? 'none' : '1px solid #e3e6ef',
                          marginLeft: isAdmin ? 0 : 8,
                          marginRight: isAdmin ? 8 : 0,
                          position: 'relative',
                        }}>
                          {msg.content}
                          {/* Removed small user/admin label */}
                        </div>
                        {/* Timestamp */}
                        <div style={{
                          fontSize: 11,
                          color: '#888',
                          margin: isAdmin ? '0 8px 0 0' : '0 0 0 8px',
                          alignSelf: 'flex-end',
                          minWidth: 80,
                          textAlign: isAdmin ? 'right' : 'left',
                        }}>
                          {
                            (() => {
                              // Robustly handle both createdAt and timestamp, fallback to '-'
                              const dateVal = msg.createdAt || msg.timestamp;
                              if (!dateVal) return '-';
                              const d = new Date(dateVal);
                              return isNaN(d.getTime()) ? '-' : d.toLocaleString();
                            })()
                          }
                        </div>
                      </div>
                    );
                  })
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Input fixed at bottom, card style, with shift effect */}
            <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: 'transparent', padding: 12, display: 'flex', justifyContent: 'center', zIndex: 40, maxWidth: 900, margin: '0 auto' }}>
              <div style={{
                background: '#fff',
                boxShadow: '0 4px 16px 0 rgba(30,60,114,0.18), 0 1.5px 6px 0 rgba(30,60,114,0.10)',
                border: '1px solid #e3e6ef',
                borderRadius: 10,
                display: 'flex',
                width: '100%',
                maxWidth: 650,
                padding: 8,
              }}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  placeholder="Type a message..."
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, padding: 8, borderRadius: 6, background: '#f7f8fa' }}
                />
                <button type="submit" onClick={handleSend} disabled={!input.trim()} style={{ marginLeft: 4, background: '#10c98f', color: '#fff', border: 'none', borderRadius: 3, padding: '8px 10px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Send</button>
              </div>
            </div>
            {error && <div className="admin-chat-error" style={{ color: 'red', margin: 12 }}>{error}</div>}
          </div>
        )}
        {/* Desktop chat area (sidebar + chat) */}
        {selectedUser && showUserList === false && (
          <div style={{ display: 'none' }} />
        )}
        {selectedUser && showUserList === true && (
          <div style={{ display: 'none' }} />
        )}
        {/* Desktop: show both sidebar and chat */}
        {selectedUser && (
          <div className="admin-chat-main" style={{ flex: 1, display: showUserList ? 'none' : 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: '#f7f8fa', minHeight: 400 }}>
            {/* ...existing chat area code... */}
          </div>
        )}
      </div>
      <style>
        {`
          @media (max-width: 900px) {
            .admin-chat-sidebar { display: ${selectedUser && !showUserList ? 'none' : 'flex'} !important; }
            div[style*="max-width: 900px"] { max-width: 100vw !important; }
            div[style*="left: 220px"] { left: 0 !important; }
          }
          @media (max-width: 600px) {
            div[style*="max-width: 600px"] { max-width: 100vw !important; padding-left: 0 !important; padding-right: 0 !important; }
            div[style*="position: fixed"] { max-width: 100vw !important; }
            div[style*="box-shadow"] button { margin-left: 2vw !important; }
          }
        `}
      </style>
    </div>
  );
};

export default AdminChat;
