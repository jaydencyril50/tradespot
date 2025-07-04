import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL;

const OrderPage: React.FC = () => {
  const location = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [status, setStatus] = useState<'pending' | 'completed' | 'loading' | 'cancelled'>('loading');
  const [timer, setTimer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [balances, setBalances] = useState<{ usdt: number; spot: number } | null>(null);
  const [filter, setFilter] = useState<'pending' | 'completed' | 'cancelled' | 'all'>('all');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete order (move above useEffect for scope)
  const completeOrder = async () => {
    if (!selectedOrder) return;
    setStatus('loading');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.patch(`${API}/api/p2p/orders/${selectedOrder._id}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedOrder(res.data.order);
      setStatus('completed');
      setBalances({ usdt: res.data.usdtBalance, spot: res.data.spotBalance });
    } catch {
      setStatus('pending');
    }
  };

  // Cancel order (user-initiated)
  const cancelOrder = async (order?: any) => {
    if (!order) order = selectedOrder;
    if (!order) return;
    setStatus('loading');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.patch(`${API}/api/p2p/orders/${order._id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedOrder(res.data.order);
      setStatus('cancelled');
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
        if (found) setSelectedOrder(found);
        else setSelectedOrder(res.data.orders[0] || null);
      } else {
        const res = await axios.get(`${API}/api/p2p/orders`, { headers: { Authorization: `Bearer ${token}` } });
        setSelectedOrder(res.data.orders[0] || null);
      }
      setStatus('pending');
    } catch {
      setSelectedOrder(null);
      setStatus('loading');
    }
  };

  // Fetch all orders for the user
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${API}/api/p2p/orders`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data.orders || []);
      // Default to most recent order
      setSelectedOrder(res.data.orders[0] || null);
    } catch {
      setOrders([]);
      setSelectedOrder(null);
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

  // On mount, fetch all orders
  useEffect(() => {
    fetchOrders();
    fetchBalances();
    // eslint-disable-next-line
  }, []);

  // Start timer when order is loaded and pending
  useEffect(() => {
    if (!selectedOrder || selectedOrder.status !== 'pending' || !selectedOrder.autoCompleteAt) return;
    const end = new Date(selectedOrder.autoCompleteAt).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((end - now) / 1000));
    setTimeLeft(diff);
    setTimer(diff);
  }, [selectedOrder]);

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

  // Filtered orders based on filter state
  const filteredOrders = filter === 'all' ? orders : orders.filter((o: any) => o.status === filter);

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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 7 }}>
        <div style={{ marginBottom: 10, width: '100%', maxWidth: 380, marginTop: 7 }}>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: filter === 'all' ? '2px solid #1e3c72' : '1px solid #e3e6ef',
                background: filter === 'all' ? '#f6f9fe' : '#fff',
                color: '#25324B',
                fontWeight: filter === 'all' ? 700 : 500,
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: filter === 'pending' ? '2px solid #1e3c72' : '1px solid #e3e6ef',
                background: filter === 'pending' ? '#f6f9fe' : '#fff',
                color: '#25324B',
                fontWeight: filter === 'pending' ? 700 : 500,
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: filter === 'cancelled' ? '2px solid #1e3c72' : '1px solid #e3e6ef',
                background: filter === 'cancelled' ? '#f6f9fe' : '#fff',
                color: '#25324B',
                fontWeight: filter === 'cancelled' ? 700 : 500,
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              Cancelled
            </button>
            <button
              onClick={() => setFilter('completed')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: filter === 'completed' ? '2px solid #1e3c72' : '1px solid #e3e6ef',
                background: filter === 'completed' ? '#f6f9fe' : '#fff',
                color: '#25324B',
                fontWeight: filter === 'completed' ? 700 : 500,
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              Completed
            </button>
          </div>
        </div>
        {/* Show all filtered orders as cards */}
        {filteredOrders.length === 0 && (
          <div style={{ color: '#888', fontSize: 18, marginTop: 30 }}>No orders found.</div>
        )}
        {filteredOrders.map((order: any) => (
          <div key={order._id} style={{
            background: '#fff',
            borderRadius: 0,
            boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
            border: '1px solid #e3e6ef',
            padding: '12px 16px',
            minWidth: 200,
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            marginBottom: 14,
            fontFamily: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {order.status === 'pending' && (
              <>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#1e3c72', marginBottom: 10 }}>Buyer making payment…</div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Order ID: <b>{order._id}</b></div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Amount: <b>{order.spotAmount} SPOT</b> @ <b>{order.price} USDT/SPOT</b></div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>You will pay: <b>{order.usdtAmount} USDT</b></div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Status: <span style={{ color: '#f1c40f', fontWeight: 700 }}>Pending</span></div>
                <button onClick={() => cancelOrder(order)} style={{ marginTop: 1, padding: '6px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 5, fontWeight: 600, fontSize: 14, cursor: 'pointer', width: 140 }}>Cancel Order</button>
              </>
            )}
            {order.status === 'cancelled' && (
              <>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#e74c3c', marginBottom: 10 }}>Order Cancelled ❌</div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Order ID: <b>{order._id}</b></div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Amount: <b>{order.spotAmount} SPOT</b> @ <b>{order.price} USDT/SPOT</b></div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>You would have paid: <b>{order.usdtAmount} USDT</b></div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Status: <span style={{ color: '#e74c3c', fontWeight: 700 }}>Cancelled</span></div>
              </>
            )}
            {order.status === 'completed' && (
              <>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#27ae60', marginBottom: 10 }}>Order Complete ✅</div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Order ID: <b>{order._id}</b></div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Amount: <b>{order.spotAmount} SPOT</b> @ <b>{order.price} USDT/SPOT</b></div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>You paid: <b>{order.usdtAmount} USDT</b></div>
                <div style={{ fontSize: 16, color: '#25324B', marginBottom: 8 }}>Status: <span style={{ color: '#27ae60', fontWeight: 700 }}>Completed</span></div>
              </>
            )}
            {order.status === 'loading' && (
              <div style={{ color: '#1e3c72', fontWeight: 600, fontSize: 18 }}>Processing…</div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 500px) {
          .order-card {
            padding: 16px 2vw !important;
            max-width: 98vw !important;
            font-size: 15px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderPage;
