import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../ThemeContext';

const API = process.env.REACT_APP_API_BASE_URL;
const DEPOSIT_ADDRESS = 'TSNHcwrdH83nh16RGdFQizYKQaDUyTnd7W';

const Deposit: React.FC = () => {
    const { theme } = useTheme();
    const [amount, setAmount] = useState('');
    const [txid, setTxid] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [checking, setChecking] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedTxid, setCopiedTxid] = useState(false);
    const [txidInputError, setTxidInputError] = useState('');

    // Helper for txid validation
    const isValidTxid = (value: string) => {
        // Example: TRC20 txid is usually 64 hex chars, but allow 8+ for flexibility
        return /^[a-fA-F0-9]{8,}$/.test(value);
    };

    const handleDeposit = async () => {
        setError('');
        setSuccess('');
        if (!amount || isNaN(Number(amount)) || Number(amount) < 10) {
            setError('Minimum deposit is 10 USDT');
            return;
        }
        if (!txid || !isValidTxid(txid)) {
            setError('Please enter a valid transaction ID (txid)');
            return;
        }
        setChecking(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/api/deposit/manual`, { amount: Number(amount), txid }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Deposit request submitted! Awaiting admin approval.');
            setAmount('');
            setTxid('');
        } catch (e: any) {
            setError(e?.response?.data?.error || e.message || 'Failed to submit deposit request');
        } finally {
            setChecking(false);
        }
    };

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(DEPOSIT_ADDRESS);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (err) {}
    };

    const handlePasteTxid = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setTxid(text);
        } catch (err) {
            setError('Failed to read from clipboard');
        }
    };

    const handleTxidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTxid(value);
        if (!value) {
            setTxidInputError('Transaction ID is required');
        } else if (!isValidTxid(value)) {
            setTxidInputError('Invalid txid format (must be at least 8 hex characters)');
        } else {
            setTxidInputError('');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0 0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 4vw 10px 4vw', border: '1.5px solid var(--primary)', borderTop: 0, borderLeft: 0, borderRight: 0, maxWidth: 500, margin: '0 auto' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 690, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif', wordBreak: 'break-word' }}>
                    DEPOSIT
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', gap: 20 }}>
                <div style={{ background: 'var(--card-bg)', boxShadow: '0 8px 32px 0 rgba(30,60,114,0.25), 0 2px 8px 0 rgba(30,60,114,0.18), var(--card-shadow)', border: 'none', borderRadius: 1, padding: '5vw 4vw', minWidth: 0, maxWidth: 500, width: '100%', textAlign: 'center', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                    <div style={{ marginBottom: 18, fontWeight: 600, color: 'var(--primary)', wordBreak: 'break-word' }}>
                        Deposit Address (TRC20):
                        <div
                            style={{
                                background: 'var(--bg)',
                                color: 'var(--primary)',
                                padding: '2vw',
                                fontSize: 15,
                                marginTop: 8,
                                wordBreak: 'break-all',
                                letterSpacing: 1,
                                cursor: 'pointer',
                                textDecoration: 'underline dotted',
                                borderRadius: 4,
                                fontFamily: 'monospace',
                                maxWidth: '100%',
                                overflowWrap: 'break-word',
                            }}
                            title={copied ? 'Copied!' : 'Click to copy'}
                            onClick={handleCopyAddress}
                        >
                            {DEPOSIT_ADDRESS}
                            {copied && <span style={{ color: '#10c98f', marginLeft: 8, fontSize: 13 }}>Copied!</span>}
                        </div>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500, color: 'var(--primary)', marginBottom: 4, display: 'block', textAlign: 'left' }}>Amount to Deposit:</label>
                        <input
                            type="number"
                            min="10"
                            step="any"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1.5px solid rgba(120,140,180,0.45)', fontSize: 16, background: 'var(--bg)', color: 'var(--text)', borderRadius: 4, boxSizing: 'border-box' }}
                        />
                        {(!amount || isNaN(Number(amount)) || Number(amount) < 10) && (
                            <div style={{ color: '#e74c3c', marginTop: 4, fontSize: 13 }}>
                                Minimum deposit is 10 USDT
                            </div>
                        )}
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500, color: 'var(--primary)', marginBottom: 4, display: 'block', textAlign: 'left' }}>Transaction ID (txid):</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="text"
                                value={txid}
                                onChange={handleTxidChange}
                                style={{ width: '100%', padding: '10px', border: '1.5px solid rgba(120,140,180,0.45)', fontSize: 16, background: 'var(--bg)', color: 'var(--text)', borderRadius: 4, boxSizing: 'border-box' }}
                            />
                            <button
                                onClick={handlePasteTxid}
                                style={{
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderRadius: 4,
                                    background: 'var(--secondary)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    transition: 'background 0.2s',
                                }}
                                title="Paste txid from clipboard"
                                type="button"
                            >
                                Paste
                            </button>
                        </div>
                        {txidInputError && <div style={{ color: '#e74c3c', marginTop: 4, fontSize: 13 }}>{txidInputError}</div>}
                    </div>
                    {error && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{error}</div>}
                    {success && <div style={{ color: '#10c98f', marginBottom: 10 }}>{success}</div>}
                    <button
                        onClick={handleDeposit}
                        disabled={checking}
                        style={{
                            width: '100%',
                            background: 'var(--secondary)',
                            color: '#fff',
                            padding: '14px 0',
                            border: 'none',
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: 17,
                            cursor: checking ? 'not-allowed' : 'pointer',
                            marginTop: 8,
                            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
                            transition: 'background 0.2s',
                        }}
                    >
                        {checking ? 'Submitting...' : 'Submit Deposit Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Deposit;
