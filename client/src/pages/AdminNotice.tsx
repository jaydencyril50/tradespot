import React, { useState, useEffect } from 'react';

const AdminNotice: React.FC = () => {
  const [notice, setNotice] = useState('');
  const [input, setInput] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch announcement from backend on mount
  useEffect(() => {
    const fetchNotice = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/announcement');
        const data = await res.json();
        setNotice(data.notice || '');
        setInput(data.notice || '');
      } catch {
        setNotice('');
        setInput('');
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notice: input }),
      });
      if (!res.ok) throw new Error('Failed to update announcement');
      setNotice(input);
      setSuccess('Announcement updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setSuccess('Failed to update announcement');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleClear = async () => {
    setInput('');
    try {
      const res = await fetch('/api/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notice: '' }),
      });
      if (!res.ok) throw new Error('Failed to clear announcement');
      setNotice('');
    } catch {
      setSuccess('Failed to clear announcement');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', background: '#fff', boxShadow: '0 4px 32px rgba(30,60,114,0.18)', padding: 32, borderRadius: 8 }}>
      <h2 style={{ color: '#1e3c72', marginBottom: 18 }}>Send Announcement</h2>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Enter announcement message..."
        style={{ width: '95%', minHeight: 100, padding: 10, borderRadius: 4, border: '1px solid #ccc', marginBottom: 16 }}
      />
      <div style={{ display: 'flex', gap: 170, justifyContent: 'center' }}>
        <button onClick={handleClear} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
        <button onClick={handleSave} style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
      </div>
      {loading && <div style={{ color: '#888', marginTop: 12 }}>Loading...</div>}
      {success && <div style={{ color: success.includes('Failed') ? 'red' : 'green', marginTop: 12 }}>{success}</div>}
      {notice && (
        <div style={{ marginTop: 24, background: '#eaf1fb', padding: 12, borderRadius: 4, color: '#1e3c72' }}>
          <strong>Current Announcement:</strong>
          <div>{notice}</div>
        </div>
      )}
    </div>
  );
};

export default AdminNotice;
