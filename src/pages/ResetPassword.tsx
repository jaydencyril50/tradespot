import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_BASE_URL;

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Reset failed.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = password === confirm;

  if (!token) {
    return <div style={{ color: '#e74c3c', fontWeight: 500, fontSize: 18, textAlign: 'center', background: '#f6f9fe', padding: 16, borderRadius: 0, border: '1px solid #e3e6ef', maxWidth: 380, margin: '40px auto' }}>Invalid or missing token.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          RESET PASSWORD
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        {success ? (
          <div style={{ color: '#27ae60', fontWeight: 500, fontSize: 18, textAlign: 'center', background: '#f6f9fe', padding: 16, borderRadius: 0, border: '1px solid #e3e6ef', maxWidth: 380 }}>
            Password has been reset! You may now <a href="/login" style={{ color: '#1e3c72', fontWeight: 600 }}>log in</a>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: '#fff',
            borderRadius: 0,
            boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
            border: '1px solid #e3e6ef',
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
            <label htmlFor="password" style={{ alignSelf: 'flex-start', color: '#25324B', fontWeight: 500, marginBottom: 2 }}>New Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: '1px solid #ccc', fontSize: 16, background: '#eaf1fb', marginBottom: 8 }}
            />
            <label htmlFor="confirm" style={{ alignSelf: 'flex-start', color: '#25324B', fontWeight: 500, marginBottom: 2 }}>Confirm Password:</label>
            <input
              type="password"
              id="confirm"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: '1px solid #ccc', fontSize: 16, background: '#eaf1fb', marginBottom: 8 }}
            />
            {confirm && !passwordsMatch && (
              <div style={{ color: '#e74c3c', fontSize: 14, marginBottom: 4, fontWeight: 500 }}>
                Passwords do not match.
              </div>
            )}
            <button type="submit" disabled={loading || !password || !confirm || !passwordsMatch} style={{
              width: '100%',
              background: '#888',
              color: '#fff',
              padding: '10px 0',
              border: 'none',
              borderRadius: 0,
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading || !password || !confirm || !passwordsMatch ? 'not-allowed' : 'pointer',
              marginTop: 8,
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
              alignSelf: 'center',
              marginBottom: 8
            }}>
              {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
