import React, { useState, useEffect } from 'react';

const AdminNotice: React.FC = () => {
  const [notice, setNotice] = useState('');
  const [input, setInput] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const API = process.env.REACT_APP_API_BASE_URL || '';

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
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: 40 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f6f9fe',
        padding: '16px 24px 10px 18px',
        border: '1.5px solid #232b36',
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0
      }}>
        <span style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: '#232b36',
          letterSpacing: 1,
          fontFamily: 'serif'
        }}>
          ANNOUNCEMENT
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
        gap: 20
      }}>
        <div style={{
          background: '#fff',
          boxShadow: '0 12px 40px rgba(30,60,114,0.38), 0 4px 16px rgba(30,60,114,0.22)',
          border: '1px solid #e3e6ef',
          padding: 24,
          width: '90%',
          maxWidth: 350,
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter announcement message..."
            style={{
              width: '95%',
              minHeight: 170,
              padding: 15,
              border: '1px solid #ccc',
              borderRadius: 3,
              fontSize: 16,
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: 10
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button onClick={handleClear} style={{
              background: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: 2,
              padding: '8px 15px',
              fontWeight: 500,
              fontSize: 10,
              letterSpacing: 1,
              cursor: 'pointer'
            }}>
              Clear
            </button>
            <button onClick={handleSave} style={{
              background: '#1e3c72',
              color: '#fff',
              border: 'none',
              borderRadius: 2,
              padding: '8px 15px',
              fontWeight: 500,
              fontSize: 10,
              letterSpacing: 1,
              cursor: 'pointer'
            }}>
              Save
            </button>
          </div>
          {loading && <div style={{ marginTop: 12, color: '#1e3c72', fontWeight: 500 }}>Loading...</div>}
          {success && <div style={{
            marginTop: 12,
            fontWeight: 500,
            color: success.includes('Failed') ? '#e74c3c' : '#27ae60'
          }}>
            {success}
          </div>}
        </div>

        {notice && (
          <div style={{
            background: '#fff',
            boxShadow: '0 12px 40px rgba(30,60,114,0.38), 0 4px 16px rgba(30,60,114,0.22)',
            border: '1px solid #e3e6ef',
            padding: '16px 20px',
            maxWidth: 360,
            width: '90%',
            borderRadius: 3,
            textAlign: 'center',
            maxHeight: 300,
            overflowY: 'auto',
            marginBottom: 10
          }}>
            <span style={{
              fontWeight: 700,
              color: '#25324B',
              fontSize: '1.1rem',
              letterSpacing: 1,
              marginBottom: 6,
              display: 'block'
            }}>
              Current Announcement:
            </span>
            <div style={{
              fontSize: '1.0rem',
              color: '#1e3c72',
              fontWeight: 400,
              wordWrap: 'break-word',
              whiteSpace: 'pre-line'
            }}>
              {notice}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotice;
