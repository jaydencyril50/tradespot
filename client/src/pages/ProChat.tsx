import React, { useState, useRef, useEffect } from 'react';

const ProChat: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages from the database on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/chat');
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data.chats || []);
      } catch (err) {
        setError('Failed to fetch messages');
      }
    };
    fetchMessages();
  }, []);

  const handleSend = async () => {
    setError(null);
    if (input.trim()) {
      try {
        // Replace with actual user email if available in your app context
        const userEmail = localStorage.getItem('userEmail') || 'anonymous@user.com';
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail, message: input })
        });
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to send message');
          return;
        }
        // Fetch updated messages after sending
        const fetchResponse = await fetch('/api/chat');
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setMessages(data.chats || []);
        }
        setInput('');
      } catch (err) {
        setError('Failed to send message');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f9fafb',
      fontFamily: 'sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          SUPPORT CHAT
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ color: 'red', padding: '8px 24px', background: '#fff0f0', borderBottom: '1px solid #fbb' }}>
          {error}
        </div>
      )}

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: 0,
        maxHeight: 'calc(100vh - 140px)', // Ensures it doesn't overflow the viewport
      }}>
        {messages.length === 0 && (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg, idx) => (
          <div key={msg._id || idx} style={{
            alignSelf: 'flex-end',
            background: '#2563eb',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: 8,
            maxWidth: '70%',
            fontSize: 15,
            wordBreak: 'break-word'
          }}>
            {msg.message}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        padding: '16px 24px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        background: '#ffffff',
        boxShadow: '0 -2px 8px rgba(30,60,114,0.06)'
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          style={{
            flex: 1,
            padding: 8,
            fontSize: 16,
            border: '1px solid #ccc',
            borderRadius: 4,
            outline: 'none',
            marginRight: 12,
            background: 'transparent',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              // You can handle the file upload or preview here
            }
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 38,
            height: 38,
            border: 'none',
            borderRadius: 6,
            background: '#f2f6fd',
            color: '#25324B',
            fontSize: 20,
            marginRight: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(30,60,114,0.10)'
          }}
          title="Upload Image"
        >
          <span role="img" aria-label="camera">📷</span>
        </button>
        <button
          onClick={handleSend}
          style={{
            width: 80,
            border: 'none',
            borderRadius: 6,
            padding: '6px 0',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: 0,
            background: '#888',
            color: '#fff',
            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
            transition: 'background 0.2s',
            alignSelf: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ProChat;
