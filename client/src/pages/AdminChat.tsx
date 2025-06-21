import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Message {
  from: 'admin' | 'user';
  text?: string;
  image?: string;
  createdAt?: string;
}

const API = process.env.REACT_APP_API_BASE_URL;

const AdminChat: React.FC = () => {
  const { userEmail } = useParams<{ userEmail: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history from backend
  const fetchMessages = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API}/api/chat/admin/chat-messages/${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [userEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input && !image) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API}/api/chat/admin/chat-messages/${userEmail}`, {
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
    } finally {
      setLoading(false);
    }
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
    <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 16px rgba(30,60,114,0.10)' }}>
      <div style={{ padding: 18, borderBottom: '1px solid #e3e6ef', fontWeight: 700, fontSize: 22, color: '#25324B', letterSpacing: 1, fontFamily: 'serif', textAlign: 'center' }}>
        Admin Chat - User Email: {userEmail}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 18, background: '#f7faff' }}>
        {loading && <div>Loading...</div>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            marginBottom: 16,
            alignSelf: msg.from === 'admin' ? 'flex-end' : 'flex-start',
            background: msg.from === 'admin' ? '#eaf1fb' : '#fff',
            borderRadius: 8,
            padding: '10px 14px',
            maxWidth: 380,
            wordBreak: 'break-word',
            boxShadow: '0 2px 8px rgba(30,60,114,0.08)'
          }}>
            {msg.text && <div style={{ fontSize: 15, color: '#25324B', marginBottom: 4 }}>{msg.text}</div>}
            {msg.image && <img src={msg.image} alt="uploaded" style={{ maxWidth: 220, maxHeight: 180, borderRadius: 4, marginTop: 4, display: 'block' }} />}
            <div style={{ fontSize: 11, color: '#888', marginTop: 4, textAlign: 'right' }}>
              {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', padding: 12, background: '#fff', borderTop: '1px solid #e3e6ef', gap: 8 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={2}
          style={{ flex: 1, borderRadius: 4, border: '1px solid #e3e6ef', padding: 8, fontSize: 15, resize: 'none', minHeight: 38, maxHeight: 90 }}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ background: '#f2f6fd', border: '1px solid #e3eafc', borderRadius: 4, fontSize: 18, padding: '6px 10px', cursor: 'pointer', color: '#25324B' }}
          title="Upload Image"
        >📷</button>
        <button
          onClick={handleSend}
          disabled={loading || (!input && !image)}
          style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, padding: '8px 18px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >Send</button>
      </div>
    </div>
  );
};

export default AdminChat;
