import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

// Slide-to-verify Captcha Modal
const CaptchaModal: React.FC<{ onSuccess: () => void; onClose: () => void }> = ({ onSuccess, onClose }) => {
    const [dragX, setDragX] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');
    const sliderWidth = 260; // px
    const pieceWidth = 40; // px
    const pieceY = 32; // vertical position of the missing piece
    const correctX = 120; // px, where the missing piece should be placed
    const tolerance = 8; // px, how close is considered correct

    // Mouse/touch event handlers for the slider (bottom circle)
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setDragging(true);
        setError('');
    };
    const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragging) return;
        let clientX = 0;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }
        const rect = (document.getElementById('captcha-slider-track') as HTMLElement)?.getBoundingClientRect();
        if (!rect) return;
        let x = clientX - rect.left - pieceWidth / 2;
        x = Math.max(0, Math.min(sliderWidth - pieceWidth, x));
        setDragX(x);
    };
    const handleDragEnd = () => {
        setDragging(false);
        // Check if the piece is close enough to the correct position
        if (Math.abs(dragX - correctX) < tolerance) {
            setVerified(true);
            setTimeout(() => {
                onSuccess();
            }, 500);
        } else {
            setError('Try again!');
            setDragX(0);
        }
    };

    // For accessibility: allow keyboard arrow keys
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') setDragX(x => Math.min(sliderWidth - pieceWidth, x + 5));
        if (e.key === 'ArrowLeft') setDragX(x => Math.max(0, x - 5));
    };

    // SVG mask for the missing piece
    const maskId = 'captcha-piece-mask';
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(30,40,60,0.82)', // Much darker overlay for strong darkening
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'background 0.2s',
            overflow: 'hidden', // Prevent scrollbars and page movement
        }}>
            <div style={{ background: '#fff', padding: 30, borderRadius: 12, boxShadow: '0 4px 24px rgba(30,60,114,0.15)', minWidth: 260, maxWidth: 320, width: 300, textAlign: 'center', position: 'relative' }}>
                <h3 style={{ marginBottom: 16 }}>Slide to complete the puzzle</h3>
                <div style={{ position: 'relative', width: sliderWidth, height: 80, margin: '0 auto 18px auto', userSelect: 'none' }}>
                    {/* Main SVG with missing piece */}
                    <svg width={sliderWidth} height={80} style={{ display: 'block', borderRadius: 8, background: '#f4f7fa', boxShadow: '0 2px 8px #e0e7ef' }}>
                        <defs>
                            <clipPath id="text-clip">
                                <text x="20" y="60" fontSize="48" fontWeight="bold" fontFamily="Arial, sans-serif">Tradespot</text>
                            </clipPath>
                            <mask id={maskId}>
                                <rect width="100%" height="100%" fill="white" />
                                {/* The missing piece shape */}
                                <rect x={correctX} y={pieceY} width={pieceWidth} height={32} rx={8} fill="black" />
                            </mask>
                        </defs>
                        {/* Text with missing piece masked out */}
                        <g clipPath="url(#text-clip)">
                            <text x="20" y="60" fontSize="48" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#1e3c72" mask={`url(#${maskId})`}>Tradespot</text>
                        </g>
                        {/* Outline for missing piece */}
                        <rect x={correctX} y={pieceY} width={pieceWidth} height={32} rx={8} fill="none" stroke="#2a5298" strokeDasharray="4 2" strokeWidth={2} />
                    </svg>
                    {/* Puzzle piece that follows the slider handle (not draggable) */}
                    <svg
                        width={pieceWidth}
                        height={32}
                        style={{ position: 'absolute', top: pieceY, left: dragX, zIndex: 2, pointerEvents: 'none', transition: dragging ? 'none' : 'left 0.2s', overflow: 'hidden' }}
                        aria-label="Puzzle piece"
                    >
                        <rect width={pieceWidth} height={32} rx={8} fill="#fff" stroke="#2a5298" strokeWidth={2} />
                        {/* Only the missing part of the Tradespot text is shown inside the piece */}
                        <g style={{ transform: `translateX(${-correctX + 2}px)` }}>
                            <text x="20" y="26" fontSize="48" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#1e3c72">Tradespot</text>
                        </g>
                    </svg>
                    {/* Slider track for visual feedback */}
                    <div id="captcha-slider-track" style={{ position: 'absolute', left: 0, bottom: -32, width: sliderWidth, height: 32, background: '#e0e7ef', borderRadius: 16, display: 'flex', alignItems: 'center', boxShadow: '0 1px 4px #e0e7ef', userSelect: 'none' }}>
                        {/* Draggable slider handle (circle) */}
                        <div
                            style={{ position: 'absolute', left: dragX, width: pieceWidth, height: 32, background: dragging ? '#b3c6e6' : '#fff', borderRadius: 16, border: '1px solid #2a5298', transition: 'left 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dragging ? 'grabbing' : 'grab', zIndex: 3 }}
                            tabIndex={0}
                            onMouseDown={handleDragStart}
                            onTouchStart={handleDragStart}
                            onMouseMove={dragging ? handleDrag : undefined}
                            onTouchMove={dragging ? handleDrag : undefined}
                            onMouseUp={handleDragEnd}
                            onTouchEnd={handleDragEnd}
                            onKeyDown={handleKeyDown}
                            aria-label="Slider handle"
                        >
                            {/* Circle visual */}
                            <svg width={pieceWidth} height={32}>
                                <ellipse cx={pieceWidth / 2} cy={16} rx={pieceWidth / 2 - 2} ry={14} fill="#fff" stroke="#2a5298" strokeWidth={2} />
                            </svg>
                        </div>
                        <span style={{ marginLeft: 12, color: '#888' }}>Slide to fit the missing part</span>
                    </div>
                </div>
                {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer' }} aria-label="Close">×</button>
                {verified && <div style={{ color: 'green', marginTop: 8 }}>Verified!</div>}
            </div>
        </div>
    );
};

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [emailValid, setEmailValid] = useState(true);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [pendingLogin, setPendingLogin] = useState<{ email: string; password: string } | null>(null);
    const [loginToken, setLoginToken] = useState<string | null>(null);
    const [twoFARequired, setTwoFARequired] = useState(false);
    const [twoFACode, setTwoFACode] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email: string) => {
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setEmailValid(validateEmail(value) || value === '');
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        if (!emailValid) {
            setError('Please enter a valid email address');
            return;
        }
        try {
            const res = await loginUser(email, password);
            setError('');
            setPendingLogin({ email, password });
            setLoginToken(res.token); // Save token for after captcha
            setShowCaptcha(true);
            // Remove token from localStorage until captcha is solved
            localStorage.removeItem('token');
        } catch (err: any) {
            if (err.message === '2FA required') {
                setTwoFARequired(true);
                setError('Two-factor authentication required. Please enter your 2FA code.');
            } else {
                setError(err.message || 'Invalid email or password');
            }
        }
    };
    const handle2FASubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password || !twoFACode) {
            setError('Please fill in all fields, including 2FA code');
            return;
        }
        try {
            const res = await loginUser(email, password, twoFACode);
            setError('');
            setPendingLogin({ email, password });
            setLoginToken(res.token); // Save token for after captcha
            setShowCaptcha(true);
            setTwoFARequired(false);
            setTwoFACode('');
            // Remove token from localStorage until captcha is solved
            localStorage.removeItem('token');
        } catch (err: any) {
            setError(err.message || 'Invalid 2FA code');
        }
    };
    const handleCaptchaSuccess = () => {
        setShowCaptcha(false);
        // After captcha, just proceed to dashboard (do not re-call loginUser)
        if (loginToken) {
            localStorage.setItem('token', loginToken);
        }
        navigate('/dashboard');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {showCaptcha && (
                <CaptchaModal onSuccess={handleCaptchaSuccess} onClose={() => setShowCaptcha(false)} />
            )}
            <form onSubmit={twoFARequired ? handle2FASubmit : handleSubmit} style={{
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
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 0
            }} autoComplete="off">
                <h2 style={{ fontSize: '1.1rem', marginBottom: 16, fontWeight: 700, color: '#25324B', letterSpacing: 1 }}>Login</h2>
                <div style={{ marginBottom: '1rem', width: '90%' }}>
                    <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500, textAlign: 'left' }}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        autoComplete="off"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: emailValid || email === '' ? '1px solid #ccc' : '1.5px solid #e74c3c', fontSize: 16, background: '#eaf1fb' }}
                    />
                    {!emailValid && email !== '' && (
                        <div style={{ color: '#e74c3c', fontSize: 13, marginTop: 4 }}>
                            Please enter a valid email address.
                        </div>
                    )}
                </div>
                <div style={{ marginBottom: '1.2rem', width: '90%' }}>
                    <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500, textAlign: 'left' }}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="off"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: '1px solid #ccc', fontSize: 16, background: '#eaf1fb' }}
                    />
                </div>
                {twoFARequired && (
                    <div style={{ marginBottom: '1.2rem', width: '90%' }}>
                        <label style={{ display: 'block', marginBottom: 6, color: '#333', fontWeight: 500, textAlign: 'left' }}>2FA Code:</label>
                        <input
                            type="text"
                            value={twoFACode}
                            onChange={e => setTwoFACode(e.target.value)}
                            required
                            autoComplete="off"
                            style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 0, border: '1px solid #ccc', fontSize: 16, background: '#eaf1fb' }}
                            maxLength={6}
                            pattern="[0-9]{6}"
                            inputMode="numeric"
                        />
                    </div>
                )}
                {error && <p style={{ color: '#d32f2f', background: '#ffeaea', padding: '0.5rem', borderRadius: 0, textAlign: 'center', marginBottom: 12, width: '90%' }}>{error}</p>}
                <button type="submit" style={{
                    width: '90%',
                    background: '#888',
                    color: '#fff',
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
                    Login
                </button>
                <div style={{ marginTop: 8, textAlign: 'center', width: '90%' }}>
                    <span style={{ color: '#333', fontSize: 15 }}>Don't have an account?{' '}
                        <span style={{ color: '#1e3c72', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/register')}>
                            Register
                        </span>
                    </span>
                </div>
            </form>
        </div>
    );
};

export default Login;