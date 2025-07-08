import React, { useState, useEffect } from 'react';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [wallet, setWallet] = useState('');
    const [referredBy, setReferredBy] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [walletValid, setWalletValid] = useState(true);
    const [emailValid, setEmailValid] = useState(true);
    const [referralValid, setReferralValid] = useState(true);
    const [referralChecking, setReferralChecking] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Pre-fill referral code from URL if present
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref') || '';
        setReferredBy(ref);
        // Set dark theme for this page
        document.body.setAttribute('data-theme', 'dark');
        return () => {
            document.body.removeAttribute('data-theme');
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !email || !password || !confirmPassword || !wallet || !referredBy) {
            setError('All fields are required, including referral link');
            return;
        }
        if (!emailValid) {
            setError('Please enter a valid email address');
            return;
        }
        if (!walletValid) {
            setError('Please enter a valid TRC20 USDT wallet address');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!referralValid) {
            setError('Referral code does not exist.');
            return;
        }
        try {
            await registerUser(fullName, email, password, wallet, referredBy.trim());
            setError('');
            setSuccess('Registration successful!');
            setTimeout(() => {
                setSuccess('');
                window.location.href = '/login';
            }, 2700); // 2.7 seconds
        } catch (err: any) {
            // Try to extract error message from backend (supports axios and fetch error shapes)
            let errorMsg = 'Registration failed';
            if (err.response && err.response.data && typeof err.response.data === 'object') {
                if (err.response.data.error) {
                    errorMsg = err.response.data.error;
                } else if (typeof err.response.data === 'string') {
                    errorMsg = err.response.data;
                }
            } else if (err.message) {
                errorMsg = err.message;
            }
            setError(errorMsg);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setPasswordMatch(e.target.value === confirmPassword);
    };
    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        setPasswordMatch(password === e.target.value);
    };

    // TRC20 USDT wallet address validation (starts with 'T' and is 34 chars)
    const validateTRC20Wallet = (address: string) => {
        return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
    };

    const validateEmail = (email: string) => {
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setEmailValid(validateEmail(value) || value === '');
    };

    const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setWallet(value);
        setWalletValid(validateTRC20Wallet(value) || value === '');
    };

    const handleReferralBlur = async () => {
        const code = referredBy.trim();
        if (!code) {
            setReferralValid(false);
            return;
        }
        setReferralChecking(true);
        try {
            const valid = await import('../services/api').then(m => m.validateReferralCode(code));
            setReferralValid(valid);
        } catch {
            setReferralValid(false);
        } finally {
            setReferralChecking(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleSubmit} style={{
                background: 'var(--card-bg)',
                borderRadius: 0,
                boxShadow: 'var(--card-shadow)',
                border: '1px solid #282829',
                padding: '12px 16px',
                minWidth: 200,
                maxWidth: 380,
                width: '100%',
                textAlign: 'center',
                marginBottom: 0,
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 0
            }} autoComplete="off">
                <h2 style={{ fontSize: '1.1rem', marginBottom: 16, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1 }}>Register</h2>
                {success && (
                    <div style={{ background: '#1a3a2a', color: '#b8ffb8', padding: '10px', borderRadius: 0, marginBottom: 16, textAlign: 'center', fontWeight: 500, border: '1px solid #2e5c3c', width: '90%' }}>
                        {success}
                    </div>
                )}
                {error && (
                    <div style={{ background: '#3a1a1a', color: '#ffb8b8', padding: '10px', borderRadius: 0, marginBottom: 16, textAlign: 'center', fontWeight: 500, border: '1px solid #5c2e2e', width: '90%' }}>
                        {error}
                    </div>
                )}
                <div style={{ marginBottom: '1rem', width: '90%' }}>
                    <label htmlFor="register-fullname" style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 500, textAlign: 'left' }}>Full Name:</label>
                    <input
                        id="register-fullname"
                        name="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                        required
                        autoComplete="off"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: '1px solid #444', fontSize: 16, background: '#23242a', color: 'var(--text)' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem', width: '90%' }}>
                    <label htmlFor="register-email" style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 500, textAlign: 'left' }}>Email:</label>
                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        autoComplete="off"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: emailValid || email === '' ? '1px solid #444' : '1.5px solid #e74c3c', fontSize: 16, background: '#23242a', color: 'var(--text)' }}
                    />
                    {!emailValid && email !== '' && (
                        <div style={{ color: '#e74c3c', fontSize: 13, marginTop: 4 }}>
                            Please enter a valid email address.
                        </div>
                    )}
                </div>
                <div style={{ marginBottom: '1rem', width: '90%' }}>
                    <label htmlFor="register-password" style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 500, textAlign: 'left' }}>Password:</label>
                    <input
                        id="register-password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        autoComplete="off"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: passwordMatch || confirmPassword === '' ? '1px solid #444' : '1.5px solid #e74c3c', fontSize: 16, background: '#23242a', color: 'var(--text)' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem', width: '90%' }}>
                    <label htmlFor="register-confirm-password" style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 500, textAlign: 'left' }}>Confirm Password:</label>
                    <input
                        id="register-confirm-password"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                        autoComplete="off"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: passwordMatch || confirmPassword === '' ? '1px solid #444' : '1.5px solid #e74c3c', fontSize: 16, background: '#23242a', color: 'var(--text)' }}
                    />
                </div>
                <div style={{ marginBottom: '1.5rem', width: '90%' }}>
                    <label htmlFor="register-wallet" style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 500, textAlign: 'left' }}>TRC20 Wallet Address:</label>
                    <input
                        id="register-wallet"
                        name="wallet"
                        type="text"
                        value={wallet}
                        onChange={handleWalletChange}
                        required
                        autoComplete="off"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: walletValid || wallet === '' ? '1px solid #444' : '1.5px solid #e74c3c', fontSize: 16, background: '#23242a', color: 'var(--text)' }}
                    />
                    {!walletValid && wallet !== '' && (
                        <div style={{ color: '#e74c3c', fontSize: 13, marginTop: 4 }}>
                            Invalid TRC20 USDT wallet address.
                        </div>
                    )}
                </div>
                <div style={{ marginBottom: '1rem', width: '90%' }}>
                    <label htmlFor="register-referral" style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 500, textAlign: 'left' }}>Referral Code:</label>
                    <input
                        id="register-referral"
                        name="referredBy"
                        type="text"
                        value={referredBy}
                        onChange={e => { setReferredBy(e.target.value); setReferralValid(true); }}
                        onBlur={handleReferralBlur}
                        required
                        autoComplete="off"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: referralValid || referredBy === '' ? '1px solid #444' : '1.5px solid #e74c3c', fontSize: 16, background: '#23242a', color: 'var(--text)' }}
                    />
                    {!referralValid && referredBy !== '' && (
                        <div style={{ color: '#e74c3c', fontSize: 13, marginTop: 4 }}>Referral code does not exist.</div>
                    )}
                    {referralChecking && (
                        <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Checking referral code...</div>
                    )}
                </div>
                <button type="submit" style={{
                    width: '90%',
                    background: 'var(--secondary)',
                    color: 'var(--button-text)',
                    padding: '10px 0',
                    border: 'none',
                    borderRadius: 0,
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    marginTop: 0,
                    boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
                    transition: 'background 0.2s',
                    alignSelf: 'center',
                    marginBottom: 12
                }}>
                    Register
                </button>
                <div style={{ marginTop: 8, textAlign: 'center', width: '90%' }}>
                    <span style={{ color: 'var(--text)', fontSize: 15 }}>Already have an account?{' '}
                        <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>
                            Login
                        </span>
                    </span>
                </div>
            </form>
        </div>
    );
};

export default Register;