import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;
const DEPOSIT_ADDRESS = 'TSNHcwrdH83nh16RGdFQizYKQaDUyTnd7W';

const Deposit: React.FC = () => {
    const [amount, setAmount] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [timer, setTimer] = useState(15 * 60); // 15 minutes
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(false);
    const [copied, setCopied] = useState(false);

    // Store session expiry for timer
    const [expiresAt, setExpiresAt] = useState<number | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (modalOpen && modalStatus === 'pending') {
            interval = setInterval(async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${API}/api/deposit/status`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.data.status === 'success') {
                        setModalStatus('success');
                        setTimeout(() => setModalOpen(false), 1800);
                    }
                    // Do not set 'failed' here
                } catch {}
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [modalOpen, modalStatus]);

    useEffect(() => {
        if (!modalOpen || modalStatus !== 'pending') return;
        if (expiresAt) {
            const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            setTimer(left);
            if (left <= 0) {
                setModalStatus('failed');
            }
            const t = setTimeout(() => setTimer(left - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [modalOpen, modalStatus, expiresAt, timer]);

    const handleDeposit = async () => {
        setError('');
        if (!amount || isNaN(Number(amount)) || Number(amount) < 10) {
            setError('Minimum deposit is 10 USDT');
            return;
        }
        setChecking(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API}/api/deposit/start`, { amount: Number(amount) }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setModalOpen(true);
            setModalStatus('pending');
            setExpiresAt(res.data.expiresAt || (Date.now() + 15 * 60 * 1000));
            setTimer(Math.max(0, Math.floor(((res.data.expiresAt || (Date.now() + 15 * 60 * 1000)) - Date.now()) / 1000)));
        } catch (e: any) {
            setError(e?.response?.data?.error || e.message || 'Failed to start deposit');
        } finally {
            setChecking(false);
        }
    };

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(DEPOSIT_ADDRESS);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (err) {
            // fallback: do nothing
        }
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
                    {error && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{error}</div>}
                    <button
                        onClick={handleDeposit}
                        disabled={checking}
                        style={{
                            width: '95%',
                            background: '#888', // match Settings button color
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
                        {checking ? 'Checking...' : 'Deposit Now'}
                    </button>
                </div>
            </div>

            {modalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(30,40,60,0.55)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                }}>
                    <div style={{
                        background: '#000',
                        borderRadius: 16,
                        padding: 32,
                        width: 300,
                        height: 320,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 30px rgba(0,255,100,0.2)',
                        color: '#00ff88',
                    }}>
                        {modalStatus === 'pending' && (
                            <>
                                <svg
                                    width="100"
                                    height="100"
                                    viewBox="0 0 100 100"
                                    style={{ marginBottom: 24, animation: 'spin-animation 1.2s linear infinite' }}
                                >
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#00ff88"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray="40 20"
                                        strokeDashoffset="0"
                                    />
                                </svg>
                                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Detecting...</div>
                                <div style={{ fontSize: 14 }}>
                                    Time left: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                </div>
                            </>
                        )}

                        {modalStatus === 'success' && (
                            <>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#10c98f', marginBottom: 12 }}>Deposit Success!</div>
                                <div style={{ fontSize: 15, color: '#eaf1fb', marginBottom: 8 }}>Your balance will update shortly.</div>
                            </>
                        )}

                        {modalStatus === 'failed' && (
                            <>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#e74c3c', marginBottom: 12 }}>Deposit Failed</div>
                                <div style={{ fontSize: 15, color: '#fff', marginBottom: 8 }}>No deposit detected for {amount} USDT.</div>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    style={{
                                        marginTop: 18,
                                        background: '#1e3c72',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 0,
                                        padding: '8px 18px',
                                        fontWeight: 600,
                                        fontSize: 16,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Close
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
            {/* Inline animation style */}
            <style>
                {`
                    @keyframes spin-animation {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default Deposit;
