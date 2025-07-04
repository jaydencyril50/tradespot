import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL;

const OrderPage: React.FC = () => {
  const location = useLocation();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<'pending' | 'completed' | 'loading'>('loading');
  const [timer, setTimer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [balances, setBalances] = useState<{ usdt: number; spot: number } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete order (move above useEffect for scope)
  const completeOrder = async () => {
    if (!order) return;
    setStatus('loading');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.patch(`${API}/api/p2p/orders/${order._id}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setOrder(res.data.order);
      setStatus('completed');
      setBalances({ usdt: res.data.usdtBalance, spot: res.data.spotBalance });
    } catch {
      setStatus('pending');
    }
  };

  // Helper to fetch latest order (or by ID)
  const fetchOrder = async (orderId?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      if (orderId) {
        // Fetch all orders and find by ID
        const res = await axios.get(`${API}/api/p2p/orders`, { headers: { Authorization: `Bearer ${token}` } });
        const found = res.data.orders.find((o: any) => o._id === orderId);
        if (found) setOrder(found);
        else setOrder(res.data.orders[0] || null);
      } else {
        const res = await axios.get(`${API}/api/p2p/orders`, { headers: { Authorization: `Bearer ${token}` } });
        setOrder(res.data.orders[0] || null);
      }
      setStatus('pending');
    } catch {
      setOrder(null);
      setStatus('loading');
    }
  };

  // Helper to fetch balances
  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API}/api/portfolio`, { headers: { Authorization: `Bearer ${token}` } });
      setBalances({ usdt: res.data.usdtBalance, spot: res.data.spotBalance });
    } catch {}
  };

  // On mount, fetch order
  useEffect(() => {
    const orderId = location.state?.orderId;
    fetchOrder(orderId);
    fetchBalances();
    // eslint-disable-next-line
  }, []);

  // Start timer when order is loaded and pending
  useEffect(() => {
    if (!order || order.status !== 'pending') return;
    // Random 2–15 min (in seconds)
    const min = 2 * 60, max = 15 * 60;
    const randomSec = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeLeft(randomSec);
    setTimer(randomSec);
  }, [order]);

  // Countdown effect
  useEffect(() => {
    if (timer == null || status !== 'pending') return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev == null) return null;
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          completeOrder();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line
  }, [timer, status]);

  // Format time
  const formatTime = (sec: number | null) => {
    if (sec == null) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f6f9fe',
        padding: '16px 24px 10px 18px',
        border: '1.5px solid #232b36',
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0
      }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          MY ORDER
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 32 }}>
        <div style={{
          background: '#fff',
          borderRadius: 0,
          boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
          border: '1px solid #e3e6ef',
          padding: '24px 32px',
          minWidth: 200,
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          marginBottom: 14,
          fontFamily: 'inherit',
        }}>
          {!order && <div style={{ color: '#888', fontSize: 18 }}>No active order found.</div>}
          {order && status === 'pending' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#1e3c72', marginBottom: 10 }}>Buyer making payment…</div>
              <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Order ID: <b>{order._id}</b></div>
              <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Amount: <b>{order.spotAmount} SPOT</b> @ <b>{order.price} USDT/SPOT</b></div>
              <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>You will pay: <b>{order.usdtAmount} USDT</b></div>
              <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Status: <span style={{ color: '#f1c40f', fontWeight: 700 }}>Pending</span></div>
              <div style={{ fontSize: 15, color: '#888', marginTop: 12 }}>Estimated time: <b>{formatTime(timeLeft)}</b></div>
            </>
          )}
          {order && status === 'completed' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#27ae60', marginBottom: 10 }}>Order Complete ✅</div>
              <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Order ID: <b>{order._id}</b></div>
              <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Amount: <b>{order.spotAmount} SPOT</b> @ <b>{order.price} USDT/SPOT</b></div>
              <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>You paid: <b>{order.usdtAmount} USDT</b></div>
              <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Status: <span style={{ color: '#27ae60', fontWeight: 700 }}>Completed</span></div>
              {balances && (
                <div style={{ marginTop: 18, fontSize: 15, color: '#25324B' }}>
                  <div><b>New USDT Balance:</b> {balances.usdt}</div>
                  <div><b>New SPOT Balance:</b> {balances.spot}</div>
                </div>
              )}
            </>
          )}
          {order && status === 'loading' && (
            <div style={{ color: '#1e3c72', fontWeight: 600, fontSize: 18 }}>Processing…</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
