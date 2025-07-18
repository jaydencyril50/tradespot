import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerificationCode, sendPasswordVerificationCode } from '../services/api';
import { changeWallet, sendFundsPrivacyVerificationCode, verifyFundsPrivacy } from '../services/api';
import { changeName, changeEmail } from '../services/api';
import { changePassword } from '../services/api';
import './PrivacySettings.css';
import { useTheme } from '../ThemeContext';

const PrivacySettings: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      if (!oldPassword || !newPassword || !confirmPassword) {
        setError('All fields are required.');
        return;
      }
      if (!passwordMatch || confirmPassword === '') {
        setError('Passwords do not match.');
        return;
      }
      await import('../services/api').then(m => m.changePassword(
        oldPassword,
        newPassword,
        confirmPassword
      ));
      setSuccess('Password updated successfully.');
      setShowUpdatePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
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
      const resp = await fetch(`${API}/api/webauthn-settings/settings/verify-password`, {
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
    <div className={`privacy-settings-root ${theme}`}>
      {success && (
        <div className="privacy-settings-success">
          {success}
        </div>
      )}
      <div className="privacy-settings-title">Privacy Settings</div>
      <div className="privacy-settings-desc" style={{ color: theme === 'dark' ? '#fff' : undefined }}>
        Control your privacy and security options here.
      </div>
      {!showUpdatePassword && (
        <>
          <button
            className="privacy-settings-btn"
            onClick={() => navigate('/settings/2fa')}
          >
            Enable 2FA
          </button>
          <button
            className="privacy-settings-btn"
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
            className="privacy-settings-btn"
            onClick={() => {
              setShowUpdatePassword(true);
              setCodeSent(false); // Reset so code is sent every time
              sendPasswordVerificationCodeHandler();
            }}
          >
            Update Password
          </button>
          <button
            className="privacy-settings-btn"
            onClick={handleWebauthnClick}
          >
            WebAuthn Security
          </button>
        </>
      )}
      {showUpdatePassword && (
        <form
          className="privacy-settings-form"
          onSubmit={handleUpdatePassword}
        >
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            className="privacy-settings-input"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => {
              setNewPassword(e.target.value);
              setPasswordMatch(e.target.value === confirmPassword);
            }}
            className={`privacy-settings-input${passwordMatch || confirmPassword === '' ? '' : ' error'}`}
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
            className={`privacy-settings-input${passwordMatch || confirmPassword === '' ? '' : ' error'}`}
            required
          />
          {!passwordMatch && confirmPassword !== '' && (
            <div className="privacy-settings-error">
              Passwords do not match
            </div>
          )}
          <div style={{ display: 'flex', width: '100%', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setShowUpdatePassword(false)}
              className="privacy-settings-modal-btn cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="privacy-settings-modal-btn continue"
              disabled={sendingCode || !passwordMatch || confirmPassword === ''}
            >
              Update Password
            </button>
          </div>
          {sendingCode && <div style={{ color: '#888', fontSize: 13 }}>Sending verification code...</div>}
          {error && <div className="privacy-settings-error">{error}</div>}
          {success && <div style={{ color: 'green', fontSize: 13 }}>{success}</div>}
        </form>
      )}
      {showFundsPrivacyModal && (
        <div className="privacy-settings-modal-overlay">
          <div className="privacy-settings-modal-card" style={{ padding: '22px 18px 18px 18px', maxWidth: 480, minWidth: 340, width: '100%' }}>
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
                className="privacy-settings-input"
                required
              />
              <input
                type="text"
                placeholder="Email Verification Code"
                value={fundsEmailCode}
                onChange={e => setFundsEmailCode(e.target.value)}
                className="privacy-settings-input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={fundsPassword}
                onChange={e => setFundsPassword(e.target.value)}
                className="privacy-settings-input"
                required
              />
              <input
                type="text"
                placeholder="2FA Code"
                value={funds2fa}
                onChange={e => setFunds2fa(e.target.value)}
                className="privacy-settings-input"
                required
              />
              <div className="privacy-settings-modal-btn-row" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowFundsPrivacyModal(false)}
                  className="privacy-settings-modal-btn cancel"
                >Cancel</button>
                <button
                  type="submit"
                  className="privacy-settings-modal-btn continue"
                >Submit</button>
              </div>
              {error && <div className="privacy-settings-error" style={{ marginTop: 4 }}>{error}</div>}
              {success && <div style={{ color: 'green', fontSize: 13, marginTop: 4 }}>{success}</div>}
            </form>
          </div>
        </div>
      )}
      {/* Password Modal for WebAuthn Security */}
      {showPasswordModal && (
        <div className="privacy-settings-modal-overlay">
          <div className="privacy-settings-modal-card" style={{ maxWidth: 480, minWidth: 340, width: '100%' }}>
            <div className="privacy-settings-modal-title">Enter Password</div>
            <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }} onSubmit={handlePasswordModalSubmit}>
              <input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="privacy-settings-input"
                required
                autoFocus
              />
              <div className="privacy-settings-modal-btn-row" style={{ width: '100%', display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="privacy-settings-modal-btn cancel"
                  style={{ flex: 1, minWidth: 0 }}
                >Cancel</button>
                <button
                  type="submit"
                  className="privacy-settings-modal-btn continue"
                  style={{ background: '#102c5a', color: '#fff', flex: 1, minWidth: 0 }}
                >Continue</button>
              </div>
              {passwordModalError && <div className="privacy-settings-error" style={{ marginTop: 4 }}>{passwordModalError}</div>}
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
    </div>
  );
};

export default PrivacySettings;
