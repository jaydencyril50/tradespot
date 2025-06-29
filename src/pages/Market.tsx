import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

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
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);

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
      autoscaleInfoProvider: (original: () => { priceRange: { minValue: number; maxValue: number }; } | undefined) => {
        const res = original();
        if (res) {
          res.priceRange.minValue = Math.floor(res.priceRange.minValue);
          res.priceRange.maxValue = Math.ceil(res.priceRange.maxValue);
        }
        return res;
      }
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const smaSeries = chart.addLineSeries({ color: '#e0e722' });
    const emaSeries = chart.addLineSeries({ color: '#ff6f61' });
    const rsiSeries = chart.addLineSeries({ color: '#9b59b6' });
    const macdSeries = chart.addLineSeries({ color: '#3498db' });

    const generateCandles = (): Candle[] => {
      const candles: Candle[] = [];
      let time = Math.floor(Date.now() / 1000) - 60 * 60 * 24;
      let price = 500;

      for (let i = 0; i < 100; i++) {
        const open = price;
        const close = open + (Math.random() - 0.5) * 4; // Smaller movement
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;

        price = close;
        price = Math.min(550, Math.max(450, price));

        candles.push({
          time,
          open: +open.toFixed(2),
          high: +high.toFixed(2),
          low: +low.toFixed(2),
          close: +close.toFixed(2),
          volume: Math.floor(Math.random() * 1000) + 500,
        });

        time += 60 * 5;
      }

      return candles;
    };

    const getSMA = (data: Candle[], window: number) =>
      data.map((d: Candle, i: number) => {
        if (i < window) return { time: d.time, value: null };
        const avg =
          data.slice(i - window, i).reduce((sum: number, c: Candle) => sum + c.close, 0) / window;
        return { time: d.time, value: +avg.toFixed(2) };
      });

    const getEMA = (data: Candle[], window: number) => {
      const k = 2 / (window + 1);
      let ema = data[0].close;
      return data.map((d: Candle, i: number) => {
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

    const getMACD = (data: Candle[], short = 12, long = 26, signal = 9) => {
      const emaShort = getEMA(data, short);
      const emaLong = getEMA(data, long);
      const macdLine = emaShort.map((point, i) => ({
        time: point.time,
        value: point.value - (emaLong[i]?.value || 0),
      }));
      const macdLineForEMA = macdLine.map((m) => ({
        time: m.time,
        close: m.value ?? 0,
      }));
      const signalLine = getEMA(macdLineForEMA as any, signal);
      return signalLine;
    };

    const updateChart = () => {
      const candles = generateCandles();
      candleSeries.setData(candles);
      volumeSeries.setData(candles.map(c => ({ time: c.time, value: c.volume, color: c.close > c.open ? '#26a69a' : '#ef5350' })));

      smaSeries.setData(showSMA ? getSMA(candles, 14) : []);
      emaSeries.setData(showEMA ? getEMA(candles, 14) : []);
      rsiSeries.setData(showRSI ? getRSI(candles) : []);
      macdSeries.setData(showMACD ? getMACD(candles) : []);
    };

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
      <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Simulated SPOT/USDT Market</h2>
      <div style={{ color: '#fff', marginBottom: '1rem' }}>
        <label><input type="checkbox" checked={showSMA} onChange={() => setShowSMA(!showSMA)} /> SMA</label>{' '}
        <label><input type="checkbox" checked={showEMA} onChange={() => setShowEMA(!showEMA)} /> EMA</label>{' '}
        <label><input type="checkbox" checked={showRSI} onChange={() => setShowRSI(!showRSI)} /> RSI</label>{' '}
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
          backgroundColor: '#131722'
        }}
      />
    </div>
  );
};

export default SimulatedMarketChart;
