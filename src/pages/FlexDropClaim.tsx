import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const FlexDropClaim: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already' | 'expired' | 'notoken'>('idle');
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const claimFlex = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus('notoken');
        return;
      }
      setStatus('loading');
      try {
        const res = await axios.post(`https://api.tradespot.online/api/flex-drop/claim/${linkId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAmount(res.data.amount);
        setStatus('success');
      } catch (err: any) {
        if (err.response?.status === 403) setStatus('already');
        else if (err.response?.status === 410) setStatus('expired');
        else setStatus('error');
        setError(err.response?.data?.message || 'Error claiming flex drop');
      }
    };
    if (linkId) claimFlex();
  }, [linkId]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f9fc, #e0eafc)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Segoe UI, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        padding: '30px 20px',
        textAlign: 'center',
        transition: 'all 0.3s ease-in-out',
      }}>
        <h2 style={{ marginBottom: 16, fontWeight: 700, color: '#2c3e50', fontSize: '1.6rem' }}>🎁 Flex Drop</h2>

        {status === 'loading' && (
          <>
            <div className="loader" style={{
              margin: '30px auto',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              width: 40,
              height: 40,
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: 12, color: '#555' }}>Claiming your flex...</p>
          </>
        )}

        {status === 'success' && (
          <div style={{ color: 'green', fontSize: 22 }}>
            <p>You received</p>
            <p style={{ fontSize: 32, fontWeight: 'bold' }}>{amount} FLEX! 🎉</p>
          </div>
        )}

        {status === 'already' && (
          <p style={{ color: 'orange', fontWeight: 500 }}>
            You have already claimed this flex drop.
          </p>
        )}

        {status === 'expired' && (
          <p style={{ color: 'red', fontWeight: 500 }}>
            This flex drop link has expired.
          </p>
        )}

        {status === 'notoken' && (
          <p style={{ color: 'red', fontWeight: 500 }}>
            You must be logged in to claim this flex drop.
          </p>
        )}

        {status === 'error' && (
          <p style={{ color: 'red', fontWeight: 500 }}>{error}</p>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 500px) {
            div {
              font-size: 90%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default FlexDropClaim;
