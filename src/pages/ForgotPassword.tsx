import React, { useState } from 'react';

const API = process.env.REACT_APP_API_BASE_URL;

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [wallet, setWallet] = useState('');
  const [spotid, setSpotid] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, wallet, spotid }),
      });
      await res.json();
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', border: '1.5px solid var(--primary)', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif' }}>
          FORGOT PASSWORD
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        {submitted ? (
          <div style={{ color: 'var(--primary)', fontWeight: 500, fontSize: 18, textAlign: 'center', background: 'var(--card-bg)', padding: 16, borderRadius: 0, border: '1px solid var(--card-bg)', maxWidth: 380 }}>
            If the provided details are correct, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: 'var(--card-bg)',
            borderRadius: 0,
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--card-bg)', // Make border less visible
            padding: '12px 16px',
            minWidth: 200,
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            marginBottom: 0,
            fontFamily: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12
          }}>
            <label htmlFor="email" style={{ alignSelf: 'flex-start', color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: '1px solid #ccc', fontSize: 16, background: 'var(--bg)', color: 'var(--text)', marginBottom: 8 }}
            />
            <label htmlFor="wallet" style={{ alignSelf: 'flex-start', color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>Wallet Address:</label>
            <input
              type="text"
              id="wallet"
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              required
              disabled={loading}
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: '1px solid #ccc', fontSize: 16, background: 'var(--bg)', color: 'var(--text)', marginBottom: 8 }}
            />
            <label htmlFor="spotid" style={{ alignSelf: 'flex-start', color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>Spot ID:</label>
            <input
              type="text"
              id="spotid"
              value={spotid}
              onChange={e => setSpotid(e.target.value)}
              required
              disabled={loading}
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: '1px solid #ccc', fontSize: 16, background: 'var(--bg)', color: 'var(--text)', marginBottom: 8 }}
            />
            <button type="submit" disabled={loading || !email || !wallet || !spotid} style={{
              width: '100%',
              background: 'var(--secondary)',
              color: 'var(--button-text)',
              padding: '10px 0',
              border: 'none',
              borderRadius: 0,
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading || !email || !wallet || !spotid ? 'not-allowed' : 'pointer',
              marginTop: 8,
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
              alignSelf: 'center',
              marginBottom: 8
            }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            {error && <div style={{ color: '#e74c3c', marginBottom: 8, fontWeight: 500 }}>{error}</div>}
          </form>
        )}
        {/* Responsive style for mobile */}
        <style>{`
            @media (max-width: 600px) {
              form[style*="box-shadow"] {
                max-width: 90vw !important;
                min-width: 0 !important;
                width: 90vw !important;
                margin-left: 5vw !important;
                margin-right: 5vw !important;
                padding: 10px 2vw !important;
              }
            }
        `}</style>
      </div>
    </div>
  );
};

export default ForgotPassword;
