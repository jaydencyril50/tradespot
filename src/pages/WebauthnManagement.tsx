import React, { useEffect, useState } from 'react';
import '../theme.css';

const API = process.env.REACT_APP_API_BASE_URL;

const actions = [
  { key: 'transfer', label: 'Transfer' },
  { key: 'withdraw', label: 'Withdraw' },
  { key: 'convert', label: 'Convert' },
];

const WebauthnManagement: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    // Fetch user info from backend
    fetch(API + '/api/auth/user/me', {
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setIsRegistered(!!(data.webauthnCredentials && data.webauthnCredentials.length > 0));
        setUserEmail(data.email || null);
      })
      .catch(() => {
        setIsRegistered(false);
        setUserEmail(null);
      });
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(API + '/api/auth/webauthn-settings/settings', {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await resp.json();
      setSettings(data.webauthnSettings || {});
    } catch (e: any) {
      setError('Failed to load settings');
    }
    setLoading(false);
  };

  const handleToggle = async (action: string, enabled: boolean) => {
    setError(null);
    setSuccess(null);
    try {
      const resp = await fetch(API + '/api/auth/webauthn-settings/settings', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action, enabled })
      });
      const data = await resp.json();
      if (data.webauthnSettings) {
        setSettings(data.webauthnSettings);
        setSuccess('Updated!');
      } else {
        setError(data.error || 'Failed to update');
      }
    } catch (e: any) {
      setError('Failed to update');
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);
    setSuccess(null);
    const email = userEmail;
    console.log('[WebAuthn] Starting registration for', email);
    if (!email) {
      setError('User email not found. Please log out and log in again.');
      setRegistering(false);
      return;
    }
    try {
      // 1. Get registration options
      console.log('[WebAuthn] Fetching registration options...');
      const resp = await fetch(API + '/api/auth/webauthn/register/options?email=' + encodeURIComponent(email), {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!resp.ok) {
        setError('Failed to get registration options.');
        setRegistering(false);
        console.error('[WebAuthn] Failed to get registration options:', resp.status, await resp.text());
        return;
      }
      const options = await resp.json();
      console.log('[WebAuthn] Registration options:', options);
      // Convert challenge and user.id to Uint8Array as required by WebAuthn API
      options.challenge = base64urlToUint8Array(options.challenge);
      if (options.user && options.user.id) {
        options.user.id = base64urlToUint8Array(options.user.id);
      }
      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map((cred: any) => ({
          ...cred,
          id: base64urlToUint8Array(cred.id)
        }));
      }
      // 2. Call WebAuthn API
      let cred;
      try {
        cred = await navigator.credentials.create({ publicKey: options });
        console.log('[WebAuthn] Credential created:', cred);
      } catch (err: any) {
        console.error('[WebAuthn] navigator.credentials.create failed:', err);
        setError('WebAuthn API failed: ' + (err && (err as Error).message ? (err as Error).message : String(err)));
        setRegistering(false);
        return;
      }
      if (!cred) throw new Error('Registration was cancelled or failed.');
      const publicKeyCred = cred as PublicKeyCredential;
      // 3. Send attestation to backend
      const attResp = {
        id: publicKeyCred.id,
        rawId: bufferToBase64url(publicKeyCred.rawId),
        response: {
          clientDataJSON: bufferToBase64url((publicKeyCred.response as AuthenticatorAttestationResponse).clientDataJSON),
          attestationObject: bufferToBase64url((publicKeyCred.response as AuthenticatorAttestationResponse).attestationObject)
        },
        type: publicKeyCred.type,
        transports: (publicKeyCred as any).response.getTransports ? (publicKeyCred as any).response.getTransports() : [],
        clientExtensionResults: publicKeyCred.getClientExtensionResults ? publicKeyCred.getClientExtensionResults() : {}
      };
      console.log('[WebAuthn] Sending attestation to backend:', attResp);
      const verifyResp = await fetch(API + '/api/auth/webauthn/register/verify', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email, attResp })
      });
      const verifyData = await verifyResp.json();
      console.log('[WebAuthn] Backend verify response:', verifyData);
      if (verifyData.success) {
        setIsRegistered(true);
        setSuccess('Security key registered!');
      } else {
        setError(verifyData.error || 'Registration failed');
      }
    } catch (e: any) {
      console.error('[WebAuthn] Registration error:', e);
      setError('Registration failed');
    }
    setRegistering(false);
  };

  // Helper to convert base64url to Uint8Array
  function base64urlToUint8Array(base64url: string): Uint8Array {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const str = atob(base64);
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; ++i) bytes[i] = str.charCodeAt(i);
    return bytes;
  }

  // Helper to convert ArrayBuffer to base64url
  function bufferToBase64url(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', border: '1.5px solid var(--secondary)', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', letterSpacing: 1, fontFamily: 'serif', transition: 'color 0.3s' }}>
          WEBAUTHN SECURITY
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
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--secondary)',
            background: 'var(--card-bg)',
            padding: '24px 16px',
            alignItems: 'center',
            gap: 10
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 2, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif' }}>WebAuthn Security</h2>
          {loading ? <div>Loading...</div> : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 0, marginTop: 6 }}>
              <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--primary)', letterSpacing: 0.2 }}>Status:</span>
              <span style={{ color: isRegistered ? '#1e7c3a' : '#d32f2f', fontWeight: 500, fontSize: '1rem', marginRight: isRegistered ? 0 : 6 }}>
                {isRegistered ? 'Registered' : 'Not Registered'}
              </span>
              {!isRegistered && (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="button"
                  style={{
                    padding: '5px 14px',
                    background: 'var(--primary)',
                    color: 'var(--button-text)',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '0.98rem',
                    cursor: 'pointer',
                    boxShadow: '0 1.5px 5px rgba(30,60,114,0.08)',
                    transition: 'background 0.18s',
                    outline: 'none',
                  }}
                >{registering ? 'Registering...' : 'Register'}</button>
              )}
            </div>
          )}
          {error && <div style={{ color: '#d32f2f', marginTop: 8, fontWeight: 500 }}>{error}</div>}
          {success && <div style={{ color: '#1e7c3a', marginTop: 8, fontWeight: 500 }}>{success}</div>}
        </div>
        {/* Individual cards for each action */}
        {actions.map(a => (
          <div
            key={a.key}
            className="card"
            style={{
              borderRadius: 0,
              minWidth: 200,
              maxWidth: 380,
              width: '100%',
              textAlign: 'center',
              marginBottom: 0,
              fontFamily: 'inherit',
              minHeight: 80,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--secondary)',
              background: 'var(--card-bg)',
              padding: '12px 16px',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)', letterSpacing: 1, transition: 'color 0.3s' }}>{a.label}</span>
            <div style={{ fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: 6, transition: 'color 0.3s' }}>
              Require WebAuthn for {a.label.toLowerCase()}?
            </div>
            <button
              onClick={() => handleToggle(a.key, !settings[a.key])}
              disabled={!isRegistered}
              style={{
                width: 60,
                height: 32,
                borderRadius: 16,
                border: 'none',
                background: settings[a.key] ? 'var(--primary)' : 'var(--card-bg)',
                color: settings[a.key] ? 'var(--button-text)' : 'var(--primary)',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: isRegistered ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
                position: 'relative',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: settings[a.key] ? 'flex-end' : 'flex-start',
                padding: '0 8px',
                boxSizing: 'border-box',
                boxShadow: settings[a.key] ? '0 2px 8px rgba(30,60,114,0.18)' : 'none',
              }}
              aria-pressed={!!settings[a.key]}
              aria-label={settings[a.key] ? `Turn OFF WebAuthn for ${a.label}` : `Turn ON WebAuthn for ${a.label}`}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: settings[a.key] ? 'var(--button-text)' : '#cfd8e3',
                  boxShadow: settings[a.key] ? '0 2px 8px rgba(30,60,114,0.18)' : 'none',
                  marginRight: settings[a.key] ? 0 : 8,
                  marginLeft: settings[a.key] ? 8 : 0,
                  transition: 'background 0.2s, margin 0.2s',
                  border: settings[a.key] ? '2px solid var(--primary)' : '2px solid #cfd8e3',
                }}
              />
              <span style={{ marginLeft: 8, marginRight: 8, fontSize: '0.95rem', fontWeight: 600 }}>
                {settings[a.key] ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        ))}
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
                min-height: 80px !important;
              }
            }
            body[data-theme='dark'] {
              color: #fff !important;
            }
            body[data-theme='dark'] .card,
            body[data-theme='dark'] .card * {
              color: #fff !important;
            }
            body[data-theme='dark'] span,
            body[data-theme='dark'] div,
            body[data-theme='dark'] h2 {
              color: #fff !important;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default WebauthnManagement;
