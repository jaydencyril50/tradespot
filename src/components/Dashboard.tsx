import React, { useEffect, useRef, useState } from 'react';
import './Dashboard.css';
import axios from 'axios';
import btcIcon from '../assets/coins/btc.png';
import ethIcon from '../assets/coins/eth.png';
import bnbIcon from '../assets/coins/bnb.png';
import xrpIcon from '../assets/coins/xrp.png';
import adaIcon from '../assets/coins/ada.png';
import solIcon from '../assets/coins/sol.png';
import dogeIcon from '../assets/coins/dodge.png'; // Corrected filename for Dogecoin icon
import dotIcon from '../assets/coins/dot.png';
import ltcIcon from '../assets/coins/ltc.png';
import LiveClock from './LiveClock';
import { transferFlex, getPortfolio } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaTelegramPlane, FaWhatsapp, FaBell } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import NoticeModal from './NoticeModal';
import { webauthnAuthenticate } from '../utils/webauthn';
import { useTheme } from '../ThemeContext';

// This is the chat/message icon SVG as a React component
const ChatIcon: React.FC<{ size?: number; color?: string }> = ({ size = 28, color = '#25324B' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="8" fill={color} />
      <path d="M6 7.5C6 6.67157 6.67157 6 7.5 6H16.5C17.3284 6 18 6.67157 18 7.5V13.5C18 14.3284 17.3284 15 16.5 15H8.91421C8.65279 15 8.40215 15.1054 8.20711 15.2929L6.85355 16.6464C6.53857 16.9614 6 16.7383 6 16.2929V7.5Z" fill="#fff"/>
      <circle cx="9.5" cy="11" r="1" fill={color} />
      <circle cx="12" cy="11" r="1" fill={color} />
      <circle cx="14.5" cy="11" r="1" fill={color} />
    </svg>
  );
};

