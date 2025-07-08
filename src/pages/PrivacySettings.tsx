import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerificationCode, sendPasswordVerificationCode } from '../services/api';
import { changeWallet, sendFundsPrivacyVerificationCode, verifyFundsPrivacy } from '../services/api';
import { changeName, changeEmail } from '../services/api';
import { changePassword } from '../services/api';

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
  const [spotidValid, setSpotidValid] = useState<null | boolean>(null);
  const [codeValid, setCodeValid] = useState<null | boolean>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null);

  const API = process.env.REACT_APP_API_BASE_URL;

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

  // Live SPOTID validation
  const validateSpotid = async (value: string) => {
    if (!value) {
      setSpotidValid(null);
      return;
    }
    try {
      const API = process.env.REACT_APP_API_BASE_URL || '';
      const resp = await fetch(`${API}/api/validate-spotid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotid: value })
      });
      const data = await resp.json();
      setSpotidValid(data.valid === true);
    } catch {
      setSpotidValid(false);
    }
  };

  // Handler for WebAuthn Security button
  const handleWebauthnClick = () => {
    setShowPasswordModal(true);
    setPasswordInput('');
    setPasswordModalError(null);
  };

  // Handler for password modal submit
  const handlePasswordModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordModalError(null);
    try {
      // Call backend route for password verification
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API}/api/auth/webauthn-settings/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: passwordInput })
      });
      if (resp.ok) {
        setShowPasswordModal(false);
        navigate('/settings/webauthn');
      } else {
        setShowPasswordModal(false);
        setPasswordInput('');
      }
    } catch (e: any) {
      setShowPasswordModal(false);
      setPasswordInput('');
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
            onClick={handleWebauthnClick}
          >
            WebAuthn Security
          </button>
        </>
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
            onChange={e => {
              setSpotid(e.target.value);
              validateSpotid(e.target.value);
            }}
            style={{ width: '100%', padding: 8, marginBottom: 4, border: spotidValid === false ? '1.5px solid #e74c3c' : '1px solid #ccc' }}
            required
          />
          {spotidValid === false && (
            <div style={{ color: '#e74c3c', fontSize: 13, marginTop: -4, marginBottom: 4 }}>
              Invalid SPOTID
            </div>
          )}
          <input
            type="text"
            placeholder="Password Verification Code"
            value={code}
            onChange={e => {
              setCode(e.target.value);
              // validateCode(e.target.value, spotid); // DISABLED
            }}
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
              disabled={sendingCode || !passwordMatch || confirmPassword === '' || spotidValid === false}
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
          background: 'rgba(30,40,60,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 10,
            boxShadow: '0 8px 32px 0 rgba(30,60,114,0.18), 0 2px 8px 0 rgba(30,60,114,0.10)',
            minWidth: 0,
            maxWidth: 340,
            width: 320,
            boxSizing: 'border-box',
            textAlign: 'center',
            fontFamily: 'inherit',
            padding: '22px 18px 18px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#25324B', marginBottom: 6, letterSpacing: 1 }}>Funds Privacy Verification</div>
            <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 10 }}>
              Enter the details below to proceed.
            </div>
            <form
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}
              onSubmit={handleFundsPrivacySubmit}
            >
              <input
                type="text"
                placeholder="Spot ID"
                value={fundsSpotid}
                onChange={e => setFundsSpotid(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', marginBottom: 4, border: '1px solid #ccc', borderRadius: 5, fontSize: 15, background: '#fafbfc' }}
                required
              />
              <input
                type="text"
                placeholder="Email Verification Code"
                value={fundsEmailCode}
                onChange={e => setFundsEmailCode(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', marginBottom: 4, border: '1px solid #ccc', borderRadius: 5, fontSize: 15, background: '#fafbfc' }}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={fundsPassword}
                onChange={e => setFundsPassword(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', marginBottom: 4, border: '1px solid #ccc', borderRadius: 5, fontSize: 15, background: '#fafbfc' }}
                required
              />
              <input
                type="text"
                placeholder="2FA Code"
                value={funds2fa}
                onChange={e => setFunds2fa(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', marginBottom: 4, border: '1px solid #ccc', borderRadius: 5, fontSize: 15, background: '#fafbfc' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, width: '100%', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowFundsPrivacyModal(false)}
                  style={{
                    border: 'none',
                    borderRadius: 5,
                    padding: '9px 0',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    background: '#888',
                    color: '#fff',
                    boxShadow: '0 1px 4px rgba(30,60,114,0.08)',
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
                    borderRadius: 5,
                    padding: '9px 0',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    background: '#25324B',
                    color: '#fff',
                    boxShadow: '0 1px 4px rgba(30,60,114,0.08)',
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
      {/* Password Modal for WebAuthn Security */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          inset: 0, // replaces top/left/width/height for full overlay
          background: 'rgba(30,40,60,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 3,
            boxShadow: '0 8px 32px 0 rgba(30,60,114,0.18), 0 2px 8px 0 rgba(30,60,114,0.10)',
            minWidth: 0,
            maxWidth: 320, // Only one maxWidth property
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'center',
            fontFamily: 'inherit',
            padding: '20px 18px 18px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto', // ensures centering
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.08rem', color: '#25324B', marginBottom: 10 }}>Enter Password</div>
            <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }} onSubmit={handlePasswordModalSubmit}>
              <input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', marginBottom: 6, border: '1px solid #ccc', borderRadius: 3, fontSize: 15, background: '#fafbfc' }}
                required
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 2 }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    border: 'none',
                    borderRadius: 3,
                    padding: '9px 0',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    background: '#888',
                    color: '#fff',
                    width: '48%',
                    boxShadow: '0 1px 4px rgba(30,60,114,0.08)',
                    transition: 'background 0.2s',
                    alignSelf: 'center'
                  }}
                >Cancel</button>
                <button
                  type="submit"
                  style={{
                    border: 'none',
                    borderRadius: 3,
                    padding: '9px 0',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    background: '#25324B',
                    color: '#fff',
                    width: '48%',
                    boxShadow: '0 1px 4px rgba(30,60,114,0.08)',
                    transition: 'background 0.2s',
                    alignSelf: 'center'
                  }}
                >Continue</button>
              </div>
              {passwordModalError && <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>{passwordModalError}</div>}
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
              max-width: 90vw !important;
              min-width: 0 !important;
              width: 90vw !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding: 10px 0 !important;
              box-sizing: border-box !important;
              border-radius: 0 !important;
            }
            div[style*="box-shadow"] input {
              max-width: 87vw !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            div[style*="box-shadow"] div[style*="display: flex"][style*="gap"] {
              padding: 0 !important;
              box-sizing: border-box !important;
              gap: 8px !important;
            }
            /* Main privacy settings buttons only: full width on mobile */
            div[style*="box-shadow"] > button {
              width: 95% !important;
              min-width: 0 !important;
              border-radius: 0 !important;
              margin: 0 !important;
              padding: 10px 0 !important;
              font-size: 1rem !important;
            }
            div[style*="box-shadow"] .MuiButtonBase-root {
              border-radius: 0 !important;
            }
            /* Add gap between main privacy settings buttons on mobile */
            div[style*="box-shadow"] > button:not(:last-of-type) {
              margin-bottom: 12px !important;
            }
            /* Fix modal button container padding on mobile for password modal */
            div[style*="box-shadow"] form > div[style*="display: flex"][style*="gap"] {
              padding-left: 8px !important;
              padding-right: 8px !important;
              box-sizing: border-box !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PrivacySettings;
