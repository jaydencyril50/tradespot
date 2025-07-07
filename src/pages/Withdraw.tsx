// Withdraw page - content will be added later
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

const Withdraw: React.FC = () => {
    const [flexBalance, setFlexBalance] = useState<number>(0);
    const [wallet, setWallet] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch user portfolio on mount
    useEffect(() => {
        const fetchPortfolio = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Not authenticated');
                const res = await axios.get(`${API}/api/portfolio`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFlexBalance(res.data.flexBalance || 0);
                setWallet(res.data.wallet || '');
            } catch (e: any) {
                setError(e?.response?.data?.error || e.message || 'Failed to load portfolio');
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, []);

    // Real-time balance check on amount input
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount(value);
        setError('');
        setSuccess('');
        if (value && !isNaN(Number(value)) && Number(value) > flexBalance) {
            setError('Insufficient funds.');
        }
    };

    // Send withdrawal verification code to email
    const handleSendCode = async () => {
        setSendingCode(true);
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');
            await axios.post(`${API}/api/send-withdrawal-verification`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCodeSent(true);
            setSuccess('Verification code sent to your email.');
        } catch (e: any) {
            setError(e?.response?.data?.error || e.message || 'Failed to send verification code');
        } finally {
            setSendingCode(false);
        }
    };

    // Handle withdrawal
    const handleWithdraw = async () => {
        setError('');
        setSuccess('');
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError('Enter a valid withdrawal amount.');
            return;
        }
        if (Number(amount) > flexBalance) {
            setError('Insufficient FLEX balance.');
            return;
        }
        if (!verificationCode) {
            setError('Enter the email verification code.');
            return;
        }
        if (!twoFACode) {
            setError('Enter your 2FA code.');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');
            await axios.post(`${API}/api/withdraw`, {
                amount: Number(amount),
                verificationCode,
                twoFACode,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Withdrawal request submitted successfully.');
            setAmount('');
            setVerificationCode('');
            setTwoFACode('');
            // Optionally refresh balance
            setFlexBalance(bal => bal - Number(amount));
        } catch (e: any) {
            setError(e?.response?.data?.error || e.message || 'Withdrawal failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
                    WITHDRAW FLEX
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', gap: 20 }}>
                <div style={{ background: '#fff', boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)', border: '1px solid #e3e6ef', padding: '18px 24px', minWidth: 200, maxWidth: 380, width: '100%', textAlign: 'center', fontFamily: 'inherit' }}>
                    <div style={{ marginBottom: 16, fontWeight: 600, color: '#1e3c72' }}>
                        FLEX Balance: <span style={{ color: '#10c98f' }}>{loading ? 'Loading...' : flexBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500, color: '#25324B', marginBottom: 4, display: 'block' }}>Withdrawal Wallet Address:</label>
                        <input
                            type="text"
                            value={wallet}
                            disabled
                            style={{ width: '95%', padding: '8px', border: '1px solid #ccc', fontSize: 16, background: '#eaf1fb', color: '#888', textAlign: 'center' }}
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500, color: '#25324B', marginBottom: 4, display: 'block' }}>Amount to Withdraw:</label>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={amount}
                            onChange={handleAmountChange}
                            style={{ width: '95%', padding: '8px', border: '1px solid #ccc', fontSize: 16 }}
                        />
                        {amount && Number(amount) > flexBalance && (
                            <div style={{ color: '#e74c3c', fontWeight: 600, marginTop: 4, fontSize: 14 }}>Insufficient funds.</div>
                        )}
                    </div>
                    <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 500, color: '#25324B', marginBottom: 4, display: 'block' }}>Email Verification Code:</label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={e => setVerificationCode(e.target.value)}
                                style={{ width: '90%', padding: '8px', border: '1px solid #ccc', fontSize: 16 }}
                                maxLength={6}
                                inputMode="numeric"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={sendingCode}
                            style={{
                                marginLeft: 10,
                                marginTop: 22,
                                padding: '8px 12px',
                                border: 'none',
                                borderRadius: 0,
                                background: '#1e3c72',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: sendingCode ? 'not-allowed' : 'pointer',
                                minWidth: 80,
                            }}
                        >
                            {sendingCode ? 'Sending...' : codeSent ? 'Resend' : 'Send'}
                        </button>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500, color: '#25324B', marginBottom: 4, display: 'block' }}>2FA Code:</label>
                        <input
                            type="text"
                            value={twoFACode}
                            onChange={e => setTwoFACode(e.target.value)}
                            style={{ width: '95%', padding: '8px', border: '1px solid #ccc', fontSize: 16 }}
                            maxLength={6}
                            inputMode="numeric"
                        />
                    </div>
                    {error && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{error}</div>}
                    {success && <div style={{ color: '#10c98f', marginBottom: 10 }}>{success}</div>}
                    <button
                        onClick={handleWithdraw}
                        disabled={loading}
                        style={{
                            width: '95%',
                            background: '#888',
                            color: '#fff',
                            padding: '12px 0',
                            border: 'none',
                            borderRadius: 0,
                            fontWeight: 700,
                            fontSize: 17,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: 8,
                            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
                            transition: 'background 0.2s',
                        }}
                    >
                        {loading ? 'Processing...' : 'Withdraw'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Withdraw;
