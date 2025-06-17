import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

interface TrashItem {
  _id: string;
  text: string;
  createdAt: string;
}

const Trash: React.FC = () => {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${API}/api/admin/trash`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.items || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!input.trim()) return;
    // Prevent duplicate items
    if (items.some(item => item.text.trim().toLowerCase() === input.trim().toLowerCase())) {
      setError('Duplicate item: This text already exists in trash.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');
      await axios.post(`${API}/api/admin/trash`, { text: input }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInput('');
      setSuccess('Saved!');
      fetchItems();
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', background: '#fff', boxShadow: '0 4px 32px rgba(30,60,114,0.18)', padding: 24, borderRadius: 0, minHeight: 400 }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Admin Trash Bin</h2>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter text to save..."
          style={{ flex: 1, padding: 8, fontSize: 15, border: '1px solid #e3e6ef', borderRadius: 4 }}
        />
        <button type="submit" style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }} disabled={loading}>
          Save
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
      {loading && <div>Loading...</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => (
          <li key={item._id} style={{ borderBottom: '1px solid #eaf1fb', padding: '10px 0', color: '#25324B' }}>
            <div>{item.text}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{new Date(item.createdAt).toLocaleString()}</div>
          </li>
        ))}
        {!loading && items.length === 0 && <li>No items in trash.</li>}
      </ul>
    </div>
  );
};

export default Trash;