// Minimal concentric arcs fingerprint icon (matches screenshot)
const MinimalFingerprintIcon: React.FC<{ size?: number; color?: string }> = ({ size = 36, color = '#222' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke={color} strokeWidth="2.2" strokeLinecap="round">
      <path d="M24 36c-6 0-11-5-11-11" />
      <path d="M24 41c-9 0-16-7-16-16" />
      <path d="M24 31c-3 0-6-3-6-6" />
      <path d="M24 26c-1 0-2-1-2-2" />
      <path d="M24 36c6 0 11-5 11-11" />
      <path d="M24 41c9 0 16-7 16-16" />
      <path d="M24 31c3 0 6-3 6-6" />
      <path d="M24 26c1 0 2-1 2-2" />
    </g>
  </svg>
);

const dashboardItems = [
	{ label: 'PROFILE', icon: '👤', route: '/profile' },
	{ label: 'TEAM', icon: '👨🏽‍🤝‍👨🏼', route: '/team' },
	{ label: 'MARKET', icon: '📈', route: '/market' }, // Enabled MARKET button
	{ label: 'SETTINGS', icon: '⚙️', route: '/settings' },
];

const mainButtons = [
	{ label: 'DEPOSIT', icon: '➕' },
	{ label: 'WITHDRAW', icon: '💸' },
	{ label: 'TRANSFER', icon: '🔄' },
	{ label: 'CONVERT', icon: '🔁' },
];

const COIN_LIST = [
	{ symbol: 'BTC', name: 'Bitcoin', icon: btcIcon, id: 'bitcoin' },
	{ symbol: 'ETH', name: 'Ethereum', icon: ethIcon, id: 'ethereum' },
	{ symbol: 'BNB', name: 'Binance Coin', icon: bnbIcon, id: 'binancecoin' },
	{ symbol: 'XRP', name: 'XRP', icon: xrpIcon, id: 'ripple' },
	{ symbol: 'ADA', name: 'Cardano', icon: adaIcon, id: 'cardano' },
	{ symbol: 'SOL', name: 'Solana', icon: solIcon, id: 'solana' },
	{ symbol: 'DOGE', name: 'Dogecoin', icon: dogeIcon, id: 'dogecoin' },
	{ symbol: 'DOT', name: 'Polkadot', icon: dotIcon, id: 'polkadot' },
	{ symbol: 'LTC', name: 'Litecoin', icon: ltcIcon, id: 'litecoin' },
];

// ConvertModal moved outside Dashboard to prevent remounting
interface ConvertModalProps {
  show: boolean;
  onClose: () => void;
  usdtBalance: number;
  flexBalance: number;
  loadingBalances: boolean;
  convertAmount: string;
  setConvertAmount: (a: string) => void;
  convertError: string;
  convertSuccess: string;
  handleConvert: () => void;
  CONVERT_RATE: number;
  modalCardStyle?: React.CSSProperties;
  theme: 'light' | 'dark'; // Add theme prop
}

const ConvertModal: React.FC<ConvertModalProps> = ({
  show,
  onClose,
  usdtBalance,
  flexBalance,
  loadingBalances,
  convertAmount,
  setConvertAmount,
  convertError,
  convertSuccess,
  handleConvert,
  CONVERT_RATE,
  modalCardStyle,
  theme, // Receive theme prop
}) => {
  // Only FLEX to USDT allowed
  const [inputError, setInputError] = React.useState('');
  React.useEffect(() => {
    const amount = parseFloat(convertAmount);
    if (isNaN(amount) || amount <= 0) {
      setInputError('');
      return;
    }
    if (amount > flexBalance) {
      setInputError('Insufficient FLEX balance');
    } else {
      setInputError('');
    }
  }, [convertAmount, flexBalance]);
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,40,60,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        ...(modalCardStyle || {}),
        borderRadius: 0,
        padding: '12px 16px',
        minWidth: 260,
        maxWidth: 380,
        width: '100%',
        fontFamily: 'inherit',
        position: 'relative',
        textAlign: 'center',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: 12,
          right: 16,
          background: 'none',
          border: 'none',
          fontSize: 22,
          color: '#888',
          cursor: 'pointer'
        }}>&times;</button>
        <h2 style={{
          fontSize: '1.1rem',
          marginBottom: 4,
          fontWeight: 700,
          color: theme === 'dark' ? '#fff' : '#25324B',
          letterSpacing: 1,
          fontFamily: 'serif'
        }}>Convert Balance</h2>
        <div style={{ fontSize: '0.95rem', color: theme === 'dark' ? '#fff' : '#555', marginBottom: 8 }}>
          Instantly convert FLEX to USDT.
        </div>
        <div style={{ marginBottom: 12, fontWeight: 600, color: theme === 'dark' ? '#fff' : '#1e3c72' }}>
          USDT Balance: <span style={{ color: '#10c98f' }}>{loadingBalances ? 'Loading...' : usdtBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div style={{ marginBottom: 12, fontWeight: 600, color: theme === 'dark' ? '#fff' : '#1e3c72' }}>
          FLEX Balance: <span style={{ color: '#2a5298' }}>{loadingBalances ? 'Loading...' : flexBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500, color: theme === 'dark' ? '#fff' : '#25324B', marginRight: 10 }}>Convert:</label>
          <select value={'FLEX_TO_USDT'} onChange={() => {}} style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 16
          }} disabled>
            <option value="FLEX_TO_USDT">FLEX → USDT</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500, color: theme === 'dark' ? '#fff' : '#25324B', marginRight: 10 }}>Amount:</label>
          <input
            type="number"
            min="0"
            step="any"
            value={convertAmount}
            onChange={e => {
              setConvertAmount(e.target.value);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 16,
              width: 120,
              color: theme === 'dark' ? '#fff' : undefined,
              background: theme === 'dark' ? '#232526' : undefined
            }}
          />
        </div>
        {/* Show input error for insufficient balance */}
        {inputError && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{inputError}</div>}
        <div style={{ marginBottom: 12, color: '#888', fontSize: 15 }}>
          {convertAmount && !isNaN(Number(convertAmount)) && Number(convertAmount) > 0 ? (
            `1 FLEX = ${CONVERT_RATE} USDT`
          ) : (
            `1 FLEX = ${CONVERT_RATE} USDT`
          )}
        </div>
        {/* Only show convertError if not inputError */}
        {!inputError && convertError && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{convertError}</div>}
        {convertSuccess && <div style={{ color: '#10c98f', marginBottom: 10 }}>{convertSuccess}</div>}
        <button
          onClick={handleConvert}
          style={{
            border: 'none',
            borderRadius: 6,
            padding: '6px 28px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: 4,
            background: '#888',
            color: '#fff',
            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
            transition: 'background 0.2s',
            alignSelf: 'center',
            width: '100%'
          }}
          disabled={!!inputError}
        >
          Convert
        </button>
      </div>
    </div>
  );
};

const API = process.env.REACT_APP_API_BASE_URL;

