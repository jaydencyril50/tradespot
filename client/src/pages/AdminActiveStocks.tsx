import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';

interface ActiveStockPlan {
  _id: string;
  email: string;
  spotid: string;
  purchaseAmount: number;
  dailyProfits: number;
}

interface EditModalState {
  open: boolean;
  stock: ActiveStockPlan | null;
  purchaseAmount: number;
  dailyProfits: number;
  completed: boolean;
}

const API = process.env.REACT_APP_API_BASE_URL;

const AdminActiveStocks: React.FC = () => {
  const [activeStocks, setActiveStocks] = useState<ActiveStockPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModal, setEditModal] = useState<EditModalState>({
    open: false,
    stock: null,
    purchaseAmount: 0,
    dailyProfits: 0,
    completed: false,
  });

  // Fetch ALL stock plans (active and completed)
  useEffect(() => {
    const fetchAllStocks = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');
        const res = await axios.get(`${API}/api/admin/all-stock-plans`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActiveStocks(res.data.stockPlans || []);
      } catch (e: any) {
        setError(e?.response?.data?.error || e.message || 'Failed to load stock plans');
      } finally {
        setLoading(false);
      }
    };
    fetchAllStocks();
  }, []);

  const openEditModal = (stock: ActiveStockPlan) => {
    setEditModal({
      open: true,
      stock,
      purchaseAmount: stock.purchaseAmount,
      dailyProfits: stock.dailyProfits,
      completed: Boolean((stock as any).completed),
    });
  };

  const closeEditModal = () => setEditModal({ open: false, stock: null, purchaseAmount: 0, dailyProfits: 0, completed: false });

  const handleEditChange = (field: string, value: any) => {
    setEditModal((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editModal.stock) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');
      await axios.put(`${API}/api/admin/stock-plan/${editModal.stock._id}`,
        {
          purchaseAmount: editModal.purchaseAmount,
          dailyProfits: editModal.dailyProfits,
          completed: editModal.completed,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveStocks((prev) =>
        prev.map((s) =>
          s._id === editModal.stock!._id
            ? { ...s, purchaseAmount: editModal.purchaseAmount, dailyProfits: editModal.dailyProfits, completed: editModal.completed }
            : s
        )
      );
      closeEditModal();
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to update stock plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editModal.stock) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');
      await axios.delete(`${API}/api/admin/stock-plan/${editModal.stock._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveStocks((prev) => prev.filter((s) => s._id !== editModal.stock!._id));
      closeEditModal();
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to delete stock plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', boxShadow: '0 4px 32px rgba(30,60,114,0.18)', padding: 24, borderRadius: 0, minHeight: 400 }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Stock Management</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ overflowX: 'auto', maxHeight: 420 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 700 }}>
          <thead>
            <tr style={{ background: '#f7faff' }}>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Email</th>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Spot ID</th>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Amount</th>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Profits</th>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Status</th>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {activeStocks.length === 0 && !loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 18 }}>No stock plans found.</td></tr>
            ) : (
              activeStocks.map((stock) => (
                <tr key={stock._id} style={{ borderBottom: '1px solid #eaf1fb' }}>
                  <td style={{ padding: 10, textAlign: 'center' }}>{stock.email}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{stock.spotid}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{stock.purchaseAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{stock.dailyProfits?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{(stock as any).completed ? 'Completed' : 'Active'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <button
                      style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => openEditModal(stock)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editModal.open && editModal.stock && (
        <Modal onClose={closeEditModal}>
          <h3>Edit Stock Plan</h3>
          <div style={{ marginBottom: 12 }}>
            <label>Purchase Amount:</label>
            <input type="number" value={editModal.purchaseAmount} onChange={e => handleEditChange('purchaseAmount', Number(e.target.value))} style={{ width: 120, marginLeft: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Daily Profits:</label>
            <input type="number" value={editModal.dailyProfits} onChange={e => handleEditChange('dailyProfits', Number(e.target.value))} style={{ width: 120, marginLeft: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Status:</label>
            <select value={editModal.completed ? 'completed' : 'active'} onChange={e => handleEditChange('completed', e.target.value === 'completed')} style={{ marginLeft: 8 }}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <button onClick={handleSave} style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }} disabled={loading}>Save</button>
            <button onClick={handleDelete} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }} disabled={loading}>Delete</button>
            <button onClick={closeEditModal} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminActiveStocks;
