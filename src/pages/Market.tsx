import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { getPortfolio } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../components/Market.css';

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
    // Fetch user spot and USDT balance and trade stats when modal opens
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
    }
  }, [profileModalOpen]);

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

  return (
    <div className="market-root">
      {/* Header Bar */}
      <div className="market-header">
        <span className="market-header-title">
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
          style={isFullscreen ? { padding: 0, height: '100vh' } : {}}
        >
          {/* Chart Controls */}
          <div className="market-chart-controls">
            <label><input type="checkbox" checked={showSMA} onChange={() => setShowSMA(!showSMA)} /> SMA</label>
            <label><input type="checkbox" checked={showEMA} onChange={() => setShowEMA(!showEMA)} /> EMA</label>
            <label><input type="checkbox" checked={showRSI} onChange={() => setShowRSI(!showRSI)} /> RSI</label>
            <label><input type="checkbox" checked={showMACD} onChange={() => setShowMACD(!showMACD)} /> MACD</label>
            <span
              onClick={() => setIsFullscreen(f => !f)}
              style={{ cursor: 'pointer', marginLeft: 8, fontSize: 22, display: 'flex', alignItems: 'center' }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {/* SVG Zoom/Fullscreen Icon */}
              {isFullscreen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#232b36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18H5a2 2 0 0 1-2-2v-4"/><polyline points="7 16 3 16 3 12"/><path d="M15 6h4a2 2 0 0 1 2 2v4"/><polyline points="17 8 21 8 21 12"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#232b36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
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
              margin: 0
            } : {}}
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
          <div className="market-btn-card">
            <button
              type="button"
              onClick={() => {
                setTradeType('buy');
                navigate('/buy');
              }}
              className={`market-btn buy${tradeType === 'buy' ? ' active' : ''}`}
            >
              Buy
            </button>
          </div>
          <div className="market-btn-card">
            <button
              type="button"
              onClick={() => {
                navigate('/sell');
              }}
              className={`market-btn sell${tradeType === 'sell' ? ' active' : ''}`}
            >
              Sell
            </button>
          </div>
          <div className="market-btn-card">
            <button
              type="button"
              onClick={() => navigate('/order')}
              className="market-btn order"
            >
              Order
            </button>
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
          >
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Account Overview</div>
            <div><b>USDT Balance:</b> {userUSDTBalance !== null ? userUSDTBalance + ' USDT' : '...'}</div>
            <div><b>SPOT Balance:</b> {userSpotBalance !== null ? userSpotBalance + ' SPOT' : '...'}</div>
            <button onClick={() => setProfileModalOpen(false)} style={{ marginTop: 10, background: '#232b36', color: '#fff', border: 'none', padding: '7px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatedMarketChart;
