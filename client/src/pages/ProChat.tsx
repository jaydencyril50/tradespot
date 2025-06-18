import React, { useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

const ProChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = async () => {
    setStatus(null);
    if (!input.trim()) return;
    try {
      await axios.post(`${API}/api/chat`, {
        userEmail: 'test@example.com', // Replace with actual user email if available
        message: input,
      });
      setStatus('Message saved!');
      setInput('');
    } catch (err) {
      setStatus('Failed to save message.');
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: '0 auto' }}>
      <h2>ProChat (Save Message Only)</h2>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type a message..."
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <button onClick={handleSend} style={{ width: '100%', padding: 10 }}>Save Message</button>
      {status && <div style={{ marginTop: 16 }}>{status}</div>}
    </div>
  );
};

export default ProChat;
