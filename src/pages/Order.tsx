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
      const endpoint = selectedOrder.type === 'sell'
        ? `${API}/api/p2p/sell-orders/${selectedOrder._id}/complete`
        : `${API}/api/p2p/orders/${selectedOrder._id}/complete`;
      const res = await axios.patch(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
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
      const endpoint = order.type === 'sell'
        ? `${API}/api/p2p/sell-orders/${order._id}/cancel`
        : `${API}/api/p2p/orders/${order._id}/cancel`;
      const res = await axios.patch(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedOrder(res.data.order);
      setStatus('cancelled');
      // Refresh the page after cancelling
      window.location.reload();
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

  // --- Live countdown for all pending orders ---
  const [orderCountdowns, setOrderCountdowns] = useState<{ [orderId: string]: number }>({});
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize countdowns when orders change
  useEffect(() => {
    const now = Date.now();
    const countdowns: { [orderId: string]: number } = {};
    orders.forEach(order => {
      if (order.status === 'pending' && order.displayCountdownEndsAt) {
        const end = new Date(order.displayCountdownEndsAt).getTime();
        const diff = Math.max(0, Math.floor((end - now) / 1000));
        countdowns[order._id] = diff;
      }
    });
    setOrderCountdowns(countdowns);
  }, [orders]);

  // Update all countdowns every second
  useEffect(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setOrderCountdowns(prev => {
        const updated: { [orderId: string]: number } = {};
        Object.entries(prev).forEach(([orderId, time]) => {
          updated[orderId] = time > 0 ? time - 1 : 0;
        });
        return updated;
      });
    }, 1000);
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [orders]);

  // Poll orders every 5 seconds to update status and countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, []);

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--card-bg)',
        padding: '16px 24px 10px 18px',
        border: '1.5px solid #282829',
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0
      }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif' }}>
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
                border: filter === 'all' ? '2px solid var(--primary)' : '1px solid #282829',
                background: filter === 'all' ? 'var(--card-bg)' : 'var(--bg)',
                color: 'var(--text)',
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
                border: filter === 'pending' ? '2px solid var(--primary)' : '1px solid #282829',
                background: filter === 'pending' ? 'var(--card-bg)' : 'var(--bg)',
                color: 'var(--text)',
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
                border: filter === 'cancelled' ? '2px solid var(--primary)' : '1px solid #282829',
                background: filter === 'cancelled' ? 'var(--card-bg)' : 'var(--bg)',
                color: 'var(--text)',
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
                border: filter === 'completed' ? '2px solid var(--primary)' : '1px solid #282829',
                background: filter === 'completed' ? 'var(--card-bg)' : 'var(--bg)',
                color: 'var(--text)',
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
            background: 'var(--card-bg)',
            borderRadius: 0,
            boxShadow: 'var(--card-shadow)',
            border: '1px solid #282829',
            padding: '12px 16px',
            minWidth: 200,
            maxWidth: 360,
            width: '100%',
            textAlign: 'center',
            marginBottom: 14,
            fontFamily: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {/* Show correct info for buy/sell order */}
            {order.status === 'pending' && (
              <>
                <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary)', marginBottom: 10 }}>
                  {order.type === 'buy' ? 'Seller making payment…' : 'Buyer making payment…'}
                </div>
                <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>Order ID: <b>{order._id}</b></div>
                {/* Unified layout for buy and sell */}
                <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>
                  RATE: <b>{order.price} USDT/SPOT</b>
                </div>
                <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>
                  {order.type === 'buy'
                    ? <>DEBIT: <b>{order.usdtAmount} USDT</b> | CREDIT: <b>{order.spotAmount} SPOT</b></>
                    : <>CREDIT: <b>{order.usdtAmount} USDT</b> | DEBIT: <b>{order.spotAmount} SPOT</b> </>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 16, color: 'var(--text)' }}>Status: <span style={{ color: '#f1c40f', fontWeight: 700 }}>Pending</span></div>
                  {/* Countdown timer */}
                  <div style={{ fontSize: 15, color: 'var(--primary)', fontWeight: 600, background: 'var(--bg)', borderRadius: 6, padding: '2px 10px' }}>
                    {orderCountdowns[order._id] != null
                      ? formatTime(orderCountdowns[order._id])
                      : '10m 00s'}
                  </div>
                </div>
                <button onClick={() => cancelOrder(order)} style={{ marginTop: 1, padding: '6px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 5, fontWeight: 600, fontSize: 14, cursor: 'pointer', width: 140 }}>Cancel Order</button>
              </>
            )}
            {order.status === 'cancelled' && (
              <>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#e74c3c', marginBottom: 10 }}>Order Cancelled ❌</div>
                <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>Order ID: <b>{order._id}</b></div>
                <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>RATE: <b>{order.price} USDT/SPOT</b></div>
                {order.type === 'buy' ? (
                  <>
                    <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>DEBIT: <b>{order.usdtAmount} USDT</b> | CREDIT: <b>{order.spotAmount} SPOT</b></div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>CREDIT: <b>{order.usdtAmount} USDT</b> | DEBIT: <b>{order.spotAmount} SPOT</b></div>
                  </>
                )}
                <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>Status: <span style={{ color: '#e74c3c', fontWeight: 700 }}>Cancelled</span></div>
              </>
            )}
            {order.status === 'completed' && (
              <>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#27ae60', marginBottom: 10 }}>Order Complete ✅</div>
                <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>Order ID: <b>{order._id}</b></div>
                <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>RATE: <b>{order.price} USDT/SPOT</b></div>
                {order.type === 'buy' ? (
                  <>
                    <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>COST: <b>{order.usdtAmount} USDT</b> | CREDITED: <b>{order.spotAmount} SPOT</b></div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>CREDITED: <b>{order.usdtAmount} USDT</b> | DEBITED: <b>{order.spotAmount} SPOT</b></div>
                  </>
                )}
                <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>Status: <span style={{ color: '#27ae60', fontWeight: 700 }}>Completed</span></div>
              </>
            )}
            {order.status === 'loading' && (
              <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 18 }}>Processing…</div>
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
