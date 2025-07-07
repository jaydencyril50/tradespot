import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <div
          style={{
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
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 4, fontWeight: 700, color: '#25324B', letterSpacing: 1 }}>Google Authenticator (2FA)</h2>
          {enabled ? (
            <>
              <div style={{ color: '#10c98f', marginBottom: 10, fontWeight: 600 }}>2FA is enabled on your account.</div>
            </>
          ) : (
            <>
              {qr ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <img src={qr} alt="2FA QR Code" style={{ width: 180, height: 180, margin: '0 auto', display: 'block' }} />
                    <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>Scan with Google Authenticator app</div>
                    {secret && (
                      <div style={{ marginTop: 10, background: '#f6f9fe', padding: 10, borderRadius: 6, wordBreak: 'break-all' }}>
                        <div style={{ fontSize: 13, color: '#25324B', marginBottom: 4 }}>Or enter this setup key:</div>
                        <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: 1, marginBottom: 4 }}>
                          {secret}
                          <button
                            style={{ marginLeft: 8, fontSize: 12, padding: '2px 8px', borderRadius: 4, border: 'none', background: '#eaf1fb', cursor: 'pointer' }}
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
                            <span style={{ color: '#10c98f', fontSize: 12, marginLeft: 6, fontWeight: 500 }}>Copied</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#888' }}>You can manually enter this key in your authenticator app.</div>
                      </div>
                    )}
                  </div>
                  <input type="text" placeholder="Enter 6-digit code" value={token} onChange={e => setToken(e.target.value)} style={{ padding: 8, width: '100%', marginBottom: 8, borderRadius: 6, border: '1px solid #e3e6ef' }} />
                  <button onClick={verify2FA} disabled={loading} style={{ background: '#888', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px rgba(30,60,114,0.10)' }}>Verify & Enable</button>
                </>
              ) : (
                <button
                  onClick={!enabled && !loading ? fetch2FASetup : undefined}
                  disabled={enabled || loading}
                  style={{
                    background: enabled ? '#10c98f' : '#888',
                    color: '#fff',
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: enabled ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 4px rgba(30,60,114,0.10)'
                  }}
                >
                  {enabled ? '2FA Enabled' : 'Setup 2FA'}
                </button>
              )}
            </>
          )}
          {message && <div style={{ color: '#10c98f', marginTop: 12 }}>{message}</div>}
          {error && <div style={{ color: '#e74c3c', marginTop: 12 }}>{error}</div>}
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
                height: 90px !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default TwoFASettings;
