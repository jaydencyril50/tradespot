import axios from 'axios';
const API = process.env.REACT_APP_API_BASE_URL;

export const placeOrder = async (
  side: 'buy' | 'sell',
  price: number,
  amount: number,
  type: 'market' | 'limit',
  token: string
) => {
  // FIX: Use correct backend endpoint for order placement
  const res = await axios.post(`${API}/api/trade/order`, { side, price, amount, type }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const cancelOrder = async (orderId: string, token: string) => {
  const res = await axios.post(`${API}/api/trade/cancel`, { orderId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const fetchOrderBook = async () => {
  const res = await axios.get(`${API}/api/trade/orderbook`);
  return res.data;
};

export const fetchRecentTrades = async () => {
  const res = await axios.get(`${API}/api/trade/recent`);
  return res.data;
};

export const fetchMyOrders = async (token: string) => {
  const res = await axios.get(`${API}/api/trade/myorders`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const fetchMyTrades = async (token: string) => {
  const res = await axios.get(`${API}/api/trade/mytrades`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};
