import React, { useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;
const DEPOSIT_ADDRESS = 'TSNHcwrdH83nh16RGdFQizYKQaDUyTnd7W';

const Deposit: React.FC = () => {
    const [amount, setAmount] = useState('');
    const [txid, setTxid] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [checking, setChecking] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedTxid, setCopiedTxid] = useState(false);

    const handleDeposit = async () => {
        setError('');
        setSuccess('');
        if (!amount || isNaN(Number(amount)) || Number(amount) < 10) {
            setError('Minimum deposit is 10 USDT');
            return;
        }
        if (!txid || txid.length < 8) {
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

    const handleCopyTxid = async () => {
        try {
            await navigator.clipboard.writeText(txid);
            setCopiedTxid(true);
            setTimeout(() => setCopiedTxid(false), 1200);
        } catch (err) {}
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
                    DEPOSIT
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', gap: 20 }}>
                <div style={{ background: '#fff', boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)', border: '1px solid #e3e6ef', padding: '18px 24px', minWidth: 200, maxWidth: 380, width: '100%', textAlign: 'center', fontFamily: 'inherit' }}>
                    <div style={{ marginBottom: 18, fontWeight: 600, color: '#1e3c72' }}>
                        Deposit Address (TRC20):
                        <div
                            style={{
                                background: '#eaf1fb',
                                color: '#25324B',
                                padding: 10,
                                fontSize: 15,
                                marginTop: 8,
                                wordBreak: 'break-all',
                                letterSpacing: 1,
                                cursor: 'pointer',
                                textDecoration: 'underline dotted',
                            }}
                            title={copied ? 'Copied!' : 'Click to copy'}
                            onClick={handleCopyAddress}
                        >
                            {DEPOSIT_ADDRESS}
                            {copied && <span style={{ color: '#10c98f', marginLeft: 8, fontSize: 13 }}>Copied!</span>}
                        </div>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500, color: '#25324B', marginBottom: 4, display: 'block' }}>Amount to Deposit:</label>
                        <input
                            type="number"
                            min="10"
                            step="any"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={{ width: '95%', padding: '8px', border: '1px solid #ccc', fontSize: 16 }}
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500, color: '#25324B', marginBottom: 4, display: 'block' }}>Transaction ID (txid):</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="text"
                                value={txid}
                                onChange={e => setTxid(e.target.value)}
                                style={{ width: '80%', padding: '8px', border: '1px solid #ccc', fontSize: 16 }}
                            />
                            <button
                                onClick={handleCopyTxid}
                                style={{ padding: '6px 10px', border: 'none', borderRadius: 4, background: '#eaf1fb', color: '#25324B', cursor: 'pointer', fontWeight: 600 }}
                                title={copiedTxid ? 'Copied!' : 'Copy txid'}
                                type="button"
                            >
                                {copiedTxid ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    {error && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{error}</div>}
                    {success && <div style={{ color: '#10c98f', marginBottom: 10 }}>{success}</div>}
                    <button
                        onClick={handleDeposit}
                        disabled={checking}
                        style={{
                            width: '95%',
                            background: '#888',
                            color: '#fff',
                            padding: '12px 0',
                            border: 'none',
                            borderRadius: 0,
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
