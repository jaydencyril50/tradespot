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
import { transferSpot, getPortfolio, isBiometricEnabled } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaTelegramPlane, FaWhatsapp, FaBell } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import NoticeModal from './NoticeModal';
import { startAuthentication } from '@simplewebauthn/browser';

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
  spotBalance: number;
  loadingBalances: boolean;
  convertDirection: 'USDT_TO_SPOT' | 'SPOT_TO_USDT';
  setConvertDirection: (d: 'USDT_TO_SPOT' | 'SPOT_TO_USDT') => void;
  convertAmount: string;
  setConvertAmount: (a: string) => void;
  convertError: string;
  convertSuccess: string;
  handleConvert: () => void;
  CONVERT_RATE: number;
}

const ConvertModal: React.FC<ConvertModalProps> = ({
  show,
  onClose,
  usdtBalance,
  spotBalance,
  loadingBalances,
  convertDirection,
  setConvertDirection,
  convertAmount,
  setConvertAmount,
  convertError,
  convertSuccess,
  handleConvert,
  CONVERT_RATE,
}) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,40,60,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 0,
        boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
        border: '1px solid #e3e6ef',
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
          color: '#25324B',
          letterSpacing: 1,
          fontFamily: 'serif'
        }}>Convert Balance</h2>
        <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 8 }}>
          Instantly convert between USDT and SPOT.
        </div>
        <div style={{ marginBottom: 12, fontWeight: 600, color: '#1e3c72' }}>
          USDT Balance: <span style={{ color: '#10c98f' }}>{loadingBalances ? 'Loading...' : usdtBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div style={{ marginBottom: 12, fontWeight: 600, color: '#1e3c72' }}>
          SPOT Balance: <span style={{ color: '#2a5298' }}>{loadingBalances ? 'Loading...' : spotBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500, color: '#25324B', marginRight: 10 }}>Convert:</label>
          <select value={convertDirection} onChange={e => { setConvertDirection(e.target.value as any); }} style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 16
          }}>
            <option value="USDT_TO_SPOT">USDT → SPOT</option>
            <option value="SPOT_TO_USDT">SPOT → USDT</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500, color: '#25324B', marginRight: 10 }}>Amount:</label>
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
              width: 120
            }}
          />
        </div>
        <div style={{ marginBottom: 12, color: '#888', fontSize: 15 }}>
          {convertAmount && !isNaN(Number(convertAmount)) && Number(convertAmount) > 0 ? (
            convertDirection === 'USDT_TO_SPOT'
              ? `${convertAmount} USDT = ${(Number(convertAmount) / CONVERT_RATE).toLocaleString(undefined, { minimumFractionDigits: 6 })} SPOT`
              : `${convertAmount} SPOT = ${(Number(convertAmount) * CONVERT_RATE).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT`
          ) : (
            `1 SPOT = ${CONVERT_RATE} USDT`
          )}
        </div>
        {convertError && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{convertError}</div>}
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
	const [marketData, setMarketData] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [usdtBalance, setUsdtBalance] = useState<number>(0);
	const [spotBalance, setSpotBalance] = useState<number>(0);
	const [loadingBalances, setLoadingBalances] = useState(true);
	const [showConvertModal, setShowConvertModal] = useState(false);
	const [convertDirection, setConvertDirection] = useState<'USDT_TO_SPOT' | 'SPOT_TO_USDT'>('USDT_TO_SPOT');
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
	const [biometricEnabled, setBiometricEnabled] = useState(false);
	const [webauthnToken, setWebauthnToken] = useState<string | null>(null);
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
				const data = await import('../services/api').then(m => m.getPortfolio());
				setUsdtBalance(data.usdtBalance || 0);
				setSpotBalance(data.spotBalance || 0);
			} catch (e) {
				setUsdtBalance(0);
				setSpotBalance(0);
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

	// Handle conversion
	const handleConvert = async () => {
		setConvertError('');
		setConvertSuccess('');
		const amt = parseFloat(convertAmount);
		if (!amt || amt <= 0) { setConvertError('Enter a valid amount.'); return; }
		try {
			const data = await import('../services/api').then(m => m.convertBalance(convertDirection, amt));
			setUsdtBalance(data.usdtBalance);
			setSpotBalance(data.spotBalance);
			setConvertSuccess(data.message || 'Conversion successful.');
		} catch (e: any) {
			setConvertError(e?.response?.data?.error || e.message || 'Conversion failed.');
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
			setSpotBalance(data.spotBalance || 0);
		} catch (e) {
			setUsdtBalance(0);
			setSpotBalance(0);
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
			setSpotBalance(data.spotBalance || 0);
		} catch (e) {
			setUsdtBalance(0);
			setSpotBalance(0);
		} finally {
			setLoadingBalances(false);
		}
	};

	// Check if biometric is enabled on modal open
	useEffect(() => {
		if (showTransferModal) {
			isBiometricEnabled().then(setBiometricEnabled).catch(() => setBiometricEnabled(false));
			setWebauthnToken(null);
		}
	}, [showTransferModal]);

	// Handle transfer
	const handleTransfer = async () => {
		setTransferError('');
		setTransferSuccess('');
		if (!transferEmail || !transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0 || (!transferTwoFA && !webauthnToken)) {
			setTransferError('Enter a valid email, amount, and authentication.');
			return;
		}
		try {
			let res;
			if (webauthnToken) {
				res = await transferSpot(transferEmail, Number(transferAmount), webauthnToken);
			} else {
				res = await transferSpot(transferEmail, Number(transferAmount), transferTwoFA);
			}
			setTransferSuccess(res.message || 'Transfer successful!');
			setTransferEmail('');
			setTransferAmount('');
			setTransferTwoFA('');
			setWebauthnToken(null);
			// Optionally refresh balances
			const data = await import('../services/api').then(m => m.getPortfolio());
			setSpotBalance(data.spotBalance || 0);
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
					color: '#25324B',
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
          spotBalance={spotBalance}
          loadingBalances={loadingBalances}
          convertDirection={convertDirection}
          setConvertDirection={d => {
            setConvertDirection(d);
            setConvertError('');
            setConvertSuccess('');
            setConvertAmount('');
          }}
          convertAmount={convertAmount}
          setConvertAmount={a => {
            setConvertAmount(a);
            setConvertError('');
            setConvertSuccess('');
          }}
          convertError={convertError}
          convertSuccess={convertSuccess}
          handleConvert={handleConvert}
          CONVERT_RATE={CONVERT_RATE}
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
      background: '#fff',
      borderRadius: 0,
      boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
      border: '1px solid #e3e6ef',
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
        color: '#25324B',
        letterSpacing: 1,
        fontFamily: 'serif'
      }}>Transfer SPOT</h2>
      <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 8 }}>
        Send SPOT to another user instantly.
      </div>
      <div style={{ marginBottom: 12, fontWeight: 600, color: '#1e3c72' }}>
        Your SPOT Balance: <span style={{ color: '#2a5298' }}>{spotBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 500, color: '#25324B', marginRight: 10 }}>Recipient Email:</label>
        <input
          type="email"
          value={transferEmail}
          onChange={e => setTransferEmail(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 16,
            width: 220
          }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 500, color: '#25324B', marginRight: 10 }}>Amount:</label>
        <input
          type="number"
          min="0"
          step="any"
          value={transferAmount}
          onChange={e => {
            setTransferAmount(e.target.value);
            setTransferError('');
            setTransferSuccess('');
            if (e.target.value && !isNaN(Number(e.target.value)) && Number(e.target.value) > spotBalance) {
              setTransferError('Insufficient funds.');
            }
          }}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 16,
            width: 120
          }}
        />
        {transferAmount && Number(transferAmount) > spotBalance && (
          <div style={{ color: '#e74c3c', fontWeight: 600, marginTop: 4, fontSize: 14 }}>Insufficient funds.</div>
        )}
      </div>
      {!biometricEnabled && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500, color: '#25324B', marginRight: 10 }}>2FA Code:</label>
          <input
            type="text"
            value={transferTwoFA}
            onChange={e => setTransferTwoFA(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 16,
              width: 120
            }}
            maxLength={6}
            pattern="[0-9]{6}"
            inputMode="numeric"
          />
        </div>
      )}
      {biometricEnabled && !webauthnToken && (
        <div style={{ marginBottom: 12 }}>
          <button
            style={{
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              background: '#25324B',
              color: '#fff',
              marginTop: 4
            }}
            onClick={async () => {
              setTransferError('');
              setTransferSuccess('');
              try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Not authenticated');
                console.log('[WebAuthn] Fetching authentication options...');
                const resp = await fetch(`${API}/webauthn/generate-authentication-options`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                });
                console.log('[WebAuthn] Response status:', resp.status);
                if (!resp.ok) {
                  const text = await resp.text();
                  console.error('[WebAuthn] Error response:', text);
                  throw new Error('Failed to get authentication options: ' + text);
                }
                const options = await resp.json();
                console.log('[WebAuthn] Authentication options:', options);
                const authOptions = options.challenge ? options : options.options || options;
                const assertion = await startAuthentication(authOptions);
                console.log('[WebAuthn] Assertion:', assertion);
                // Send assertion to backend for verification
                const verifyResp = await fetch(`${API}/webauthn/verify-authentication`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ credential: assertion })
                });
                console.log('[WebAuthn] Verify response status:', verifyResp.status);
                if (!verifyResp.ok) {
                  const text = await verifyResp.text();
                  console.error('[WebAuthn] Verify error response:', text);
                  throw new Error('WebAuthn authentication failed: ' + text);
                }
                const verifyData = await verifyResp.json();
                console.log('[WebAuthn] Verify data:', verifyData);
                if (!verifyData.verified || !verifyData.token) throw new Error('WebAuthn authentication failed');
                setWebauthnToken(verifyData.token);
                setTransferSuccess('WebAuthn authentication successful!');
              } catch (e: any) {
                console.error('[WebAuthn] Exception:', e);
                setTransferError(e.message || 'WebAuthn authentication failed');
              }
            }}
          >
            Use WebAuthn (Biometric)
          </button>
        </div>
      )}
      {transferError && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{transferError}</div>}
      {transferSuccess && <div style={{ color: '#10c98f', marginBottom: 10 }}>{transferSuccess}</div>}
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
							onClick={
								item.label === 'DEPOSIT' ? () => !fundsLocked && navigate('/deposit') :
								item.label === 'WITHDRAW' ? () => !fundsLocked && navigate('/withdraw') :
								item.label === 'CONVERT' ? openConvertModal :
								item.label === 'TRANSFER' ? () => !fundsLocked && openTransferModal() :
								undefined
							}
						>
							<span className='dashboard-circle-icon'>{item.icon}</span>
							<span className='dashboard-circle-label'>{item.label}</span>
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
					background: '#fff',
					boxShadow: '0 2px 16px rgba(30,60,114,0.10)',
					borderRadius: 0,
					padding: '18px 0',
					margin: '24px 0 0 0',
					width: '95%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}>
					<span style={{ fontWeight: 600, fontSize: 18, color: '#25324B', letterSpacing: 0.5 }}>
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
							background: '#fff',
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
						<FaTelegramPlane size={28} color="#229ED9" />
					</button>
					{/* Email (Gmail) */}
					<button
						style={{
							width: 48,
							height: 48,
							background: '#fff',
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
						<MdEmail size={28} color="#EA4335" />
					</button>
					{/* WhatsApp */}
					<button
						style={{
							width: 48,
							height: 48,
							background: '#fff',
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
						<FaWhatsapp size={28} color="#25D366" />
					</button>
					{/* Chat Icon */}
					<button
				style={{
					width: 48,
					height: 48,
					background: '#fff',
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
				onClick={() => navigate('/prochat')}
			>
				<ChatIcon size={28} color="#25324B" />
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