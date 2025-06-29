import React, { useState, useEffect } from 'react';
import { getMarketCandles } from '../services/api';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

const Trade: React.FC = () => {
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
    const [message, setMessage] = useState('');
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [openTrade, setOpenTrade] = useState<any>(null);
    const [refresh, setRefresh] = useState(0);

    // Fetch latest price from chart candles
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const candles = await getMarketCandles();
                if (candles && candles.length > 0) {
                    setCurrentPrice(candles[candles.length - 1].close);
                }
            } catch (err) {
                setCurrentPrice(null);
            }
        };
        fetchPrice();
    }, [refresh]);

    // Fetch open trade if any
    useEffect(() => {
        const fetchOpenTrade = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get(`${API}/api/trade/open`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOpenTrade(res.data.trade);
            } catch {
                setOpenTrade(null);
            }
        };
        fetchOpenTrade();
    }, [refresh]);

    const handleTrade = async () => {
        setMessage('');
        if (!amount || !currentPrice) {
            setMessage('Enter amount and wait for price.');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');
            const res = await axios.post(`${API}/api/trade/open`, {
                amount: Number(amount),
                direction: transactionType,
                openPrice: currentPrice
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Trade opened!');
            setOpenTrade(res.data.trade);
            setRefresh(r => r + 1);
        } catch (err: any) {
            setMessage(err.response?.data?.error || err.message || 'Trade failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseTrade = async () => {
        if (!openTrade) return;
        setLoading(true);
        setMessage('');
        try {
            // Get latest price
            const candles = await getMarketCandles();
            const closePrice = candles[candles.length - 1].close;
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');
            await axios.post(`${API}/api/trade/close`, {
                tradeId: openTrade._id,
                closePrice
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Trade closed!');
            setOpenTrade(null);
            setRefresh(r => r + 1);
        } catch (err: any) {
            setMessage(err.response?.data?.error || err.message || 'Close failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#181c2a', color: '#fff', padding: 24, borderRadius: 8, maxWidth: 400, margin: '0 auto' }}>
            <h2>Trade SPOT/USDT</h2>
            <div style={{ marginBottom: 12 }}>
                <strong>Current Price: </strong>
                {currentPrice ? `$${currentPrice}` : 'Loading...'}
                <button style={{ marginLeft: 8 }} onClick={() => setRefresh(r => r + 1)} disabled={loading}>↻</button>
            </div>
            {openTrade ? (
                <div style={{ marginBottom: 16 }}>
                    <div>Open Trade: <b>{openTrade.direction.toUpperCase()}</b> {openTrade.purchaseAmount} SPOT @ ${openTrade.openPrice}</div>
                    <button onClick={handleCloseTrade} disabled={loading} style={{ marginTop: 8 }}>Close Trade</button>
                </div>
            ) : (
                <>
                    <div style={{ marginBottom: 12 }}>
                        <label>Amount (SPOT):
                            <input
                                type="number"
                                value={amount}
                                min={1}
                                onChange={e => setAmount(e.target.value)}
                                style={{ marginLeft: 8 }}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Type:
                            <select value={transactionType} onChange={e => setTransactionType(e.target.value as 'buy' | 'sell')} style={{ marginLeft: 8 }}>
                                <option value="buy">Buy</option>
                                <option value="sell">Sell</option>
                            </select>
                        </label>
                    </div>
                    <button onClick={handleTrade} disabled={loading}>Open Trade</button>
                </>
            )}
            {message && <p style={{ marginTop: 16, color: '#ffb347' }}>{message}</p>}
        </div>
    );
};

export default Trade;