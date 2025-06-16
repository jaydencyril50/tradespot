import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChatPage.css';
import { getPortfolio } from '../services/api';

interface Message {
  _id?: string;
  text?: string;
  image?: string;
  from?: 'admin' | 'user';
  createdAt?: string;
}

const API = process.env.REACT_APP_API_BASE_URL;

const ChatPage: React.FC = () => {
  const { spotid } = useParams<{ spotid: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<{ email: string; spotid: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user info and redirect if needed
    getPortfolio().then(data => {
      setUser({ email: data.email, spotid: data.spotid });
      if (spotid && spotid !== data.spotid) navigate('/chat/' + data.spotid, { replace: true });
    });
  }, [spotid, navigate]);

  const fetchMessages = async () => {
    if (!user?.spotid) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/chat-messages/${user.spotid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (user?.spotid) fetchMessages();
    // eslint-disable-next-line
  }, [user?.spotid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input && !image) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/api/chat-messages/${user?.spotid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: input, image }),
      });
      setInput('');
      setImage(undefined);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchMessages();
    } catch {
      // Optionally handle error
    }
  };

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
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input && !image}
        >Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
