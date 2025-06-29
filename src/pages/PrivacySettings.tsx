import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerificationCode, sendPasswordVerificationCode } from '../services/api';
import { changeWallet, sendFundsPrivacyVerificationCode, verifyFundsPrivacy } from '../services/api';
import { changeName, changeEmail } from '../services/api';
import { changePassword, isBiometricEnabled } from '../services/api';

const PrivacySettings: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [spotid, setSpotid] = useState('');
  const [code, setCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showFundsPrivacyModal, setShowFundsPrivacyModal] = useState(false);
  const [fundsSpotid, setFundsSpotid] = useState('');
  const [fundsEmailCode, setFundsEmailCode] = useState('');
  const [fundsPassword, setFundsPassword] = useState('');
  const [funds2fa, setFunds2fa] = useState('');
  // State to track biometric registration
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const API = process.env.REACT_APP_API_BASE_URL;

  // Check biometric status on mount
  useEffect(() => {
    const fetchBiometricStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId;
        if (!userId) return;
        const enabled = await isBiometricEnabled();
        setBiometricEnabled(enabled);
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchBiometricStatus();
  }, []);

  // Use the real API call to send the password change verification code
  const sendPasswordVerificationCodeHandler = async () => {
    setSendingCode(true);
    setError(null);
    setSuccess(null);
    try {
      await sendPasswordVerificationCode();
      setSuccess('Password verification code sent to your email.');
      setCodeSent(true);
    } catch (e: any) {
      setError(e.message || 'Failed to send password verification code.');
      if (process.env.NODE_ENV === 'development') {
        // Log the error object for debugging
        // eslint-disable-next-line no-console
        console.error('Password verification code error:', e);
      }
    }
    setSendingCode(false);
  };

  // Add the real API call for password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (!passwordMatch || confirmPassword === '') {
        setError('Passwords do not match.');
        return;
      }
      await import('../services/api').then(m => m.changePassword(
        newPassword,
        code,
        spotid
      ));
      setSuccess('Password updated successfully.');
      setShowUpdatePassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setSpotid('');
      setCode('');
    } catch (e: any) {
      setError(e.message || 'Failed to update password.');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Update password error:', e);
      }
    }
  };

  // Funds Privacy Modal: on successful verification, lock funds actions
  const handleFundsPrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const resp = await import('../services/api').then(m => m.verifyFundsPrivacy(
        fundsSpotid,
        fundsEmailCode,
        fundsPassword,
        funds2fa
      ));
      setShowFundsPrivacyModal(false);
      setFundsSpotid('');
      setFundsEmailCode('');
      setFundsPassword('');
      setFunds2fa('');
      setSuccess(resp.message || 'Funds privacy verified successfully.');
      setTimeout(() => setSuccess(null), 2500);
      // No need to dispatch storage event; dashboard now reads fundsLocked from backend
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Verification failed.');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Funds privacy verification error:', e);
      }
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 0,
      boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
      padding: '12px 16px',
      minWidth: 0,
      maxWidth: 320,
      width: '100%',
      boxSizing: 'border-box',
      textAlign: 'center',
      marginBottom: 0,
      fontFamily: 'inherit',
      height: 300,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 0,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }}>
      {success && (
        <div style={{ color: 'green', fontSize: 15, marginBottom: 10, fontWeight: 600 }}>
          {success}
        </div>
      )}
      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#25324B', marginBottom: 4, letterSpacing: 1 }}>Privacy Settings</div>
      <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 8 }}>
        Control your privacy and security options here.
      </div>
      {!showUpdatePassword && (
        <>
          <button
            style={{
              border: 'none',
              borderRadius: 0,
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: 4,
              background: '#888',
              color: '#fff',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
              alignSelf: 'center',
              marginBottom: 12,
              width: '90%'
            }}
            onClick={() => navigate('/settings/2fa')}
          >
            Enable 2FA
          </button>
          <button
            style={{
              border: 'none',
              borderRadius: 0,
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: 0,
              background: '#888',
              color: '#fff',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
              alignSelf: 'center',
              marginBottom: 12,
              width: '90%'
            }}
            onClick={async () => {
              setSendingCode(true);
              setError(null);
              setSuccess(null);
              try {
                await import('../services/api').then(m => m.sendFundsPrivacyVerificationCode());
                setSuccess('Funds privacy verification code sent to your email.');
                setShowFundsPrivacyModal(true);
              } catch (e: any) {
                setError(e.message || 'Failed to send funds privacy verification code.');
                if (process.env.NODE_ENV === 'development') {
                  // eslint-disable-next-line no-console
                  console.error('Send funds privacy code error:', e);
                }
              }
              setSendingCode(false);
            }}
            disabled={sendingCode}
          >
            {sendingCode ? 'Sending...' : 'Funds Privacy'}
          </button>
          <button
            style={{
              border: 'none',
              borderRadius: 0,
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: 0,
              background: '#888',
              color: '#fff',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
              alignSelf: 'center',
              marginBottom: 12,
              width: '90%'
            }}
            onClick={() => {
              setShowUpdatePassword(true);
              setCodeSent(false); // Reset so code is sent every time
              sendPasswordVerificationCodeHandler();
            }}
          >
            Update Password
          </button>
        </>
      )}
      {/* WebAuthn Registration Button should be below Update Password */}
      {!showUpdatePassword && (
        <button
          style={{
            border: 'none',
            borderRadius: 0,
            padding: '10px 0',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: biometricEnabled ? 'not-allowed' : 'pointer',
            marginTop: 0,
            background: biometricEnabled ? '#27ae60' : '#888',
            color: '#fff',
            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
            transition: 'background 0.2s',
            alignSelf: 'center',
            marginBottom: 12,
            width: '90%'
          }}
          onClick={async () => {
            if (biometricEnabled) return;
            setError(null);
            setSuccess(null);
            try {
              // Use API base URL for backend endpoints
              const API = process.env.REACT_APP_API_BASE_URL || '';
              // Get userId from JWT
              const token = localStorage.getItem('token');
              console.log('[WebAuthn] Token:', token);
              if (!token) throw new Error('Not authenticated');
              const payload = JSON.parse(atob(token.split('.')[1]));
              console.log('[WebAuthn] JWT payload:', payload);
              const userId = payload.userId;
              if (!userId) throw new Error('No userId in token');
              // Call backend to get registration options
              console.log('[WebAuthn] Fetching registration options for userId:', userId);
              const resp = await fetch(`${API}/webauthn/generate-registration-options`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
              });
              console.log('[WebAuthn] Registration options response:', resp);
              if (!resp.ok) throw new Error('Failed to get registration options');
              const options = await resp.json();
              console.log('[WebAuthn] Registration options:', options);
              // Ensure correct structure for startRegistration
              const registrationOptions = options.challenge ? options : options.options || options;
              const { startRegistration } = await import('@simplewebauthn/browser');
              console.log('[WebAuthn] Starting registration with options:', registrationOptions);
              const attResp = await startRegistration(registrationOptions);
              console.log('[WebAuthn] Attestation response:', attResp);
              // Send attestation response to backend
              const verifyResp = await fetch(`${API}/webauthn/verify-registration`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ credential: attResp, userId })
              });
              console.log('[WebAuthn] Verify registration response:', verifyResp);
              if (!verifyResp.ok) throw new Error('Failed to verify registration');
              const verifyData = await verifyResp.json();
              console.log('[WebAuthn] Verify registration data:', verifyData);
              if (!verifyData.verified) throw new Error('Registration failed');
              setSuccess('Biometric device registered!');
              setBiometricEnabled(true);
              console.log('[WebAuthn] Registration successful!');
            } catch (e: any) {
              setError(e.message || 'WebAuthn registration failed.');
              console.error('[WebAuthn] Error:', e);
              if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.error('WebAuthn registration error:', e);
              }
            }
          }}
          disabled={biometricEnabled}
        >
          {biometricEnabled ? 'Biometric Enabled' : 'Biometric Authentication'}
        </button>
      )}
      {showUpdatePassword && (
        <form
          style={{
            width: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 12,
            alignItems: 'center'
          }}
          onSubmit={handleUpdatePassword}
        >
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => {
              setNewPassword(e.target.value);
              setPasswordMatch(e.target.value === confirmPassword);
            }}
            style={{ width: '100%', padding: 8, marginBottom: 4, border: passwordMatch || confirmPassword === '' ? '1px solid #ccc' : '1.5px solid #e74c3c' }}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => {
              setConfirmPassword(e.target.value);
              setPasswordMatch(newPassword === e.target.value);
            }}
            style={{ width: '100%', padding: 8, marginBottom: 4, border: passwordMatch || confirmPassword === '' ? '1px solid #ccc' : '1.5px solid #e74c3c' }}
            required
          />
          {!passwordMatch && confirmPassword !== '' && (
            <div style={{ color: '#e74c3c', fontSize: 13, marginTop: -4, marginBottom: 4 }}>
              Passwords do not match
            </div>
          )}
          <input
            type="text"
            placeholder="Spot ID"
            value={spotid}
            onChange={e => setSpotid(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 4 }}
            required
          />
          <input
            type="text"
            placeholder="Password Verification Code"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 4 }}
            required={codeSent}
            disabled={!codeSent}
          />
          <div style={{ display: 'flex', width: '100%', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setShowUpdatePassword(false)}
              style={{
                border: 'none',
                borderRadius: 0,
                padding: '10px 0',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                background: '#888',
                color: '#fff',
                width: '48%',
                boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
                transition: 'background 0.2s',
                alignSelf: 'center'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                border: 'none',
                borderRadius: 0,
                padding: '10px 0',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                background: '#25324B',
                color: '#fff',
                width: '48%',
                marginBottom: 4,
                boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
                transition: 'background 0.2s',
                alignSelf: 'center'
              }}
              disabled={sendingCode || !passwordMatch || confirmPassword === ''}
            >
              Update Password
            </button>
          </div>
          {sendingCode && <div style={{ color: '#888', fontSize: 13 }}>Sending verification code...</div>}
          {error && <div style={{ color: 'red', fontSize: 13 }}>{error}</div>}
          {success && <div style={{ color: 'green', fontSize: 13 }}>{success}</div>}
        </form>
      )}
      {showFundsPrivacyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(245,247,250,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          boxSizing: 'border-box',
          overflow: 'auto',
        }}>
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            borderRadius: 0,
            boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
            minWidth: 0,
            maxWidth: 320,
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'center',
            marginBottom: 0,
            fontFamily: 'inherit',
            height: 340,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0,
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#25324B', marginBottom: 4, letterSpacing: 1 }}>Funds Privacy Verification</div>
            <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 8 }}>
              Enter the details below to proceed.
            </div>
            <form
              style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}
              onSubmit={handleFundsPrivacySubmit}
            >
              <input
                type="text"
                placeholder="Spot ID"
                value={fundsSpotid}
                onChange={e => setFundsSpotid(e.target.value)}
                style={{ width: '100%', padding: 8, marginBottom: 4, border: '1px solid #ccc', fontSize: 16, outline: 'none', background: 'transparent', fontFamily: 'inherit' }}
                required
              />
              <input
                type="text"
                placeholder="Email Verification Code"
                value={fundsEmailCode}
                onChange={e => setFundsEmailCode(e.target.value)}
                style={{ width: '100%', padding: 8, marginBottom: 4, border: '1px solid #ccc', fontSize: 16, outline: 'none', background: 'transparent', fontFamily: 'inherit' }}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={fundsPassword}
                onChange={e => setFundsPassword(e.target.value)}
                style={{ width: '100%', padding: 8, marginBottom: 4, border: '1px solid #ccc', fontSize: 16, outline: 'none', background: 'transparent', fontFamily: 'inherit' }}
                required
              />
              <input
                type="text"
                placeholder="2FA Code"
                value={funds2fa}
                onChange={e => setFunds2fa(e.target.value)}
                style={{ width: '100%', padding: 8, marginBottom: 4, border: '1px solid #ccc', fontSize: 16, outline: 'none', background: 'transparent', fontFamily: 'inherit' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, width: '100%', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowFundsPrivacyModal(false)}
                  style={{
                    border: 'none',
                    borderRadius: 0,
                    padding: '10px 0',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    background: '#888',
                    color: '#fff',
                    boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
                    transition: 'background 0.2s',
                    alignSelf: 'center',
                    marginRight: 8,
                    width: '48%'
                  }}
                >Cancel</button>
                <button
                  type="submit"
                  style={{
                    border: 'none',
                    borderRadius: 0,
                    padding: '10px 0',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    background: '#25324B',
                    color: '#fff',
                    boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
                    transition: 'background 0.2s',
                    alignSelf: 'center',
                    width: '48%'
                  }}
                >Submit</button>
              </div>
              {error && <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>{error}</div>}
              {success && <div style={{ color: 'green', fontSize: 13, marginTop: 4 }}>{success}</div>}
            </form>
          </div>
        </div>
      )}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 22,
            color: '#888',
            cursor: 'pointer',
            alignSelf: 'flex-end'
          }}
          aria-label="Close"
        >&times;</button>
      )}
      <style>
        {`
          @media (max-width: 600px) {
            body, html, #root {
              width: 100vw !important;
              overflow-x: hidden !important;
            }
            div[style*="box-shadow"] {
              max-width: 100vw !important;
              min-width: 0 !important;
              width: 100vw !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding: 10px 0 !important;
              box-sizing: border-box !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PrivacySettings;
