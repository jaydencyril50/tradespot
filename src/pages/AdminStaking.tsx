import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminStaking: React.FC = () => {
  const [stakes, setStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStaking = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get('/api/admin/staking', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStakes(res.data.stakes || []);
      } catch (err: any) {
        setError('Failed to fetch staking records');
      } finally {
        setLoading(false);
      }
    };
    fetchStaking();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          ALL USERS STAKING
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        {loading && <div style={{ color: '#1e3c72', fontWeight: 500 }}>Loading...</div>}
        {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {!loading && !error && stakes.length === 0 && (
          <div style={{ color: '#888', fontSize: 16, textAlign: 'center', margin: '40px 0' }}>No staking records found.</div>
        )}
        {!loading && !error && stakes.length > 0 && (
          stakes.map((stake: any, idx: number) => (
            <div
              key={stake._id || idx}
              style={{
                background: '#fff',
                borderRadius: 0,
                boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
                border: '1px solid #e3e6ef',
                padding: '12px 16px',
                minWidth: 200,
                maxWidth: 480,
                width: '100%',
                textAlign: 'center',
                marginBottom: 0,
                fontFamily: 'inherit',
                height: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: '#25324B', fontSize: '1.1rem', letterSpacing: 1 }}>Staking</span>
              </div>
              <div style={{ fontSize: '1.05rem', color: '#1e3c72', fontWeight: 600, marginBottom: 2 }}>
                {stake.amount} SPOT
              </div>
              <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 2 }}>
                {stake.startDate ? new Date(stake.startDate).toLocaleString() : '-'}
              </div>
              <div style={{ fontSize: '0.95rem', color: '#888', marginBottom: 2 }}>
                User: <b>{stake.userId?.fullName || '-'}</b> | Email: <b>{stake.userId?.email || '-'}</b> | Spot ID: <b>{stake.userId?.spotid || '-'}</b>
              </div>
              <div style={{ fontSize: '0.95rem', color: stake.status === 'active' ? '#27ae60' : '#e67e22', fontWeight: 500 }}>
                Status: {stake.status || '-'}
              </div>
            </div>
          ))
        )}
        <style>
          {`
            @media (max-width: 600px) {
              div[style*="box-shadow"] {
                max-width: 95vw !important;
                min-width: 0 !important;
                width: 95vw !important;
                margin-left: 2.5vw !important;
                margin-right: 2.5vw !important;
                padding: 10px 2vw !important;
                height: 120px !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AdminStaking;
