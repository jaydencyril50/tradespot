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
  const [search, setSearch] = useState('');

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

  // Delete a trash item
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this trash item?')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');
      await axios.delete(`${API}/api/admin/trash/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Deleted!');
      setItems(items.filter(item => item._id !== id));
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          Admin Trash Bin
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 0, maxWidth: 380, width: '100%' }}>
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
        {/* Search Bar */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search saved items..."
          style={{ maxWidth: 363, width: '100%', padding: 8, fontSize: 15, border: '1px solid #e3e6ef', borderRadius: 4, marginBottom: 0 }}
        />
        {error && <div style={{ color: 'red', marginBottom: 0, maxWidth: 380, width: '100%' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 0, maxWidth: 380, width: '100%' }}>{success}</div>}
        {loading && <div>Loading...</div>}
        {/* Trash Items */}
        {items.filter(item => item.text.toLowerCase().includes(search.toLowerCase())).length === 0 && !loading && (
          <div style={{ color: '#888', fontSize: 15, maxWidth: 380, width: '100%', textAlign: 'center' }}>No items in trash.</div>
        )}
        {items.filter(item => item.text.toLowerCase().includes(search.toLowerCase())).map(item => (
          <div key={item._id} style={{
            background: '#fff',
            borderRadius: 0,
            boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
            border: '1px solid #e3e6ef',
            padding: '12px 16px',
            minWidth: 200,
            maxWidth: 380,
            width: '100%',
            textAlign: 'left',
            marginBottom: 0,
            fontFamily: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 4,
          }}>
            <div style={{ fontWeight: 600, color: '#25324B', fontSize: 16 }}>{item.text}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{new Date(item.createdAt).toLocaleString()}</div>
            <button onClick={() => handleDelete(item._id)} style={{ marginTop: 4, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-end' }}>Delete</button>
          </div>
        ))}
        <style>
          {`
            @media (max-width: 600px) {
              div[style*="box-shadow"] {
                max-width: 90vw !important;
                min-width: 0 !important;
                width: 90vw !important;
                margin-left: 5vw !important;
                margin-right: 5vw !important;
                padding: 10px 2vw !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Trash;
