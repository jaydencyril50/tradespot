import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://api.tradespot.online';

const AdminPlatformStats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API}/api/admin/platform-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        setError('Failed to fetch platform stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', border: '1.5px solid rgba(120,130,150,0.13)', borderTop: 0, borderLeft: 0, borderRight: 0, borderBottom: '2.5px solid #1e3c72' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', letterSpacing: 1, fontFamily: 'serif' }}>
          STATISTICS
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20, marginBottom: 40 }}>
        {loading && <div style={{ color: 'var(--primary)', fontWeight: 500 }}>Loading...</div>}
        {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {!loading && !error && stats && (
          <>
            <div
              style={{
                background: 'var(--card-bg)',
                borderRadius: 0,
                boxShadow: 'var(--card-shadow)',
                border: '1px solid rgba(120,130,150,0.13)',
                padding: '14px 18px',
                minWidth: 200,
                maxWidth: 300,
                width: '100%',
                textAlign: 'center',
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                height: 70
              }}
            >
              <div style={{ fontSize: '1.1rem', color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>
                TOTAL DEPOSITS
              </div>
              <div style={{ fontSize: '1.2rem', color: '#27ae60', fontWeight: 800 }}>
                {stats.totalDeposits} USDT
              </div>
            </div>
            <div
              style={{
                background: 'var(--card-bg)',
                borderRadius: 0,
                boxShadow: 'var(--card-shadow)',
                border: '1px solid rgba(120,130,150,0.13)',
                padding: '14px 18px',
                minWidth: 200,
                maxWidth: 300,
                width: '100%',
                textAlign: 'center',
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                height: 70
              }}
            >
              <div style={{ fontSize: '1.1rem', color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>
                TOTAL WITHDRAWALS
              </div>
              <div style={{ fontSize: '1.2rem', color: '#e74c3c', fontWeight: 800 }}>
                {stats.totalWithdrawals} USDT
              </div>
            </div>
            <div
              style={{
                background: 'var(--card-bg)',
                borderRadius: 0,
                boxShadow: 'var(--card-shadow)',
                border: '1px solid rgba(120,130,150,0.13)',
                padding: '14px 18px',
                minWidth: 200,
                maxWidth: 300,
                width: '100%',
                textAlign: 'center',
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                height: 70
              }}
            >
              <div style={{ fontSize: '1.1rem', color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>
                TOTAL USERS
              </div>
              <div style={{ fontSize: '1.2rem', color: '#1e3c72', fontWeight: 800 }}>
                {stats.totalUsers}
              </div>
            </div>
            <div
              style={{
                background: 'var(--card-bg)',
                borderRadius: 0,
                boxShadow: 'var(--card-shadow)',
                border: '1px solid rgba(120,130,150,0.13)',
                padding: '14px 18px',
                minWidth: 200,
                maxWidth: 300,
                width: '100%',
                textAlign: 'center',
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                height: 70
              }}
            >
              <div style={{ fontSize: '1.1rem', color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>
                TOTAL P2P TRADES
              </div>
              <div style={{ fontSize: '1.2rem', color: '#f39c12', fontWeight: 800 }}>
                {stats.totalP2PTrades}
              </div>
            </div>
            <style>{`
                @media (max-width: 600px) {
                  div[style*="box-shadow"] {
                    max-width: 95vw !important;
                    min-width: 0 !important;
                    width: 95vw !important;
                    margin-left: 2vw !important;
                    margin-right: 2vw !important;
                    padding: 8px 2vw !important;
                    height: 60px !important;
                  }
                }
              `}</style>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPlatformStats;
