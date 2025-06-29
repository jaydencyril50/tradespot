import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { getPortfolio } from '../services/api';
import { placeOrder } from '../services/orderbook';

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
      // For demo, assume market price is 1.00
      return (amt * 1).toFixed(2);
    }
    const prc = parseFloat(price);
    if (!prc || prc <= 0) return '';
    return (amt * prc).toFixed(2);
  })();

  // Handle order placement
  const handlePlaceOrder = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Enter a valid amount.');
      return;
    }
    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      setErrorMsg('Enter a valid limit price.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await placeOrder(
        tradeType,
        orderType === 'market' ? 0 : parseFloat(price),
        parseFloat(amount),
        orderType,
        token
      );
      setOrderSummary({
        tradeType,
        orderType,
        amount,
        price: orderType === 'market' ? 'Market' : price,
        total: total || '0.00',
      });
      setSuccessMsg(res.message || 'Order placed!');
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e.message || 'Order failed');
    }
  };

  useEffect(() => {
    // Fetch user spot and USDT balance and trade stats when modal opens
    if (profileModalOpen) {
      const fetchPortfolio = async () => {
        try {
          const data = await getPortfolio();
          setPortfolio(data);
          setUserSpotBalance(data.spotBalance ?? 0);
          setUserUSDTBalance(data.usdtBalance ?? 0);
        } catch (e) {
          setPortfolio(null);
          setUserSpotBalance(null);
          setUserUSDTBalance(null);
        }
      };
      fetchPortfolio();
    }
  }, [profileModalOpen]);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          SPOT/USDT MARKET
        </span>
        <img
          src={require('../assets/profile.png')}
          alt="profile"
          style={{ width: 40, height: 40, borderRadius: '50%', background: '#111', objectFit: 'cover', marginLeft: 16, opacity: 0.6, cursor: 'pointer' }}
          onClick={() => setProfileModalOpen(true)}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
        <div>
          <label><input type="checkbox" checked={showSMA} onChange={() => setShowSMA(!showSMA)} /> SMA</label>
          <label><input type="checkbox" checked={showEMA} onChange={() => setShowEMA(!showEMA)} /> EMA</label>
          <label><input type="checkbox" checked={showRSI} onChange={() => setShowRSI(!showRSI)} /> RSI</label>
          <label><input type="checkbox" checked={showMACD} onChange={() => setShowMACD(!showMACD)} /> MACD</label>
        </div>
        <div
          ref={chartContainerRef}
          style={{
            width: '100%',
            maxWidth: '1000px',
            height: '500px',
            borderRadius: 8,
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            backgroundColor: '#131722',
            position: 'relative'
          }}
        >
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
      {/* Trading Section */}
      <div style={{
        maxWidth: 480,
        margin: '32px auto 0',
        background: '#f6f9fe',
        border: '1.5px solid #232b36',
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        borderRadius: 0,
        boxShadow: '0 12px 40px 0 rgba(30,60,114,0.18), 0 4px 16px 0 rgba(30,60,114,0.10)',
        padding: '24px 24px 18px 18px',
        fontFamily: 'inherit',
        color: '#232b36',
      }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif', marginBottom: 18, display: 'block' }}>
          TRADE SPOT/USDT
        </span>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <button type="button" onClick={() => setTradeType('buy')} style={{ flex: 1, padding: 8, borderRadius: 6, border: tradeType === 'buy' ? '2px solid #27ae60' : '1px solid #ccc', background: tradeType === 'buy' ? '#eafaf1' : '#fff', color: '#27ae60', fontWeight: 600 }}>Buy</button>
          <button type="button" onClick={() => setTradeType('sell')} style={{ flex: 1, padding: 8, borderRadius: 6, border: tradeType === 'sell' ? '2px solid #e74c3c' : '1px solid #ccc', background: tradeType === 'sell' ? '#fbeaea' : '#fff', color: '#e74c3c', fontWeight: 600 }}>Sell</button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontWeight: 500, fontSize: 14 }}>Order Type</label>
          <select value={orderType} onChange={e => setOrderType(e.target.value as 'market' | 'limit')} style={{ width: '100%', padding: 7, borderRadius: 5, border: '1px solid #bbb', marginTop: 4 }}>
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontWeight: 500, fontSize: 14 }}>Amount (SPOT)</label>
          <input type="number" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '95%', padding: 7, borderRadius: 5, border: '1px solid #bbb', marginTop: 4 }} />
        </div>
        {orderType === 'limit' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 500, fontSize: 14 }}>Limit Price (USDT)</label>
            <input type="number" min="0" step="any" value={price} onChange={e => setPrice(e.target.value)} style={{ width: '100%', padding: 7, borderRadius: 5, border: '1px solid #bbb', marginTop: 4 }} />
          </div>
        )}
        <div style={{ marginBottom: 18, fontWeight: 500, fontSize: 15 }}>
          Total: <span style={{ color: '#25324B', fontWeight: 700 }}>{total || '0.00'} USDT</span>
        </div>
        <button type="button" onClick={handlePlaceOrder} style={{ width: '100%', padding: 10, borderRadius: 6, background: tradeType === 'buy' ? '#27ae60' : '#e74c3c', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', marginBottom: 10 }}>
          Place {tradeType === 'buy' ? 'Buy' : 'Sell'} Order
        </button>
        {orderSummary && (
          <div style={{ background: '#fff', border: '1px solid #e3e6ef', borderRadius: 6, padding: 12, marginTop: 10, fontSize: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Order Summary</div>
            <div>Type: <b style={{ color: tradeType === 'buy' ? '#27ae60' : '#e74c3c' }}>{tradeType.toUpperCase()}</b></div>
            <div>Order: <b>{orderType.toUpperCase()}</b></div>
            <div>Amount: <b>{amount}</b> SPOT</div>
            <div>Price: <b>{orderType === 'market' ? 'Market' : price + ' USDT'}</b></div>
            <div>Total: <b>{total} USDT</b></div>
          </div>
        )}
        {errorMsg && <div style={{ color: '#e74c3c', marginTop: 8, fontWeight: 500 }}>{errorMsg}</div>}
        {successMsg && <div style={{ color: '#27ae60', marginTop: 8, fontWeight: 500 }}>{successMsg}</div>}
      </div>
      {/* Profile Modal Overlay */}
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
            style={{
              background: '#fff',
              padding: '32px 36px',
              minWidth: 260,
              boxShadow: '0 8px 32px 0 rgba(30,60,114,0.18)',
              borderRadius: 0,
              fontFamily: 'inherit',
              color: '#232b36',
              position: 'relative',
              zIndex: 2100,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Account Overview</div>
            <div><b>USDT Balance:</b> {userUSDTBalance !== null ? userUSDTBalance + ' USDT' : '...'}</div>
            <div><b>SPOT Balance:</b> {userSpotBalance !== null ? userSpotBalance + ' SPOT' : '...'}</div>
            <div><b>Total Trades:</b> {portfolio?.totalTrades ?? '...'}</div>
            <div><b>Open Trades:</b> {portfolio?.openTrades ?? '...'}</div>
            <div><b>Closed Trades:</b> {portfolio?.closedTrades ?? '...'}</div>
            <button onClick={() => setProfileModalOpen(false)} style={{ marginTop: 10, background: '#232b36', color: '#fff', border: 'none', padding: '7px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatedMarketChart;
