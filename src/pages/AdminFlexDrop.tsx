import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import '../theme.css';

const AdminFlexDrop: React.FC = () => {
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [link, setLink] = useState('');
  const [maxClaims, setMaxClaims] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expireLoading, setExpireLoading] = useState(false);
  const [expireSuccess, setExpireSuccess] = useState('');
  const { theme } = useTheme ? useTheme() : { theme: 'light' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLink('');
    try {
     const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        'https://api.tradespot.online/api/flex-drop/create',
        { minAmount: Number(minAmount), maxAmount: Number(maxAmount), expiresAt, maxClaims: Number(maxClaims) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLink(`${window.location.origin}/flex-drop/${res.data.linkId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating flex drop link');
    } finally {
      setLoading(false);
    }
  };

  const handleExpireLink = async () => {
    if (!link) return;
    setExpireLoading(true);
    setExpireSuccess('');
    setError('');
    try {
      const linkId = link.split('/').pop();
      // @ts-ignore
      const res = await import('../services/api').then(api => api.expireFlexDropLink(linkId));
      setExpireSuccess('Flex Drop link expired successfully.');
      setLink('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error expiring flex drop link');
    } finally {
      setExpireLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', border: '1.5px solid var(--secondary)', borderTop: 0, borderLeft: 0, borderRight: 0}}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif' }}>
          FLEX DROP LINK
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        <div
          className="card"
          style={{
            borderRadius: 0,
            minWidth: 200,
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            marginBottom: 0,
            fontFamily: 'inherit',
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: 'var(--card-shadow)',
            background: 'var(--card-bg)',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 4, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1 }}>Create Flex Drop Link</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <div style={{ width: '90%' }}>
              <label style={{ fontWeight: 600 }}>Min Amount:</label>
              <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} required style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 2 }} />
            </div>
            <div style={{ width: '90%' }}>
              <label style={{ fontWeight: 600 }}>Max Amount:</label>
              <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} required style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 2 }} />
            </div>
            <div style={{ width: '90%' }}>
              <label style={{ fontWeight: 600 }}>Expires At:</label>
              <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 2 }} />
            </div>
            <div style={{ width: '90%' }}>
              <label style={{ fontWeight: 600 }}>Max Claims:</label>
              <input type="number" value={maxClaims} onChange={e => setMaxClaims(e.target.value)} required min={1} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 2 }} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="button"
              style={{
                borderRadius: 6,
                padding: '6px 28px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: 8,
                alignSelf: 'center',
                background: 'var(--secondary)',
                color: 'var(--button-text)',
                boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Creating...' : 'Create Link'}
            </button>
          </form>
          {link && (
            <div style={{ marginTop: 20 }}>
              <strong>Flex Drop Link:</strong> <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
              <button
                onClick={handleExpireLink}
                disabled={expireLoading}
                style={{ marginLeft: 12, padding: '4px 16px', borderRadius: 4, background: 'var(--secondary)', color: 'var(--button-text)', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                {expireLoading ? 'Expiring...' : 'Expire Link'}
              </button>
            </div>
          )}
          {expireSuccess && <div style={{ color: 'green', marginTop: 10 }}>{expireSuccess}</div>}
          {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        </div>
      </div>
      <style>
        {`
          @media (max-width: 600px) {
            div[style*="box-shadow"] {
              max-width: 90vw !important;
              min-width: 0 !important;
              width: 90vw !important;
              margin-left: 5vw !important;
              margin-right: 5vw !important;
              padding: 10px 2vw !important;
              min-height: 180px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AdminFlexDrop;
