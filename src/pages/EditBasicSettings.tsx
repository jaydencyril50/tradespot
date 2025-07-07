import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendNameVerificationCode, changeName, sendEmailVerificationCode, changeEmail, sendWalletVerificationCode, changeWallet } from '../services/api';

const EditBasicSettings: React.FC = () => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState<'none' | 'name' | 'email' | 'wallet'>('none');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newWallet, setNewWallet] = useState('');
  const [code, setCode] = useState('');
  const [spotid, setSpotid] = useState('');
  const [twoFAToken, setTwoFAToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleEditNameClick = async () => {
    setEditing('name');
    setError('');
    setSuccess('');
    setNewName('');
    setCode('');
    setLoading(true);
    try {
      await sendNameVerificationCode();
      setSuccess('Verification code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    }
    setLoading(false);
  };

  const handleEditEmailClick = async () => {
    setEditing('email');
    setError('');
    setSuccess('');
    setNewEmail('');
    setSpotid('');
    setLoading(false);
  };

  const handleEditWalletClick = async () => {
    setEditing('wallet');
    setError('');
    setSuccess('');
    setNewWallet('');
    setCode('');
    setLoading(true);
    try {
      await sendWalletVerificationCode();
      setSuccess('Verification code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    }
    setLoading(false);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await changeName(newName, code);
      setSuccess('Name changed successfully!');
      setEditing('none');
    } catch (err: any) {
      setError(err.message || 'Failed to change name.');
    }
    setLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await changeEmail(newEmail, spotid);
      setSuccess('Email changed successfully!');
      setEditing('none');
    } catch (err: any) {
      setError(err.message || 'Failed to change email.');
    }
    setLoading(false);
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await changeWallet(newWallet, code, spotid, twoFAToken);
      setSuccess('Wallet changed successfully!');
      setEditing('none');
    } catch (err: any) {
      setError(err.message || 'Failed to change wallet.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: '#fff',
        borderRadius: 0,
        boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
        padding: '12px 16px',
        minWidth: 200,
        maxWidth: 380,
        width: '100%',
        textAlign: 'center',
        marginBottom: 0,
        fontFamily: 'inherit',
        height: 260,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#25324B', marginBottom: 4, letterSpacing: 1 }}>Basic Settings</div>
        <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 8 }}>
          Manage your account and preferences here.
        </div>
        {editing === 'none' && (
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
                width: '100%'
              }}
              onClick={handleEditNameClick}
              disabled={loading}
            >
              Edit Name
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
                width: '100%'
              }}
              onClick={handleEditEmailClick}
              disabled={loading}
            >
              Edit Email
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
                width: '100%'
              }}
              onClick={handleEditWalletClick}
              disabled={loading}
            >
              Edit Wallet
            </button>
          </>
        )}
        {editing === 'name' && (
          <form onSubmit={handleNameSubmit} style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="New Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }}
            />
            <input
              type="text"
              placeholder="Verification Code"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }}
            />
            {error && <div style={{ color: 'red', marginBottom: 6 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: 6 }}>{success}</div>}
            <div style={{ display: 'flex', width: '100%', gap: 8 }}>
              <button
                type="submit"
                style={{ flex: 1, border: 'none', borderRadius: 0, padding: '10px 0', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', background: '#1e3c72', color: '#fff', boxShadow: '0 1px 4px rgba(30,60,114,0.10)' }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                style={{ flex: 1, border: 'none', borderRadius: 0, padding: '10px 0', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', background: '#888', color: '#fff', boxShadow: '0 1px 4px rgba(30,60,114,0.10)' }}
                onClick={() => { setEditing('none'); setError(''); setSuccess(''); }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {editing === 'email' && (
          <form onSubmit={handleEmailSubmit} style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input
              type="email"
              placeholder="New Email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }}
            />
            <input
              type="text"
              placeholder="Your Spot ID"
              value={spotid}
              onChange={e => setSpotid(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }}
            />
            {error && <div style={{ color: 'red', marginBottom: 6 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: 6 }}>{success}</div>}
            <div style={{ display: 'flex', width: '100%', gap: 8 }}>
              <button
                type="submit"
                style={{ flex: 1, border: 'none', borderRadius: 0, padding: '10px 0', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', background: '#1e3c72', color: '#fff', boxShadow: '0 1px 4px rgba(30,60,114,0.10)' }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                style={{ flex: 1, border: 'none', borderRadius: 0, padding: '10px 0', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', background: '#888', color: '#fff', boxShadow: '0 1px 4px rgba(30,60,114,0.10)' }}
                onClick={() => { setEditing('none'); setError(''); setSuccess(''); }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {editing === 'wallet' && (
          <form onSubmit={handleWalletSubmit} style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="New Wallet Address"
              value={newWallet}
              onChange={e => setNewWallet(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }}
            />
            <input
              type="text"
              placeholder="Verification Code"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }}
            />
            <input
              type="text"
              placeholder="Your Spot ID"
              value={spotid}
              onChange={e => setSpotid(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }}
            />
            <input
              type="text"
              placeholder="2FA Code"
              value={twoFAToken}
              onChange={e => setTwoFAToken(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }}
            />
            {error && <div style={{ color: 'red', marginBottom: 6 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: 6 }}>{success}</div>}
            <div style={{ display: 'flex', width: '100%', gap: 8 }}>
              <button
                type="submit"
                style={{ flex: 1, border: 'none', borderRadius: 0, padding: '10px 0', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', background: '#1e3c72', color: '#fff', boxShadow: '0 1px 4px rgba(30,60,114,0.10)' }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                style={{ flex: 1, border: 'none', borderRadius: 0, padding: '10px 0', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', background: '#888', color: '#fff', boxShadow: '0 1px 4px rgba(30,60,114,0.10)' }}
                onClick={() => { setEditing('none'); setError(''); setSuccess(''); }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBasicSettings;
