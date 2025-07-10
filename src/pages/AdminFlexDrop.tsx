import React, { useState } from 'react';
import axios from 'axios';

const AdminFlexDrop: React.FC = () => {
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLink('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/flex-drop/create',
        { minAmount: Number(minAmount), maxAmount: Number(maxAmount), expiresAt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLink(`${window.location.origin}/flex-drop/${res.data.linkId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating flex drop link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-flex-drop">
      <h2>Create Flex Drop Link</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Min Amount:</label>
          <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} required />
        </div>
        <div>
          <label>Max Amount:</label>
          <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} required />
        </div>
        <div>
          <label>Expires At:</label>
          <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Link'}</button>
      </form>
      {link && (
        <div style={{ marginTop: 20 }}>
          <strong>Flex Drop Link:</strong> <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </div>
  );
};

export default AdminFlexDrop;
