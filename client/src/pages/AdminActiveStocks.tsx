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
  const [search, setSearch] = useState('');

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
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          STOCK MANAGEMENT
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        {/* Search Bar */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search stocks..."
          style={{ maxWidth: 365, width: '100%', padding: 8, fontSize: 15, border: '1px solid #e3e6ef', borderRadius: 0, marginBottom: 0 }}
        />
        {loading && <div style={{ color: '#1e3c72', fontWeight: 500 }}>Loading...</div>}
        {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {!loading && !error && activeStocks.filter(stock =>
          stock.email.toLowerCase().includes(search.toLowerCase()) ||
          stock.spotid.toLowerCase().includes(search.toLowerCase())
        ).length === 0 && (
          <div style={{ color: '#888', fontSize: 16, textAlign: 'center', margin: '40px 0' }}>No stock plans found.</div>
        )}
        {!loading && !error && activeStocks.filter(stock =>
          stock.email.toLowerCase().includes(search.toLowerCase()) ||
          stock.spotid.toLowerCase().includes(search.toLowerCase())
        ).length > 0 && (
          activeStocks.filter(stock =>
            stock.email.toLowerCase().includes(search.toLowerCase()) ||
            stock.spotid.toLowerCase().includes(search.toLowerCase())
          ).map((stock) => {
            const isCompleted = Boolean((stock as any).completed);
            return (
              <div
                key={stock._id}
                style={{
                  background: '#fff',
                  borderRadius: 0,
                  boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
                  border: '1px solid #e3e6ef',
                  padding: '12px 16px',
                  minWidth: 200,
                  maxWidth: 420,
                  width: '100%',
                  textAlign: 'center',
                  marginBottom: 0,
                  fontFamily: 'inherit',
                  height: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: '#25324B', fontSize: '1.1rem', letterSpacing: 1 }}>Spot ID: {stock.spotid}</span>
                  <span style={{ color: isCompleted ? '#27ae60' : '#1e3c72', fontSize: 18, fontWeight: 700, marginLeft: 8 }}>{isCompleted ? '✔️' : '⏳'}</span>
                </div>
                <div style={{ fontSize: '1.05rem', color: '#1e3c72', fontWeight: 600, marginBottom: 2 }}>
                  {stock.email}
                </div>
                <div style={{ fontSize: '1rem', color: '#555', marginBottom: 2 }}>
                  Amount: {stock.purchaseAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '1rem', color: '#555', marginBottom: 2 }}>
                  Profits: {stock.dailyProfits?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '1rem', color: isCompleted ? '#27ae60' : '#1e3c72', marginBottom: 2, fontWeight: 600 }}>
                  Status: {isCompleted ? 'Completed' : 'Active'}
                </div>
                <button
                  style={{ position: 'absolute', top: 10, right: 10, background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 0, padding: '4px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
                  onClick={() => openEditModal(stock)}
                >
                  Edit
                </button>
              </div>
            );
          })
        )}
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
                height: 120px !important;
              }
            }
          `}
        </style>
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
