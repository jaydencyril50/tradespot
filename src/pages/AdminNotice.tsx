import React, { useState, useEffect } from 'react';

const AdminNotice: React.FC = () => {
  const [notice, setNotice] = useState('');
  const [input, setInput] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const API = process.env.REACT_APP_API_BASE_URL || '';

  // Fetch announcement from backend on mount
  useEffect(() => {
    const fetchNotice = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/announcement`);
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
  }, [API]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API}/api/announcement`, {
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
      const res = await fetch(`${API}/api/announcement`, {
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
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          ANNOUNCEMENT
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter announcement message..."
          style={{ maxWidth: 365, width: '100%', minHeight: 100, padding: 10, border: '1px solid #e3e6ef', borderRadius: 0, marginBottom: 0, fontSize: 15 }}
        />
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <button onClick={handleClear} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
          <button onClick={handleSave} style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
        </div>
        {loading && <div style={{ color: '#1e3c72', fontWeight: 500 }}>Loading...</div>}
        {success && <div style={{ color: success.includes('Failed') ? '#e74c3c' : '#27ae60', marginTop: 12, fontWeight: 500 }}>{success}</div>}
        {notice && (
          <div
            style={{
              background: '#fff',
              borderRadius: 0,
              boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
              border: '1px solid #e3e6ef',
              padding: '12px 16px',
              minWidth: 200,
              maxWidth: 365,
              width: '90%', // changed from 100% to 90% for margin
              margin: '24px auto 0 auto', // center and add top margin
              textAlign: 'center',
              fontFamily: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <span style={{ fontWeight: 700, color: '#25324B', fontSize: '1.3rem', letterSpacing: 1, marginBottom: 6 }}>
              Current Announcement:
            </span>
            <div style={{ fontSize: '1.15rem', color: '#1e3c72', fontWeight: 700 }}>{notice}</div>
          </div>
        )}
        <style>
          {`
            @media (max-width: 600px) {
              div[style*="background: #eaf1fb"] {
                max-width: 90vw !important;
                min-width: 0 !important;
                width: 90vw !important;
                margin-left: 5vw !important;
                margin-right: 5vw !important;
                padding: 10px 2vw !important;
              }
              textarea {
                max-width: 90vw !important;
                width: 90vw !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AdminNotice;
