import React, { useEffect, useRef, useState } from 'react';
import './ChatPage.css';
import { sendChatMessage, getPortfolio } from '../services/api';
import io from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL;
const SOCKET_URL = API;

const ChatPage: React.FC = () => {
  const { spotid } = useParams<{ spotid: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<{
    _id?: string;
    text?: string;
    image?: string;
    from?: 'admin' | 'user';
    createdAt?: string;
    status?: string;
    unread?: boolean;
  }>>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<{ email: string; spotid: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPortfolio().then(data => {
      setUser({ email: data.email, spotid: data.spotid });
      // If spotid param exists and doesn't match user, redirect to own chat
      if (spotid && spotid !== data.spotid) navigate('/chat/' + data.spotid, { replace: true });
    });
  }, [spotid, navigate]);

  useEffect(() => {
    if (!user?.spotid) return;
    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, {
      query: { spotid: user.spotid, role: 'user' },
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.on('chat_history', (history: any[]) => {
      setMessages(history.map(msg => ({
        ...msg,
        from: msg.from === 'admin' ? 'admin' : 'user',
      })));
      // Mark all admin messages as read
      if (history.some(msg => msg.from === 'admin' && msg.unread)) {
        fetch(`${API}/api/chat/mark-read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ spotid: user.spotid, from: 'admin' }),
        });
      }
    });
    socket.on('chat_message', (msg: any) => {
      setMessages(prev => [
        ...prev,
        { ...msg, from: msg.from === 'admin' ? 'admin' : 'user' }
      ]);
      // Mark as read if from admin
      if (msg.from === 'admin') {
        fetch(`${API}/api/chat/mark-read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ spotid: user.spotid, from: 'admin' }),
        });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [user?.spotid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
  if (!input && !image) return;
  socketRef.current?.emit('chat_message', { spotid: user?.spotid, text: input, image, from: 'user' });
  setInput('');
  setImage(undefined);
  if (fileInputRef.current) fileInputRef.current.value = '';
};

  // Send on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="chat-page-container">
      <div style={{
        width: '100%',
        background: '#fff',
        borderBottom: '1px solid #e3e6ef',
        padding: '18px 0 12px 0',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: 22,
        color: '#25324B',
        letterSpacing: 1,
        fontFamily: 'serif',
        boxShadow: '0 2px 8px rgba(30,60,114,0.04)'
      }}>
        TRADESPOT SUPPORT
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            className="chat-message"
            key={msg._id || idx}
            style={{
              alignSelf: msg.from === 'admin' ? 'flex-start' : 'flex-end',
              background: msg.from === 'admin' ? '#eaf1fb' : '#fff',
              borderLeft: msg.from === 'admin' ? '4px solid #1e3c72' : '4px solid #10c98f',
              marginLeft: msg.from === 'admin' ? 0 : 'auto',
              marginRight: msg.from === 'admin' ? 'auto' : 0
            }}
          >
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>
              <strong>ID:</strong> {msg._id || 'N/A'}
            </div>
            {msg.text && <div className="chat-text"><strong>Text:</strong> {msg.text}</div>}
            {msg.image && <div><strong>Image:</strong><br /><img src={msg.image} alt="uploaded" className="chat-image" /></div>}
            <div style={{ fontSize: 11, color: '#888', marginTop: 4, textAlign: 'right' }}>
              <div><strong>From:</strong> {msg.from}</div>
              <div><strong>Created:</strong> {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'N/A'}</div>
              <div><strong>Status:</strong> {msg.status ? (
                <span style={{ marginLeft: 8, color: msg.status === 'read' ? '#10c98f' : msg.status === 'delivered' ? '#1e3c72' : '#aaa' }}>
                  {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                </span>
              ) : 'N/A'}</div>
              <div><strong>Unread:</strong> {msg.unread !== undefined ? (msg.unread ? 'Yes' : 'No') : 'N/A'}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-row">
        <textarea
          className="chat-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={2}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button
          className="chat-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Upload Image"
        >📷</button>
        <button className="chat-send-btn" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
