import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_BASE_URL;

const actions = [
  { key: 'login', label: 'Login' },
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

  useEffect(() => {
    fetchSettings();
    // Check if user has a credential (for demo, you may want to fetch from /me or similar)
    fetch(API + '/api/user/me', {
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setIsRegistered(!!(data.webauthnCredentials && data.webauthnCredentials.length > 0)))
      .catch(() => setIsRegistered(false));
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(API + '/webauthn-settings/settings', {
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
      const resp = await fetch(API + '/webauthn-settings/settings', {
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
    const email = localStorage.getItem('email');
    if (!email) {
      setError('User email not found. Please log out and log in again.');
      setRegistering(false);
      return;
    }
    try {
      // 1. Get registration options
      const resp = await fetch(API + '/webauthn/register/options?email=' + encodeURIComponent(email), {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!resp.ok) {
        setError('Failed to get registration options.');
        setRegistering(false);
        return;
      }
      const options = await resp.json();
      // 2. Call WebAuthn API
      const cred = await navigator.credentials.create({ publicKey: options });
      if (!cred) throw new Error('Registration was cancelled or failed.');
      const publicKeyCred = cred as PublicKeyCredential;
      // 3. Send attestation to backend
      const attResp = {
        id: publicKeyCred.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(publicKeyCred.rawId))),
        response: {
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array((publicKeyCred.response as AuthenticatorAttestationResponse).clientDataJSON))),
          attestationObject: btoa(String.fromCharCode(...new Uint8Array((publicKeyCred.response as AuthenticatorAttestationResponse).attestationObject)))
        },
        type: publicKeyCred.type,
        transports: (publicKeyCred as any).response.getTransports ? (publicKeyCred as any).response.getTransports() : [],
        clientExtensionResults: publicKeyCred.getClientExtensionResults ? publicKeyCred.getClientExtensionResults() : {}
      };
      const verifyResp = await fetch(API + '/webauthn/register/verify', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email, attResp })
      });
      const verifyData = await verifyResp.json();
      if (verifyData.success) {
        setIsRegistered(true);
        setSuccess('Security key registered!');
      } else {
        setError(verifyData.error || 'Registration failed');
      }
    } catch (e: any) {
      setError('Registration failed');
    }
    setRegistering(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          WEBAUTHN SECURITY
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 18px 0 rgba(30,60,114,0.13), 0 1.5px 6px 0 rgba(30,60,114,0.10)',
            border: '1px solid #e3e6ef',
            padding: '24px 24px 20px 24px',
            minWidth: 240,
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
            marginBottom: 0,
            fontFamily: 'inherit',
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10
          }}
        >
          <h2 style={{ fontSize: '1.25rem', marginBottom: 2, fontWeight: 700, color: '#25324B', letterSpacing: 1, fontFamily: 'serif' }}>WebAuthn Security</h2>
          {loading ? <div>Loading...</div> : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 0, marginTop: 6 }}>
              <span style={{ fontWeight: 600, fontSize: '1rem', color: '#25324B', letterSpacing: 0.2 }}>Status:</span>
              <span style={{ color: isRegistered ? '#1e7c3a' : '#d32f2f', fontWeight: 500, fontSize: '1rem', marginRight: isRegistered ? 0 : 6 }}>
                {isRegistered ? 'Registered' : 'Not Registered'}
              </span>
              {!isRegistered && (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  style={{
                    padding: '5px 14px',
                    background: '#25324B', // matches PrivacySettings main action button
                    color: '#fff',
                    border: 'none',
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
              minHeight: 80,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#25324B', letterSpacing: 1 }}>{a.label}</span>
            <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 6 }}>
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
                background: settings[a.key] ? '#1e3c72' : '#e3e6ef',
                color: settings[a.key] ? '#fff' : '#232b36',
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
                  background: settings[a.key] ? '#fff' : '#cfd8e3',
                  boxShadow: settings[a.key] ? '0 2px 8px rgba(30,60,114,0.18)' : 'none',
                  marginRight: settings[a.key] ? 0 : 8,
                  marginLeft: settings[a.key] ? 8 : 0,
                  transition: 'background 0.2s, margin 0.2s',
                  border: settings[a.key] ? '2px solid #1e3c72' : '2px solid #cfd8e3',
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
          `}
        </style>
      </div>
    </div>
  );
};

export default WebauthnManagement;
