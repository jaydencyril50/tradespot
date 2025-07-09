import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../theme.css';

const API = process.env.REACT_APP_API_BASE_URL;

const TwoFASettings: React.FC = () => {
  const [qr, setQr] = useState<string | null>(null);
  const [otpauth, setOtpauth] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch 2FA status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API}/api/2fa/status`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setEnabled(res.data.enabled);
        if (res.data.enabled) {
          setQr(null);
          setOtpauth(null);
        }
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to fetch 2FA status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const fetch2FASetup = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API}/api/2fa/setup`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setQr(res.data.qr);
      setOtpauth(res.data.otpauth);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.post(`${API}/api/2fa/verify`, { token }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setEnabled(true);
      setMessage('2FA enabled successfully!');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to verify 2FA');
    } finally {
      setLoading(false);
    }
  };

  const secret = (() => {
    if (otpauth) {
      try {
        const url = new URL(otpauth);
        const params = new URLSearchParams(url.search);
        return params.get('secret') || '';
      } catch {
        return '';
      }
    }
    return '';
  })();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', borderBottom: '1.5px solid var(--secondary)', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', letterSpacing: 1, fontFamily: 'serif' }}>
          2FA SETTINGS
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
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
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: 'var(--card-shadow)',
            // border: '1px solid var(--secondary)', // Removed border
            background: 'var(--card-bg)',
            padding: '24px 16px',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1 }}>Google Authenticator (2FA)</h2>
          {enabled ? (
            <div style={{ color: '#10c98f', marginBottom: 10, fontWeight: 600, fontSize: 16 }}>2FA is enabled on your account.</div>
          ) : (
            <>
              {qr ? (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <img src={qr} alt="2FA QR Code" style={{ width: '100%', maxWidth: 180, height: 'auto', margin: '0 auto', display: 'block', borderRadius: 8, boxShadow: '0 2px 8px rgba(30,60,114,0.10)', maxHeight: 180 }} />
                    <div style={{ fontSize: 14, color: 'var(--secondary)', marginTop: 10 }}>Scan with Google Authenticator app</div>
                    {secret && (
                      <div style={{ marginTop: 14, background: 'var(--bg)', padding: 12, borderRadius: 8, wordBreak: 'break-all', border: '1px solid var(--secondary)' }}>
                        <div style={{ fontSize: 13, color: 'var(--primary)', marginBottom: 4 }}>Or enter this setup key:</div>
                        <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: 1, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <span>{secret}</span>
                          <button
                            style={{ marginLeft: 10, fontSize: 12, padding: '2px 10px', borderRadius: 4, border: 'none', background: 'var(--card-bg)', color: 'var(--primary)', cursor: 'pointer', boxShadow: '0 1px 4px rgba(30,60,114,0.06)' }}
                            onClick={() => {
                              navigator.clipboard.writeText(secret);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1500);
                            }}
                            title="Copy setup key"
                          >
                            Copy
                          </button>
                          {copied && (
                            <span style={{ color: '#10c98f', fontSize: 12, marginLeft: 8, fontWeight: 500 }}>Copied</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--secondary)' }}>You can manually enter this key in your authenticator app.</div>
                      </div>
                    )}
                  </div>
                  <input type="text" placeholder="Enter 6-digit code" value={token} onChange={e => setToken(e.target.value)} style={{ padding: 10, width: '95%', marginBottom: 12, borderRadius: 6, border: '1px solid var(--secondary)', fontSize: 15, outline: 'none', background: 'var(--card-bg)', color: 'var(--primary)' }} />
                  <button onClick={verify2FA} disabled={loading} className="button" style={{ padding: '10px 0', width: '100%', borderRadius: 6, fontWeight: 600, fontSize: '1rem', marginBottom: 2 }}>
                    Verify & Enable
                  </button>
                </>
              ) : (
                <button
                  onClick={!enabled && !loading ? fetch2FASetup : undefined}
                  disabled={enabled || loading}
                  className="button"
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: '1rem',
                    marginTop: 8,
                  }}
                >
                  {enabled ? '2FA Enabled' : 'Setup 2FA'}
                </button>
              )}
            </>
          )}
          {message && <div style={{ color: '#10c98f', marginTop: 16, fontWeight: 600 }}>{message}</div>}
          {error && <div style={{ color: '#e74c3c', marginTop: 16, fontWeight: 600 }}>{error}</div>}
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
                min-height: 90px !important;
              }
              img[alt="2FA QR Code"] {
                max-width: 40vw !important;
                height: auto !important;
                min-width: 120px !important;
                max-height: 120px !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default TwoFASettings;
