import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { getPortfolio } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../components/Market.css';

const API = process.env.REACT_APP_API_BASE_URL;

// Candle type definition
interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const SimulatedMarketChart = () => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  // Dummy user data for modal (replace with real API calls as needed)
  const userData = {
    spotBalance: 1234.56,
    totalTrades: 42,
    openTrades: 3,
    closedTrades: 39,
  };

  // Trading state
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [userSpotBalance, setUserSpotBalance] = useState<number | null>(null);
  const [userUSDTBalance, setUserUSDTBalance] = useState<number | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [tradeStats, setTradeStats] = useState({ total: 0, open: 0, closed: 0 });
  const [openOrders, setOpenOrders] = useState<any[]>([]);

  // Store latest close price from chart data
  const [latestClose, setLatestClose] = useState<number | null>(null);

  // --- FLEX Profit Activation State ---
  const [flexActivate, setFlexActivate] = useState(() => {
    // Initialize from localStorage if present
    const stored = localStorage.getItem('flexActivate');
    return stored === 'true';
  });
  const [usdtRecord, setUsdtRecord] = useState<number | null>(null);
  const [flexButtonDisabled, setFlexButtonDisabled] = useState(false);
  const [flexProfit, setFlexProfit] = useState(0);
  const [flexStatus, setFlexStatus] = useState<{ active: boolean, usdtRecord: number }>({ active: false, usdtRecord: 0 });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
      },
      priceScale: {
        borderColor: '#485c7b',
      },
      timeScale: {
        borderColor: '#485c7b',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: 'rgba(38, 166, 154, 0.3)',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const smaSeries = chart.addLineSeries({ color: '#e0e722' });
    const emaSeries = chart.addLineSeries({ color: '#ff6f61' });
    const rsiSeries = chart.addLineSeries({ color: '#9b59b6' });
    const macdSeries = chart.addLineSeries({ color: '#3498db' });

    const getSMA = (data: Candle[], window: number) =>
      data.map((d, i) => {
        if (i < window) return { time: d.time, value: null };
        const avg =
          data.slice(i - window, i).reduce((sum, c) => sum + c.close, 0) / window;
        return { time: d.time, value: +avg.toFixed(2) };
      });

    const getEMA = (data: Candle[], window: number) => {
      const k = 2 / (window + 1);
      let ema = data[0].close;
      return data.map((d, i) => {
        if (i === 0) return { time: d.time, value: ema };
        ema = d.close * k + ema * (1 - k);
        return { time: d.time, value: +ema.toFixed(2) };
      });
    };

    const getRSI = (data: Candle[], period = 14) => {
      let gains = 0, losses = 0;
      const result = [];

      for (let i = 1; i <= period; i++) {
        const change = data[i].close - data[i - 1].close;
        change > 0 ? (gains += change) : (losses -= change);
      }

      let avgGain = gains / period;
      let avgLoss = losses / period;

      result.push({ time: data[period].time, value: +(100 - 100 / (1 + avgGain / avgLoss)).toFixed(2) });

      for (let i = period + 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        change > 0 ? (avgGain = (avgGain * (period - 1) + change) / period) : (avgLoss = (avgLoss * (period - 1) - change) / period);

        const rs = avgGain / avgLoss;
        result.push({ time: data[i].time, value: +(100 - 100 / (1 + rs)).toFixed(2) });
      }

      return result;
    };

    interface LinePoint {
      time: number;
      close: number;
    }

    const getMACD = (data: Candle[], short = 12, long = 26, signal = 9) => {
      const emaShort = getEMA(data, short);
      const emaLong = getEMA(data, long);
      const macdLine = emaShort.map((point, i) => ({
        time: point.time,
        value: point.value - (emaLong[i]?.value || 0),
      }));
      const macdLineForEMA: LinePoint[] = macdLine.map((m) => ({
        time: m.time,
        close: m.value ?? 0,
      }));
      const signalLine = getEMA(macdLineForEMA as any, signal);
      return signalLine;
    };

    const updateChart = async () => {
      const response = await fetch('https://market-egl7.onrender.com/api/market/candles');
      const candles: Candle[] = await response.json();
      candleSeries.setData(candles);
      volumeSeries.setData(candles.map(c => ({ time: c.time, value: c.volume, color: c.close > c.open ? 'rgba(38, 166, 154, 0.3)' : 'rgba(239, 83, 80, 0.3)' })));

      smaSeries.setData(showSMA ? getSMA(candles, 14) : []);
      emaSeries.setData(showEMA ? getEMA(candles, 14) : []);
      rsiSeries.setData(showRSI ? getRSI(candles) : []);
      macdSeries.setData(showMACD ? getMACD(candles) : []);

      // Set latest close price for live total calculation
      if (candles && candles.length > 0) {
        setLatestClose(candles[candles.length - 1].close);
      }
    };

    chart.subscribeCrosshairMove((param: {
      time?: number;
      point?: { x: number; y: number };
      seriesPrices: Map<any, any>;
    }) => {
      if (!param || !param.time || !param.seriesPrices) return;
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      const price = param.seriesPrices.get(candleSeries);
      if (!price) return;

      tooltip.style.display = 'block';
      tooltip.style.left = `${param.point?.x ?? 0}px`;
      tooltip.style.top = '10px';
      tooltip.innerText = `O: ${price.open} H: ${price.high} L: ${price.low} C: ${price.close}`;
    });

    updateChart();
    const interval = setInterval(updateChart, 5000);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [showSMA, showEMA, showRSI, showMACD]);

  // Calculate total based on amount and price
  const total = (() => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return '';
    if (orderType === 'market') {
      // Use latest market price from chart
      if (!latestClose) return '';
      return (amt * latestClose).toFixed(2);
    }
    const prc = parseFloat(price);
    if (!prc || prc <= 0) return '';
    return (amt * prc).toFixed(2);
  })();

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Poll USDT balance and check for profit if activated
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (flexActivate && usdtRecord !== null) {
      interval = setInterval(async () => {
        try {
          const data = await getPortfolio();
          const currentUSDT = data.usdtBalance ?? 0;
          if (currentUSDT > usdtRecord) {
            const profit = +(currentUSDT - usdtRecord).toFixed(2);
            // Send profit to FLEX balance (API call)
            await fetch(`${API}/api/portfolio/flex-profit`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({ profit }),
            });
            setFlexProfit(profit);
            setFlexButtonDisabled(true);
            setFlexActivate(false);
            setUsdtRecord(null);
          }
        } catch {}
      }, 2000); // check every 2 seconds
    }
    return () => { if (interval) clearInterval(interval); };
  }, [flexActivate, usdtRecord]);

  // --- FLEX Profit Activation State ---
  // Always fetch activation status on mount and when modal opens
  useEffect(() => {
    const fetchFlexStatus = async () => {
      try {
        const res = await fetch(`${API}/api/portfolio/flex-profit-status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFlexStatus(data);
          setFlexButtonDisabled(data.active);
          setUsdtRecord(data.usdtRecord);
        } else {
          setFlexStatus({ active: false, usdtRecord: 0 });
          setFlexButtonDisabled(false);
        }
      } catch {
        setFlexStatus({ active: false, usdtRecord: 0 });
        setFlexButtonDisabled(false);
      }
    };
    fetchFlexStatus();
  }, [profileModalOpen]);

  // Optionally, poll status every 10s for robustness
  useEffect(() => {
    const interval = setInterval(() => {
      if (profileModalOpen) {
        fetch(`${API}/api/portfolio/flex-profit-status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
          .then(res => res.ok ? res.json() : { active: false, usdtRecord: 0 })
          .then(data => {
            setFlexStatus(data);
            setFlexButtonDisabled(data.active);
            setUsdtRecord(data.usdtRecord);
          })
          .catch(() => {
            setFlexStatus({ active: false, usdtRecord: 0 });
            setFlexButtonDisabled(false);
          });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [profileModalOpen]);

  // Poll portfolio balances every 2s while modal is open
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (profileModalOpen) {
      const fetchPortfolioAndTrades = async () => {
        try {
          const data = await getPortfolio();
          setPortfolio(data);
          setUserSpotBalance(data.spotBalance ?? 0);
          setUserUSDTBalance(data.usdtBalance ?? 0);
        } catch (e) {
          setPortfolio(null);
          setUserSpotBalance(null);
          setUserUSDTBalance(null);
          setTradeStats({ total: 0, open: 0, closed: 0 });
        }
      };
      fetchPortfolioAndTrades();
      interval = setInterval(fetchPortfolioAndTrades, 2000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [profileModalOpen]);

  return (
    <div className="market-root" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header Bar */}
      <div className="market-header" style={{ background: 'var(--card-bg)', borderBottom: '1.5px solid var(--primary)' }}>
        <span className="market-header-title" style={{ color: 'var(--primary)' }}>
          SPOT/USDT MARKET
        </span>
        <img
          src={require('../assets/profile.png')}
          alt="profile"
          className="market-header-profile"
          onClick={() => setProfileModalOpen(true)}
        />
      </div>
      {/* Main Content Area */}
      <div className="market-main">
        {/* Chart Card */}
        <div
          className="market-chart-card"
          style={Object.assign({}, isFullscreen ? { padding: 0, height: '100vh' } : {}, { background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-bg)' })}
        >
          {/* Chart Controls */}
          <div className="market-chart-controls" style={{ color: 'var(--text)' }}>
            <label><input type="checkbox" checked={showSMA} onChange={() => setShowSMA(!showSMA)} /> SMA</label>
            <label><input type="checkbox" checked={showEMA} onChange={() => setShowEMA(!showEMA)} /> EMA</label>
            <label><input type="checkbox" checked={showRSI} onChange={() => setShowRSI(!showRSI)} /> RSI</label>
            <label><input type="checkbox" checked={showMACD} onChange={() => setShowMACD(!showMACD)} /> MACD</label>
            <span
              onClick={() => setIsFullscreen(f => !f)}
              style={{ cursor: 'pointer', marginLeft: 8, fontSize: 22, display: 'flex', alignItems: 'center', color: 'var(--primary)' }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {/* SVG Zoom/Fullscreen Icon */}
              {isFullscreen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18H5a2 2 0 0 1-2-2v-4"/><polyline points="7 16 3 16 3 12"/><path d="M15 6h4a2 2 0 0 1 2 2v4"/><polyline points="17 8 21 8 21 12"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              )}
            </span>
          </div>
          {/* Chart Container */}
          <div
            ref={chartContainerRef}
            className="market-chart-container"
            style={isFullscreen ? {
              width: '100vw',
              maxWidth: '100vw',
              height: '100vh',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              borderRadius: 0,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.85)',
              margin: 0,
              background: 'var(--bg)'
            } : { background: 'var(--bg)' }}
          >
            {isFullscreen && (
              <button
                onClick={() => setIsFullscreen(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 24,
                  zIndex: 10001,
                  background: 'rgba(30,30,30,0.7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  fontSize: 22,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Exit Fullscreen"
              >
                &#10005;
              </button>
            )}
            <div
              ref={tooltipRef}
              style={{
                position: 'absolute',
                color: 'white',
                background: 'rgba(0,0,0,0.7)',
                padding: '4px 8px',
                borderRadius: 4,
                pointerEvents: 'none',
                display: 'none',
                fontSize: '12px',
                zIndex: 1000,
              }}
            />
          </div>
        </div>
        {/* Buy/Sell/Order Buttons Section */}
        <div className="market-buy-sell-order market-buy-sell-order-vertical">
          <div className="market-btn-card" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 50 }}>
            <span
              onClick={() => {
                setTradeType('buy');
                navigate('/buy');
              }}
              className={`market-btn buy${tradeType === 'buy' ? ' active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '1.2rem',
                padding: 0,
                minWidth: 80,
                borderRadius: 3,
                fontWeight: 800,
                height: 'auto',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'none',
                display: 'inline-block',
                textDecoration: tradeType === 'buy' ? 'underline' : 'none',
                transition: 'color 0.2s',
                textAlign: 'center',
              }}
              tabIndex={0}
              role="button"
            >
              Buy
            </span>
          </div>
          <div className="market-btn-card" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 50 }}>
            <span
              onClick={() => {
                setTradeType('sell');
                navigate('/sell');
              }}
              className={`market-btn sell${tradeType === 'sell' ? ' active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '1.2rem',
                padding: 0,
                minWidth: 80,
                borderRadius: 3,
                fontWeight: 800,
                height: 'auto',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'none',
                display: 'inline-block',
                textDecoration: tradeType === 'sell' ? 'underline' : 'none',
                transition: 'color 0.2s',
                textAlign: 'center',
              }}
              tabIndex={0}
              role="button"
            >
              Sell
            </span>
          </div>
          <div className="market-btn-card" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 50 }}>
            <span
              onClick={() => navigate('/order')}
              className="market-btn order"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '1.2rem',
                padding: 0,
                minWidth: 70,
                borderRadius: 3,
                fontWeight: 800,
                height: 'auto',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'none',
                display: 'inline-block',
                textDecoration: 'none',
                transition: 'color 0.2s',
                textAlign: 'center',
              }}
              tabIndex={0}
              role="button"
            >
              Order
            </span>
          </div>
        </div>
      </div>
      {/* Profile Modal Overlay (unchanged) */}
      {profileModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setProfileModalOpen(false)}
        >
          <div
            className="market-profile-modal"
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--card-bg)', color: 'var(--text)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-bg)' }}
          >
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--primary)' }}>Account Overview</div>
            <div><b>USDT Balance:</b> {userUSDTBalance !== null ? userUSDTBalance + ' USDT' : '...'}</div>
            <div><b>SPOT Balance:</b> {userSpotBalance !== null ? userSpotBalance + ' SPOT' : '...'}</div>
            {/* FLEX Profit Activation Button */}
            <button
              onClick={async () => {
                if (flexButtonDisabled) return;
                // Call backend to activate
                try {
                  console.log('[FLEX] Attempting activation:', `${API}/api/portfolio/flex-profit-activate`, localStorage.getItem('token'));
                  const res = await fetch(`${API}/api/portfolio/flex-profit-activate`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                  });
                  console.log('[FLEX] Activation response:', res.status);
                  if (res.ok) {
                    const data = await res.json();
                    console.log('[FLEX] Activation success:', data);
                    setFlexButtonDisabled(true);
                    // Optionally show a toast or update status
                  } else {
                    const err = await res.json();
                    console.error('[FLEX] Activation error:', err);
                    alert(err.error || 'Activation failed');
                  }
                } catch (e) {
                  console.error('[FLEX] Network error:', e);
                  alert('Network error');
                }
              }}
              style={{
                marginTop: 10,
                background: flexButtonDisabled ? '#aaa' : '#10c98f',
                color: '#fff',
                border: 'none',
                padding: '7px 0',
                fontWeight: 600,
                fontSize: 15,
                cursor: flexButtonDisabled ? 'not-allowed' : 'pointer',
                width: '100%',
                borderRadius: 4,
                transition: 'background 0.2s',
              }}
              disabled={flexButtonDisabled}
            >
              {flexButtonDisabled ? 'ACTIVATED' : 'ACTIVATE'}
            </button>
            {flexProfit > 0 && (
              <div style={{ color: '#10c98f', marginTop: 8, fontWeight: 600 }}>
                Profit of {flexProfit} USDT sent to FLEX balance!
              </div>
            )}
            {/* Reset button to allow new activation */}
            {flexButtonDisabled && (
              <button
                onClick={() => {
                  setFlexButtonDisabled(false);
                  setFlexProfit(0);
                }}
                style={{
                  marginTop: 8,
                  background: '#232b36',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 0',
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  width: '100%',
                  borderRadius: 4,
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatedMarketChart;