// TypeScript: declare window.trustedTypes for Trusted Types support
declare global {
  interface Window {
    trustedTypes?: {
      createPolicy: (name: string, rules: { createHTML: (input: string) => string }) => { createHTML: (input: string) => string };
    };
  }
}
// Trusted Types policy for innerHTML assignments
const trustedTypesPolicy = window.trustedTypes?.createPolicy('default', {
  createHTML: (input: string) => input,
});

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme ? useTheme() : { theme: 'light' };
  const themeValue: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const [marketData, setMarketData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<number>(0);
  const [flexBalance, setFlexBalance] = useState<number>(0);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertAmount, setConvertAmount] = useState('');
  const [convertError, setConvertError] = useState('');
  const [convertSuccess, setConvertSuccess] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [transferTwoFA, setTransferTwoFA] = useState('');
  const [fundsLocked, setFundsLocked] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const CONVERT_RATE = 500; // 1 SPOT = 500 USDT

	// --- Google OAuth: Store token from URL if present ---
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');
		if (token) {
			localStorage.setItem('token', token);
			// Remove token from URL for cleanliness
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, []);

	// Check fundsLocked on mount and when modal closes
	React.useEffect(() => {
		const fetchFundsLocked = async () => {
			try {
				const data = await getPortfolio();
				setFundsLocked(!!data.fundsLocked);
			} catch {
				setFundsLocked(false);
			}
		};
		fetchFundsLocked();
		window.addEventListener('storage', fetchFundsLocked);
		return () => window.removeEventListener('storage', fetchFundsLocked);
	}, []);

	useEffect(() => {
		// Remove previous widget if any
		if (chartRef.current) {
			chartRef.current.innerHTML = trustedTypesPolicy ? trustedTypesPolicy.createHTML('') : '';
		}
		// Only inject TradingView if the chart container exists in the DOM
		const chartContainer = document.getElementById('tradingview_advanced_chart');
		if (!chartContainer) return;
		const script = document.createElement('script');
		script.src = 'https://s3.tradingview.com/tv.js';
		script.async = true;
		script.onload = () => {
			if ((window as any).TradingView && chartContainer) {
				new (window as any).TradingView.widget({
					container_id: 'tradingview_advanced_chart',
					width: '100%',
					height: 500,
					symbol: 'BINANCE:BTCUSDT',
					interval: 'D',
					timezone: 'Etc/UTC',
					theme: 'light',
					style: '1',
					locale: 'en',
					toolbar_bg: '#f1f3f6',
					enable_publishing: false,
					allow_symbol_change: true,
					hide_top_toolbar: false,
					withdateranges: true,
					details: true,
					hotlist: true,
					calendar: true,
					studies: [],
				});
			}
		};
		document.body.appendChild(script);
		return () => {
			// Cleanup script and widget
			document.body.removeChild(script);
			if (chartRef.current) chartRef.current.innerHTML = trustedTypesPolicy ? trustedTypesPolicy.createHTML('') : '';
		};
	}, []);

	React.useEffect(() => {
		let interval: NodeJS.Timeout;
		const fetchMarket = async () => {
			try {
				const ids = COIN_LIST.map(c => c.id).join(',');
				const res = await axios.get(
					`https://api.coingecko.com/api/v3/coins/markets`,
					{
						params: {
							vs_currency: 'usd',
							ids,
							order: 'market_cap_desc',
							per_page: 10,
							page: 1,
							sparkline: false,
							price_change_percentage: '24h',
						},
					}
				);
				// Debug: log the response
				// console.log(res.data);
				setMarketData(res.data);
				setError(null);
				setLoading(false); // Only set loading to false on successful fetch
			} catch (e) {
				setMarketData([]);
				setError('Failed to fetch market data.');
			}
		};
		fetchMarket();
		interval = setInterval(fetchMarket, 10000); // Use 10s to avoid rate limit
		return () => clearInterval(interval);
	}, []);

	// Fetch user balances from backend
	useEffect(() => {
		// Remove previous widget if any
		if (chartRef.current) {
			chartRef.current.innerHTML = trustedTypesPolicy ? trustedTypesPolicy.createHTML('') : '';
		}
		// Only inject TradingView if the chart container exists in the DOM
		const chartContainer = document.getElementById('tradingview_advanced_chart');
		if (!chartContainer) return;
		const script = document.createElement('script');
		script.src = 'https://s3.tradingview.com/tv.js';
		script.async = true;
		script.onload = () => {
			if ((window as any).TradingView && chartContainer) {
				new (window as any).TradingView.widget({
					container_id: 'tradingview_advanced_chart',
					width: '100%',
					height: 500,
					symbol: 'BINANCE:BTCUSDT',
					interval: 'D',
					timezone: 'Etc/UTC',
					theme: 'light',
					style: '1',
					locale: 'en',
					toolbar_bg: '#f1f3f6',
					enable_publishing: false,
					allow_symbol_change: true,
					hide_top_toolbar: false,
					withdateranges: true,
					details: true,
					hotlist: true,
					calendar: true,
					studies: [],
				});
			}
		};
		document.body.appendChild(script);
		// Fetch user balances from backend
		const fetchBalances = async () => {
			setLoadingBalances(true);
			try {
				const token = localStorage.getItem('token');
				if (!token) throw new Error('Not authenticated');
				const res = await axios.get(`${API}/api/portfolio`, { headers: { Authorization: `Bearer ${token}` } });
				setUsdtBalance(res.data.usdtBalance || 0);
				setFlexBalance(res.data.flexBalance || 0); // Use flexBalance from backend
			} catch (e) {
				setUsdtBalance(0);
				setFlexBalance(0);
			} finally {
				setLoadingBalances(false);
			}
		};
		fetchBalances();
		return () => {
			// Cleanup script and widget
			document.body.removeChild(script);
			if (chartRef.current) chartRef.current.innerHTML = trustedTypesPolicy ? trustedTypesPolicy.createHTML('') : '';
		};
	}, []);

	// Fetch user balances from backend (shared utility)
	const fetchBalances = async () => {
		setLoadingBalances(true);
		try {
			const token = localStorage.getItem('token');
			if (!token) throw new Error('Not authenticated');
			const res = await axios.get(`${API}/api/portfolio`, { headers: { Authorization: `Bearer ${token}` } });
			setUsdtBalance(res.data.usdtBalance || 0);
			setFlexBalance(res.data.flexBalance || 0);
		} catch (e) {
			setUsdtBalance(0);
			setFlexBalance(0);
		} finally {
			setLoadingBalances(false);
		}
	};

	// Helper to check if WebAuthn is enabled for convert
	const isWebauthnConvertEnabled = async () => {
	  try {
	    const token = localStorage.getItem('token');
	    if (!token) return false;
	    const res = await axios.get(`${API}/api/webauthn-settings/settings`, {
	      headers: { Authorization: `Bearer ${token}` },
	      withCredentials: true
	    });
	    return !!(res.data.webauthnSettings && res.data.webauthnSettings.convert);
	  } catch {
	    return false;
	  }
	};

	// Handle conversion
	const handleConvert = async () => {
	  if (!convertAmount || isNaN(Number(convertAmount)) || Number(convertAmount) <= 0) return;
	  if (Number(convertAmount) > flexBalance) {
	    setConvertError('Insufficient FLEX balance');
	    return;
	  }
	  setConvertError('');
	  setConvertSuccess('');
	  try {
	    const token = localStorage.getItem('token');
	    if (!token) throw new Error('Not authenticated');
	    let assertionResp = undefined;
	    // Check if WebAuthn is enabled for convert
	    const webauthnEnabled = await isWebauthnConvertEnabled();
	    if (webauthnEnabled) {
	      // Get user email
	      let email = null;
	      try {
	        const me = await axios.get(`${API}/api/auth/user/me`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
	        email = me.data.email;
	      } catch {}
	      if (!email) throw new Error('User email not found for WebAuthn');
	      assertionResp = await webauthnAuthenticate(email);
	    }
	    // Always send assertionResp if present
	    const res = await axios.post(`${API}/api/convert`, {
	      direction: 'FLEX_TO_USDT',
	      amount: Number(convertAmount),
	      ...(assertionResp ? { assertionResp } : {})
	    }, { headers: { Authorization: `Bearer ${token}` } });
	    setConvertSuccess('Converted successfully!');
	    fetchBalances();
	  } catch (err: any) {
	    setConvertError(err?.response?.data?.error || err.message || 'Conversion failed');
	  }
	};

	const openConvertModal = async () => {
		setShowConvertModal(true);
		setLoadingBalances(true);
		setConvertError('');
		setConvertSuccess('');
		setConvertAmount('');
		try {
			const data = await import('../services/api').then(m => m.getPortfolio());
			setUsdtBalance(data.usdtBalance || 0);
			setFlexBalance(data.flexBalance || 0);
		} catch (e) {
			setUsdtBalance(0);
			setFlexBalance(0);
		} finally {
			setLoadingBalances(false);
		}
	};

	const openTransferModal = async () => {
		setShowTransferModal(true);
		setLoadingBalances(true);
		setTransferError('');
		setTransferSuccess('');
		setTransferEmail('');
		setTransferAmount('');
		setTransferTwoFA(''); // <-- Reset 2FA code
		try {
			const data = await import('../services/api').then(m => m.getPortfolio());
			setUsdtBalance(data.usdtBalance || 0);
			setFlexBalance(data.flexBalance || 0);
		} catch (e) {
			setUsdtBalance(0);
			setFlexBalance(0);
		} finally {
			setLoadingBalances(false);
		}
	};

	// Helper to check if WebAuthn is enabled for transfer
	const isWebauthnTransferEnabled = async () => {
	  try {
	    const token = localStorage.getItem('token');
	    if (!token) return false;
	    const res = await axios.get(`${API}/api/webauthn-settings/settings`, {
	      headers: { Authorization: `Bearer ${token}` },
	      withCredentials: true
	    });
	    return !!(res.data.webauthnSettings && res.data.webauthnSettings.transfer);
	  } catch {
	    return false;
	  }
	};

	const [isWebauthnTransferEnabledState, setIsWebauthnTransferEnabledState] = useState<boolean>(false);

	// On mount, check if WebAuthn is enabled for transfer and set state
	useEffect(() => {
		(async () => {
			const enabled = await isWebauthnTransferEnabled();
			setIsWebauthnTransferEnabledState(enabled);
		})();
	}, []);

	// Handle transfer
	const handleTransfer = async () => {
		setTransferError('');
		setTransferSuccess('');
		if (!transferEmail || !transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0 || (!transferTwoFA)) {
			setTransferError('Enter a valid email, amount, and authentication.');
			return;
		}
		if (recipientEmailValid === false) {
			setTransferError('Recipient email does not exist.');
			return;
		}
		try {
			const token = localStorage.getItem('token');
			if (!token) throw new Error('Not authenticated');
			let assertionResp = undefined;
			// Check if WebAuthn is enabled for transfer
			const webauthnEnabled = await isWebauthnTransferEnabled();
			if (webauthnEnabled) {
				// Get user email
				let email = null;
				try {
					const me = await axios.get(`${API}/api/auth/user/me`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
					email = me.data.email;
				} catch {}
				if (!email) throw new Error('User email not found for WebAuthn');
				assertionResp = await webauthnAuthenticate(email);
			}
			// Always send assertionResp if present
			const res = await axios.post(`${API}/api/transfer`, {
				recipientEmail: transferEmail,
				amount: Number(transferAmount),
				twoFAToken: transferTwoFA,
				...(assertionResp ? { assertionResp } : {})
			}, { headers: { Authorization: `Bearer ${token}` } });
			setTransferSuccess(res.data?.message || 'Transfer successful!');
			setTransferEmail('');
			setTransferAmount('');
			setTransferTwoFA('');
			// Optionally refresh balances
			const data = await import('../services/api').then(m => m.getPortfolio());
			setFlexBalance(data.flexBalance || 0);
		} catch (e: any) {
			setTransferError(e.response?.data?.error || e.message || 'Transfer failed');
		}
	};

	// Poll notifications every 10s
	useEffect(() => {
		let interval: NodeJS.Timeout;
		const fetchNotifications = async () => {
			try {
				const token = localStorage.getItem('token');
				if (!token) return;
				const res = await fetch(`${API}/api/notifications`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = await res.json();
				setNotifications(data.notifications || []);
				setUnreadCount((data.notifications || []).filter((n: any) => !n.read).length);
			} catch {}
		};
		fetchNotifications();
		interval = setInterval(fetchNotifications, 10000);
		return () => clearInterval(interval);
	}, []);

	const [recipientEmailValid, setRecipientEmailValid] = useState<null | boolean>(null);
	const [checkingEmail, setCheckingEmail] = useState(false);
	const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);

	// Live check for recipient email existence
	useEffect(() => {
		setRecipientEmailValid(null);
		if (!transferEmail || !transferEmail.includes('@')) return;
		if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);
		setCheckingEmail(true);
		emailCheckTimeout.current = setTimeout(async () => {
			try {
				const token = localStorage.getItem('token');
				const resp = await fetch(`${API}/api/check-email-exists`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						...(token ? { 'Authorization': `Bearer ${token}` } : {})
					},
					body: JSON.stringify({ email: transferEmail })
				});
				const data = await resp.json();
				setRecipientEmailValid(!!data.exists);
			} catch {
				setRecipientEmailValid(null);
			} finally {
				setCheckingEmail(false);
			}
		}, 500); // debounce 500ms
		// eslint-disable-next-line
	}, [transferEmail]);

	// Green for dark mode, default for light
	const mainButtonStyle = theme === 'dark' ? {
		background: '#232526', // dark neutral background
		color: '#fff',
		border: 'none',
		boxShadow: '0 1px 4px rgba(241, 241, 241, 0.10)',
		transition: 'background 0.2s',
		filter: 'none',
	} : {};
	// Modal background for dark mode
	const modalCardStyle = theme === 'dark'
		? {
				background: '#232526',
				color: '#eaf1fb',
				border: '1px solid #313335',
				boxShadow: '0 12px 40px 0 #18191a, 0 4px 16px 0 #232526',
			}
		: {
				background: '#fff',
				color: '#25324B',
				border: '1px solid #e3e6ef',
				boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
			};

	return (
		<div className='dashboard-gradient-bg dashboard-circles-container'>
			<NoticeModal />
			{/* Top bar */}
			<div style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '18px 12px 18px 12px',
				gap: 180,
			}}>
				<span style={{
					fontWeight: 700,
					fontSize: 24,
					color: theme === 'dark' ? '#fff' : '#25324B', // White in dark mode, brand color in light
					letterSpacing: 0.5,
					fontFamily: 'inherit',
				}}>
					TRADESPOT
				</span>
				<button
					style={{
						background: '#25324B',
						border: 'none',
						borderRadius: 4,
						width: 32,
						height: 32,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						padding: 0,
						position: 'relative'
					}}
					aria-label="Notifications"
					onClick={() => {
						setUnreadCount(0);
						navigate('/notifications');
					}}
				>
					<FaBell size={20} color="#fff" />
					{unreadCount > 0 && (
						<span style={{
							position: 'absolute',
							top: 2,
							right: 2,
							background: '#e74c3c',
							color: '#fff',
							borderRadius: '50%',
							fontSize: 12,
							fontWeight: 700,
							width: 18,
							height: 18,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '0 1px 4px #e74c3c'
						}}>
							{unreadCount}
						</span>
					)}
				</button>
			</div>
			<div style={{ height: 24 }} />
			{showConvertModal && (
        <ConvertModal
          show={showConvertModal}
          onClose={() => setShowConvertModal(false)}
          usdtBalance={usdtBalance}
          flexBalance={flexBalance}
          loadingBalances={loadingBalances}
          convertAmount={convertAmount}
          setConvertAmount={setConvertAmount}
          convertError={convertError}
          convertSuccess={convertSuccess}
          handleConvert={handleConvert}
          CONVERT_RATE={1} // Set your conversion rate here
          modalCardStyle={modalCardStyle}
          theme={themeValue} // Pass theme as 'light' | 'dark'
        />
      )}
			{showTransferModal && (
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
          justifyContent: 'center'
        }}>
          <div style={{
            ...modalCardStyle,
            borderRadius: 0,
            padding: '12px 16px',
            minWidth: 260,
            maxWidth: 380,
            width: '100%',
            fontFamily: 'inherit',
            position: 'relative',
            textAlign: 'center'
          }}>
            <button onClick={() => setShowTransferModal(false)} style={{
              position: 'absolute',
              top: 12,
              right: 16,
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#888',
              cursor: 'pointer'
            }}>&times;</button>
            <h2 style={{
              fontSize: '1.1rem',
              marginBottom: 4,
              fontWeight: 700,
              color: theme === 'dark' ? '#fff' : '#25324B',
              letterSpacing: 1,
              fontFamily: 'serif'
            }}>Transfer FLEX</h2>
            <div style={{ fontSize: '0.95rem', color: theme === 'dark' ? '#fff' : '#555', marginBottom: 8 }}>
              Send FLEX to another user instantly.
            </div>
            <div style={{ marginBottom: 12, fontWeight: 600, color: theme === 'dark' ? '#fff' : '#1e3c72' }}>
              Your FLEX Balance: <span style={{ color: '#2a5298' }}>{flexBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500, color: theme === 'dark' ? '#fff' : '#25324B', marginRight: 10 }}>Recipient Email:</label>
              <input
                type="email"
                value={transferEmail}
                onChange={e => setTransferEmail(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontSize: 16,
                  width: 220,
                  color: theme === 'dark' ? '#fff' : undefined,
                  background: theme === 'dark' ? '#232526' : undefined
                }}
              />
              {transferEmail && (
                <div style={{ fontSize: 13, marginTop: 2, minHeight: 18, color: theme === 'dark' ? '#fff' : undefined }}>
                  {checkingEmail ? (
                    <span style={{ color: '#888' }}>Checking...</span>
                  ) : recipientEmailValid === true ? (
                    <span style={{ color: '#10c98f' }}>Verified✓</span>
                  ) : recipientEmailValid === false ? (
                    <span style={{ color: '#e74c3c' }}>Invalid✕</span>
                  ) : null}
                </div>
              )}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500, color: theme === 'dark' ? '#fff' : '#25324B', marginRight: 10 }}>Amount:</label>
              <input
                type="number"
                min="0"
                step="any"
                value={transferAmount}
                onChange={e => {
                  setTransferAmount(e.target.value);
                  setTransferError('');
                  setTransferSuccess('');
                  if (e.target.value && !isNaN(Number(e.target.value)) && Number(e.target.value) > flexBalance) {
                    setTransferError('Insufficient funds.');
                  }
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontSize: 16,
                  width: 120,
                  color: theme === 'dark' ? '#fff' : undefined,
                  background: theme === 'dark' ? '#232526' : undefined
                }}
              />
              {transferAmount && Number(transferAmount) > flexBalance && (
                <div style={{ color: '#e74c3c', fontWeight: 600, marginTop: 4, fontSize: 14 }}>Insufficient funds.</div>
              )}
            </div>
      {/* Set biometricEnabled to false if not implemented */}
      {!isWebauthnTransferEnabledState && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500, color: theme === 'dark' ? '#fff' : '#25324B', marginRight: 10 }}>2FA Code:</label>
          <input
            type="text"
            value={transferTwoFA}
            onChange={e => setTransferTwoFA(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 16,
              width: 120,
              color: theme === 'dark' ? '#fff' : undefined,
              background: theme === 'dark' ? '#232526' : undefined
            }}
            maxLength={6}
            pattern="[0-9]{6}"
            inputMode="numeric"
          />
        </div>
      )}
      {isWebauthnTransferEnabledState && (
        <div style={{ color: theme === 'dark' ? '#fff' : '#888', fontSize: 14, marginBottom: 12 }}>
          2FA not required when WebAuthn is enabled.
        </div>
      )}
      {transferError && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{transferError}</div>}
      {transferSuccess && <div style={{ color: '#10c98f', marginBottom: 10 }}>{transferSuccess}</div>}
     {(
        <button
          onClick={handleTransfer}
          style={{
            border: 'none',
            borderRadius: 6,
            padding: '6px 28px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: 4,
            background: '#888',
            color: '#fff',
            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
            transition: 'background 0.2s',
            alignSelf: 'center',
            width: '100%'
          }}
        >
          Send
        </button>
      )}
    </div>
  </div>
)}
			<div className='dashboard-card' style={{ minHeight: 0, height: 'auto', padding: '1px 0 1px 0' }}>
				<div className='dashboard-action-row'>
					{mainButtons.slice(0, 4).map((item) => (
						<button
							className='dashboard-circle dashboard-action-circle'
							key={item.label}
							tabIndex={0}
							style={mainButtonStyle}
							onClick={
								item.label === 'DEPOSIT' ? () => !fundsLocked && navigate('/deposit') :
								item.label === 'WITHDRAW' ? () => !fundsLocked && navigate('/withdraw') :
								item.label === 'CONVERT' ? openConvertModal :
								item.label === 'TRANSFER' ? () => !fundsLocked && openTransferModal() :
								undefined
							}
						>
							<span className='dashboard-circle-icon' style={theme === 'dark' ? { color: '#fff' } : {}}>{item.icon}</span>
							<span className='dashboard-circle-label' style={theme === 'dark' ? { color: '#10c98f', fontWeight: 700 } : {}}>{item.label}</span>
						</button>
					))}
				</div>
			</div>
			<div style={{
				width: '100%',
			 maxWidth: 900,
			 margin: '0 auto',
			 display: 'flex',
			 flexDirection: 'column',
			 alignItems: 'center',
			}}>
				<div className='dashboard-market-prochart market-table-container' style={{ width: '100%', marginBottom: 0 }}>
					<table className='market-table' style={{ margin: '0 auto', textAlign: 'center', width: '100%' }}>
						<thead>
							<tr>
								<th style={{ textAlign: 'center' }}>Currency</th>
								<th style={{ textAlign: 'center' }}>Latest Price($)</th>
								<th style={{ textAlign: 'center' }}>24h Rise & Down</th>
							</tr>
						</thead>
						<tbody>
							{error ? (
								<tr><td colSpan={3} style={{color: 'red'}}>{error}</td></tr>
							) : loading ? (
								<tr><td colSpan={3}>Loading...</td></tr>
							) : null}
							{COIN_LIST.map((coin) => {
								const live = marketData.find((c) => c.id === coin.id);
								return (
									<tr key={coin.symbol}>
										<td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
											<img src={coin.icon} alt={coin.symbol} style={{ width: 32, height: 32, borderRadius: '50%' }} />
											<span style={{ fontWeight: 700, marginLeft: 8 }}>{coin.symbol}</span>
											<span style={{ color: '#b0b8c9', marginLeft: 2 }}>/USDT</span>
										</td>
										<td style={{ fontWeight: 700, color: live && live.price_change_percentage_24h > 0 ? '#10c98f' : '#e74c3c' }}>
											{live && typeof live.current_price !== 'undefined' ? live.current_price : '-'}
										</td>
										<td>
											{live && typeof live.price_change_percentage_24h !== 'undefined' ? (
												<span style={{
													display: 'inline-block',
													minWidth: 90,
													padding: '8px 0',
													borderRadius: 10,
													background: live.price_change_percentage_24h > 0 ? '#10c98f' : '#e74c3c',
													color: '#fff',
													fontWeight: 600,
													textAlign: 'center',
												}}>
													{live.price_change_percentage_24h > 0 ? `+ ${live.price_change_percentage_24h.toFixed(2)}%` : `${live.price_change_percentage_24h?.toFixed(2)}%`}
												</span>
											) : '-'}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				<div style={{
					background: theme === 'dark' ? '#232526' : '#fff',
					boxShadow: '0 2px 16px rgba(30,60,114,0.10)',
					borderRadius: 0,
					padding: '18px 0',
					margin: '24px 0 0 0',
					width: '95%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}>
					<span style={{ fontWeight: 600, fontSize: 18, color: theme === 'dark' ? '#fff' : '#25324B', letterSpacing: 0.5 }}>
						T.S Time: <LiveClock utc />
					</span>
				</div>
				{/* Social/contact buttons row */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						gap: 40,
						margin: '35px 0 -70px 0' // Reduced top margin for less gap below icons
					}}
				>
					{/* Telegram */}
					<button
						style={{
							width: 48,
							height: 48,
							background: theme === 'dark' ? '#232526' : '#fff',
							border: 'none',
							borderRadius: 12,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							margin: 0,
							padding: 0,
							boxShadow: '0 2px 8px rgba(30,60,114,0.10)'
						}}
						title="Telegram"
						onClick={() => window.open('https://t.me/tradespotglobal', '_blank')}
					>
						<FaTelegramPlane size={28} color={theme === 'dark' ? '#fff' : '#229ED9'} />
					</button>
					{/* Email (Gmail) */}
					<button
						style={{
							width: 48,
							height: 48,
							background: theme === 'dark' ? '#232526' : '#fff',
							border: 'none',
							borderRadius: 12,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							margin: 0,
							padding: 0,
							boxShadow: '0 2px 8px rgba(30,60,114,0.10)'
						}}
						title="Email"
						onClick={() => window.open('mailto:support@tradespot.online')}
					>
						<MdEmail size={28} color={theme === 'dark' ? '#fff' : '#EA4335'} />
					</button>
					{/* WhatsApp */}
					<button
						style={{
							width: 48,
							height: 48,
							background: theme === 'dark' ? '#232526' : '#fff',
							border: 'none',
							borderRadius: 12,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							margin: 0,
							padding: 0,
							boxShadow: '0 2px 8px rgba(30,60,114,0.10)'
						}}
						title="WhatsApp"
						onClick={() => window.open('', '_blank')}
					>
						<FaWhatsapp size={28} color={theme === 'dark' ? '#fff' : '#25D366'} />
					</button>
					{/* Chat Icon */}
					<button
				style={{
					width: 48,
					height: 48,
					background: theme === 'dark' ? '#232526' : '#fff',
					border: 'none',
					borderRadius: 12,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer',
					margin: 0,
					padding: 0,
					boxShadow: '0 2px 8px rgba(30,60,114,0.10)'
				}}
				title="Chat"
				onClick={() => navigate('/chat')}
			>
				<ChatIcon size={28} color={theme === 'dark' ? '#fff' : '#25324B'} />
			</button>
				</div>
				{/* End social/contact buttons row */}
			</div>
			<div className='dashboard-main-buttons'>
				{mainButtons.slice(4).map((item) => (
					<button
						className='dashboard-circle'
						key={item.label}
						tabIndex={0}
					>
						<span className='dashboard-circle-icon'>{item.icon}</span>
						<span className='dashboard-circle-label'>{item.label}</span>
					</button>
				))}
			</div>
			<div className='dashboard-circles-grid'>
				{dashboardItems.map((item) => (
					<button
						className='dashboard-circle'
						key={item.label}
						tabIndex={0}
						onClick={() => {
							if (item.route) navigate(item.route);
						}}
					>
						<span className='dashboard-circle-icon'>{item.icon}</span>
						<span className='dashboard-circle-label'>{item.label}</span>
					</button>
				))}
			</div>
		</div>
	);
};

export default Dashboard;
