// src/pages/Market.tsx

import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import ProtectedRoute from '../components/ProtectedRoute';
import './Market.css';
import axios from 'axios';

// --- TradePanel Component ---
const TradePanel: React.FC<{ price: number }> = ({ price }) => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [inputPrice, setInputPrice] = useState(price);
  const [amount, setAmount] = useState(0);
  const [percent, setPercent] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [spotBalance, setSpotBalance] = useState<number | null>(null);

  // Fetch spot balance on mount
  useEffect(() => {
    async function fetchBalance() {
      try {
        const token = localStorage.getItem('token');
        const API = process.env.REACT_APP_API_BASE_URL;
        const res = await axios.get(`${API}/api/trade/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSpotBalance(res.data.spotBalance);
      } catch (err) {
        setSpotBalance(null);
      }
    }
    fetchBalance();
  }, []);

  useEffect(() => {
    setInputPrice(price);
  }, [price]);

  // Quick % buttons for amount
  const handlePercent = (p: number) => {
    setPercent(p);
    // Always set percent, even if spotBalance is null
    if (spotBalance !== null && !isNaN(spotBalance)) {
      setAmount(Number(((spotBalance * p) / 100).toFixed(4)));
    } else {
      setAmount(0); // keep amount at 0 if no balance
    }
  };

  const total = Number((inputPrice * amount).toFixed(2));

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const API = process.env.REACT_APP_API_BASE_URL;
      const res = await axios.post(
        `${API}/api/trade/open`,
        { amount, direction: side, openPrice: inputPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Trade placed successfully!');
      setSpotBalance(res.data.spotBalance);
      setAmount(0);
      setPercent(0);
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Trade failed');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="market-trade-panel">
      <div className="market-trade-tabs">
        <button
          type="button"
          className={side === 'buy' ? 'active' : ''}
          onClick={() => {
            setSide('buy');
            setPercent(0);
            setAmount(0);
          }}
        >Buy</button>
        <button
          type="button"
          className={side === 'sell' ? 'active' : ''}
          onClick={() => {
            setSide('sell');
            setPercent(0);
            setAmount(0);
          }}
        >Sell</button>
      </div>
      <div className="market-trade-form">
        <label htmlFor="market-price-input">
          Price (USDT)
          <input
            id="market-price-input"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={inputPrice}
            onChange={e => setInputPrice(Number(e.target.value))}
          />
        </label>
        <label htmlFor="market-amount-input">
          Amount (SPOT)
          <input
            id="market-amount-input"
            name="amount"
            type="number"
            min="0"
            step="0.0001"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
        </label>
        <div className="market-trade-percent-row">
          {[25, 50, 75, 100].map(p => (
            <button
              key={p}
              className={percent === p ? 'active' : ''}
              onClick={() => handlePercent(p)}
              type="button"
            >{p}%</button>
          ))}
        </div>
        <div className="market-trade-balance">
          <span>Available: </span>
          <span style={{ color: '#1976d2', fontWeight: 600 }}>
            {spotBalance !== null ? `${spotBalance.toLocaleString(undefined, {maximumFractionDigits:4})} SPOT` : '--'}
          </span>
        </div>
        <div className="market-trade-total">
          <span>Total: </span>
          <span style={{ fontWeight: 700 }}>{isNaN(total) ? '--' : `${total.toLocaleString(undefined, {maximumFractionDigits:2})} USDT`}</span>
        </div>
        <button
          className={`market-trade-place-btn ${side}`}
          onClick={handlePlaceOrder}
          disabled={placing || amount <= 0 || inputPrice <= 0}
        >
          {placing ? 'Placing...' : side === 'buy' ? 'Buy SPOT' : 'Sell SPOT'}
        </button>
        {message && <div className="market-trade-message">{message}</div>}
      </div>
    </div>
  );
};

type ChartApi = ReturnType<typeof createChart>;
type CandlestickData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const Market: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  // Set base price for SPOT/USDT (1 spot ≈ 500 USDT)
  const priceRef = useRef(500); // starting price for SPOT/USDT

  // Add state for toggling indicators
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showVWAP, setShowVWAP] = useState(true);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Add state for current price
  const [currentPrice, setCurrentPrice] = useState<number>(priceRef.current);
  const [blinker, setBlinker] = useState(true);
  // --- Candle Data Fetching from Backend ---
  const [candleData, setCandleData] = useState<CandlestickData[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchCandles() {
      console.log('[Market] Fetching candles from /api/market/candles');
      try {
        // Use REACT_APP_API_BASE_URL if set, fallback to canonical domain in production
        let apiBase = process.env.REACT_APP_API_BASE_URL;
        if (!apiBase) {
          apiBase = process.env.NODE_ENV === 'production'
            ? 'https://api.tradespot.online'
            : '';
        }
        const apiUrl = `${apiBase}/api/market/candles`;
        const res = await fetch(apiUrl);
        console.log('[Market] Response status:', res.status);
        let data;
        try {
          data = await res.json();
        } catch (jsonErr) {
          const text = await res.text();
          console.error('[Market] Failed to parse JSON. Response text:', text);
          throw jsonErr;
        }
        console.log('[Market] Raw data:', data);
        // Convert backend timestamps to seconds for lightweight-charts
        const formatted = data.map((c: any) => ({
          time: Math.floor(new Date(c.timestamp).getTime() / 1000),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume,
        }));
        // Filter out invalid candles (must have all fields and all must be numbers)
        const validCandles = formatted.filter((c: CandlestickData, idx: number) => {
          const required = ['time', 'open', 'high', 'low', 'close', 'volume'] as const;
          const valid = required.every(k => typeof c[k] === 'number' && !isNaN(c[k]) && c[k] !== null && c[k] !== undefined);
          if (!valid) {
            console.warn(`[Market] Skipping invalid candle at index ${idx}:`, c);
          }
          return valid;
        });
        console.log('[Market] Formatted candle data:', validCandles);
        if (isMounted) setCandleData(validCandles);
        if (isMounted && validCandles.length > 0) setCurrentPrice(validCandles[validCandles.length - 1].close);
      } catch (err) {
        console.error('[Market] Error fetching candles:', err);
      }
    }
    fetchCandles();
    const interval = setInterval(fetchCandles, 20000); // Poll every 20s
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    // Clean up previous chart
    container.innerHTML = '';

    // Init chart
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 340, // Reduced height for volume
      layout: {
        background: { color: '#ffffff' },
        textColor: '#232b36',
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 2,
        barSpacing: 3, // Reduced spacing for compact candles
        minBarSpacing: 1, // Allow candles to be closer
        fixLeftEdge: false,
        lockVisibleTimeRangeOnResize: false,
        allowShiftVisibleRangeOnResize: true,
      },
      crosshair: {
        mode: 1, // Normal crosshair mode
      },
      rightPriceScale: {
        borderColor: '#ccc',
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        axisDoubleClickReset: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    // Add crosshair move event for tooltip
    chart.subscribeCrosshairMove((param: any) => {
      if (!param.point || !param.time || !param.seriesPrices) return;
      // You can implement a custom tooltip here if desired
      // For now, this is a placeholder for extensibility
    });

    chartRef.current = chart;
    const candleSeries = chart.addCandlestickSeries();
    candleSeriesRef.current = candleSeries;

    // Add volume histogram series (below candles)
    const volumeSeries = chart.addHistogramSeries({
      color: 'rgba(178,190,195,0.35)', // reduced opacity
      priceFormat: { type: 'volume' },
      priceScaleId: '', // will use a separate scale
      scaleMargins: { top: 0.8, bottom: 0 }, // show at bottom
    });

    // Add SMA indicator (10-period)
    const smaSeries = chart.addLineSeries({
      color: '#1976d2',
      lineWidth: 2,
      title: 'SMA (10)',
      visible: showSMA,
    });

    // Add EMA indicator (10-period)
    const emaSeries = chart.addLineSeries({
      color: '#e67e22',
      lineWidth: 2,
      title: 'EMA (10)',
      lineStyle: 1, // dashed
      visible: showEMA,
    });

    // Add VWAP indicator
    const vwapSeries = chart.addLineSeries({
      color: '#27ae60',
      lineWidth: 2,
      title: 'VWAP',
      lineStyle: 2, // dotted
      visible: showVWAP,
    });

    // Add RSI indicator (14-period)
    const rsiSeries = chart.addLineSeries({
      color: '#8e44ad',
      lineWidth: 2,
      title: 'RSI (14)',
      visible: showRSI,
    });

    // Add MACD indicator
    const macdSeries = chart.addLineSeries({
      color: '#c0392b',
      lineWidth: 2,
      title: 'MACD',
      visible: showMACD,
    });

    // Helper to calculate SMA
    function calculateSMA(data: CandlestickData[], period: number) {
      const sma: { time: number; value: number }[] = [];
      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) continue;
        const slice = data.slice(i - period + 1, i + 1);
        const avg = slice.reduce((sum, d) => sum + d.close, 0) / period;
        sma.push({ time: data[i].time, value: avg });
      }
      return sma;
    }

    // Helper to calculate EMA
    function calculateEMA(data: CandlestickData[], period: number) {
      const ema: { time: number; value: number }[] = [];
      let prevEma = data[0]?.close ?? 0;
      const k = 2 / (period + 1);
      for (let i = 0; i < data.length; i++) {
        const price = data[i].close;
        prevEma = i === 0 ? price : price * k + prevEma * (1 - k);
        if (i >= period - 1) {
          ema.push({ time: data[i].time, value: prevEma });
        }
      }
      return ema;
    }

    // Helper to calculate VWAP
    function calculateVWAP(data: CandlestickData[]) {
      const vwap: { time: number; value: number }[] = [];
      let cumulativeTPV = 0;
      let cumulativeVolume = 0;
      for (let i = 0; i < data.length; i++) {
        // Simulate volume as random for demo
        const volume = 100 + Math.random() * 50;
        const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
        cumulativeTPV += typicalPrice * volume;
        cumulativeVolume += volume;
        vwap.push({ time: data[i].time, value: cumulativeTPV / cumulativeVolume });
      }
      return vwap;
    }

    // Helper to calculate RSI
    function calculateRSI(data: CandlestickData[], period: number) {
      const rsi: { time: number; value: number }[] = [];
      let gains = 0, losses = 0;
      for (let i = 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        if (i <= period) {
          if (change > 0) gains += change;
          else losses -= change;
          if (i === period) {
            let avgGain = gains / period;
            let avgLoss = losses / period;
            let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            let rsiValue = 100 - 100 / (1 + rs);
            rsi.push({ time: data[i].time, value: rsiValue });
          }
        } else {
          let prev = rsi[rsi.length - 1]?.value || 50;
          let gain = change > 0 ? change : 0;
          let loss = change < 0 ? -change : 0;
          gains = (gains * (period - 1) + gain) / period;
          losses = (losses * (period - 1) + loss) / period;
          let rs = losses === 0 ? 100 : gains / losses;
          let rsiValue = 100 - 100 / (1 + rs);
          rsi.push({ time: data[i].time, value: rsiValue });
        }
      }
      return rsi;
    }

    // Helper to calculate MACD (12,26,9)
    function calculateMACD(data: CandlestickData[], fast = 12, slow = 26, signal = 9) {
      const macd: { time: number; value: number }[] = [];
      const emaFast = calculateEMA(data, fast);
      const emaSlow = calculateEMA(data, slow);
      const macdLine: number[] = [];
      for (let i = 0; i < emaSlow.length; i++) {
        macdLine.push(emaFast[i + (slow - fast)]?.value - emaSlow[i].value);
      }
      // Signal line
      let signalLine: number[] = [];
      let prev = macdLine[0] || 0;
      const k = 2 / (signal + 1);
      for (let i = 0; i < macdLine.length; i++) {
        prev = i === 0 ? macdLine[i] : macdLine[i] * k + prev * (1 - k);
        signalLine.push(prev);
      }
      for (let i = 0; i < macdLine.length; i++) {
        macd.push({ time: data[i + (data.length - macdLine.length)].time, value: macdLine[i] - signalLine[i] });
      }
      return macd;
    }

    // Only set data from backend
    if (candleData.length > 0) {
      candleSeries.setData(candleData);
      // Set volume data
      volumeSeries.setData(candleData.map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)',
      })));
      smaSeries.setData(showSMA ? calculateSMA(candleData, 10) : []);
      emaSeries.setData(showEMA ? calculateEMA(candleData, 10) : []);
      vwapSeries.setData(showVWAP ? calculateVWAP(candleData) : []);
      rsiSeries.setData(showRSI ? calculateRSI(candleData, 14) : []);
      macdSeries.setData(showMACD ? calculateMACD(candleData) : []);
    }

    return () => {
      chart.remove();
    };
  }, [showSMA, showEMA, showVWAP, showRSI, showMACD, candleData]);

  // Simulate depth data for demo
  function generateDepthData(center: number, spread = 2, points = 40) {
    const bids = [];
    const asks = [];
    let cumBid = 0;
    let cumAsk = 0;
    for (let i = points; i > 0; i--) {
      const price = center - spread * (i / points);
      const size = Math.round(10 + Math.random() * 40);
      cumBid += size;
      bids.push({ price, size: cumBid });
    }
    for (let i = 1; i <= points; i++) {
      const price = center + spread * (i / points);
      const size = Math.round(10 + Math.random() * 40);
      cumAsk += size;
      asks.push({ price, size: cumAsk });
    }
    return { bids, asks };
  }

  // DepthChart component (filled step-style for market depth)
  const DepthChart: React.FC<{ center: number }> = ({ center }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = React.useState(600); // default fallback
    const height = 80;
    React.useEffect(() => {
      function updateWidth() {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth);
        }
      }
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }, []);
    const { bids, asks } = generateDepthData(center);
    // Scale price and size to SVG coordinates
    const minPrice = bids[0].price;
    const maxPrice = asks[asks.length - 1].price;
    const maxSize = Math.max(bids[bids.length - 1].size, asks[asks.length - 1].size);
    const px = (p: number) => ((p - minPrice) / (maxPrice - minPrice)) * containerWidth;
    const py = (s: number) => height - (s / maxSize) * (height - 20) - 10;
    // Step path for bids (filled)
    let bidPath = `M${px(bids[0].price)},${height}`;
    for (let i = 0; i < bids.length; i++) {
      bidPath += ` L${px(bids[i].price)},${py(bids[i].size)}`;
    }
    bidPath += ` L${px(bids[bids.length - 1].price)},${height} Z`;
    // Step path for asks (filled)
    let askPath = `M${px(asks[0].price)},${height}`;
    for (let i = 0; i < asks.length; i++) {
      askPath += ` L${px(asks[i].price)},${py(asks[i].size)}`;
    }
    askPath += ` L${px(asks[asks.length - 1].price)},${height} Z`;
    // Step lines for bids/asks
    let bidLine = `M${px(bids[0].price)},${py(bids[0].size)}`;
    for (let i = 1; i < bids.length; i++) {
      bidLine += ` L${px(bids[i].price)},${py(bids[i].size)}`;
    }
    let askLine = `M${px(asks[0].price)},${py(asks[0].size)}`;
    for (let i = 1; i < asks.length; i++) {
      askLine += ` L${px(asks[i].price)},${py(asks[i].size)}`;
    }
    return (
      <div ref={containerRef} style={{ width: '100%' }}>
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${containerWidth} ${height}`}
          preserveAspectRatio="none"
          style={{ display: 'block', margin: '0 auto' }}
        >
          {/* Bid area fill */}
          <path d={bidPath} fill="rgba(38,166,154,0.35)" stroke="none" />
          {/* Ask area fill */}
          <path d={askPath} fill="rgba(239,83,80,0.35)" stroke="none" />
          {/* Bid step line */}
          <path d={bidLine} fill="none" stroke="#26a69a" strokeWidth={2.5} />
          {/* Ask step line */}
          <path d={askLine} fill="none" stroke="#c0392b" strokeWidth={2.5} />
          {/* Center price line */}
          <line x1={px(center)} y1={0} x2={px(center)} y2={height} stroke="#232b36" strokeDasharray="4 2" strokeWidth={1} />
        </svg>
      </div>
    );
  };

  // Helper to get last candle
  function getLastCandle() {
    if (!chartRef.current) return null;
    // Use the last data point from the chart's series
    const series = candleSeriesRef.current;
    if (!series || !series._data || !series._data.length) return null;
    return series._data[series._data.length - 1];
  }

  useEffect(() => {
    const blinkInterval = setInterval(() => setBlinker(b => !b), 500);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="market-root">
      <div className="market-header">
        <span className="market-title">
          SPOT/USDT MARKET
        </span>
      </div>
      {/* Indicator dropdown and OHLC ticker at top right of chart, side by side */}
      <div className="market-indicator-row">
        <div className="market-indicator-controls">
          <button
            className={`market-indicator-btn${dropdownOpen ? ' open' : ''}`}
            onClick={() => setDropdownOpen((open) => !open)}
          >
            Indicators ▾
          </button>
          <span
            className="market-ohlc"
            style={{ color: (() => {
              let o = 0, h = 0, l = 0, c = currentPrice, ch = 0, pct = 0, up = true;
              if (candleSeriesRef.current && candleSeriesRef.current._data && candleSeriesRef.current._data.length > 0) {
                const last = candleSeriesRef.current._data[candleSeriesRef.current._data.length - 1];
                o = last.open;
                h = last.high;
                l = last.low;
                c = last.close;
                ch = c - o;
                pct = o !== 0 ? (ch / o) * 100 : 0;
                up = ch >= 0;
              }
              return up ? '#26a69a' : '#c0392b';
            })() }}
          >
            {/* Blinking live dot */}
            <span className={`market-blink-dot${blinker ? '' : ' off'}`} />
            {/* FIX: Call the IIFE to return JSX */}
            {(() => {
              let o = 0, h = 0, l = 0, c = currentPrice, ch = 0, pct = 0, up = true;
              if (candleSeriesRef.current && candleSeriesRef.current._data && candleSeriesRef.current._data.length > 0) {
                const last = candleSeriesRef.current._data[candleSeriesRef.current._data.length - 1];
                o = last.open;
                h = last.high;
                l = last.low;
                c = last.close;
                ch = c - o;
                pct = o !== 0 ? (ch / o) * 100 : 0;
                up = ch >= 0;
              }
              return (
                <>
                  <span style={{ color: '#232b36', fontWeight: 700, fontSize: 13 }}>O</span>{o.toLocaleString(undefined, {maximumFractionDigits: 2})}
                  <span style={{ color: '#c0392b', fontWeight: 700, fontSize: 13 }}>H</span>{h.toLocaleString(undefined, {maximumFractionDigits: 2})}
                  <span style={{ color: '#1976d2', fontWeight: 700, fontSize: 13 }}>L</span>{l.toLocaleString(undefined, {maximumFractionDigits: 2})}
                  <span style={{ color: '#232b36', fontWeight: 700, fontSize: 13 }}>C</span>{c.toLocaleString(undefined, {maximumFractionDigits: 2})}
                  <span style={{ color: up ? '#26a69a' : '#c0392b', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    <span style={{ color: up ? '#26a69a' : '#c0392b', fontSize: 15, fontWeight: 900, marginRight: 2 }}>
                      {ch === 0 ? '' : up ? '▲' : '▼'}
                    </span>
                    {ch >= 0 ? '+' : ''}{ch.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    ({pct >= 0 ? '+' : ''}{pct.toFixed(2)}%)
                  </span>
                </>
              );
            })()}
          </span>
          {dropdownOpen && (
            <div
              className="market-indicator-dropdown"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <label>
                <input type="checkbox" checked={showSMA} onChange={e => setShowSMA(e.target.checked)} /> SMA
              </label>
              <label>
                <input type="checkbox" checked={showEMA} onChange={e => setShowEMA(e.target.checked)} /> EMA
              </label>
              <label>
                <input type="checkbox" checked={showVWAP} onChange={e => setShowVWAP(e.target.checked)} /> VWAP
              </label>
              <label>
                <input type="checkbox" checked={showRSI} onChange={e => setShowRSI(e.target.checked)} /> RSI
              </label>
              <label>
                <input type="checkbox" checked={showMACD} onChange={e => setShowMACD(e.target.checked)} /> MACD
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="market-main market-main-with-trade">
        <div className="market-main-left">
          <div
            ref={chartContainerRef}
            className="market-chart-container"
          />
          {/* Market Depth Chart */}
          <div className="market-depth-container">
            <span className="market-depth-title">Market Depth</span>
            <DepthChart center={currentPrice} />
          </div>
        </div>
        {/* Trade Panel */}
        <TradePanel price={currentPrice} />
      </div>
    </div>
  );
};

const MarketPage: React.FC = () => (
  <ProtectedRoute>
    <Market />
  </ProtectedRoute>
);

export default MarketPage;
