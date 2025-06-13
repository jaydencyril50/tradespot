import React, { useState, useEffect } from 'react';
import { getTrashItems, addTrashItem, searchTrashItems, TrashItem } from '../services/trashService';
import './AdminDashboard.css';

const AdminTrash: React.FC = () => {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const runSearch = async () => {
      setLoading(true);
      try {
        let results = [];
        if (search.trim()) {
          results = await searchTrashItems(search);
        } else {
          results = await getTrashItems(); // avoid duplicate logic
        }
        setItems(results);
        setError('');
      } catch (err) {
        setError('Failed to search trash items');
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    const result = await addTrashItem(input);
    if (!result.success) {
      setError(result.error || 'Error');
      setLoading(false);
      return;
    }
     setError('');
    setInput('');
    // Refresh list using current search
    const updated = await searchTrashItems(search);
    setItems(updated);
    setLoading(false);
  };

  return (
    <div className="admin-dashboard-page">
      <h1 className="admin-dashboard-title">Trash Bin</h1>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); }}
          placeholder="Enter text to save..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{ padding: '8px 16px', background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 4 }}
          disabled={loading}
        >
          Save
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search trash..."
        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 16 }}
      />
      <div style={{ minHeight: 120 }}>
        {loading ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No items found.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map(item => (
              <li key={item._id} style={{
                background: '#f7f7f7',
                marginBottom: 10,
                padding: 12,
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(30,60,114,0.08)'
              }}>
                <div style={{ fontSize: 15 }}>{item.content}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminTrash;
