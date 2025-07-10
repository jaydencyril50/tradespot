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
        const res = await axios.post(`/api/flex-drop/claim/${linkId}`, {}, {
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
    <div className="flex-drop-claim-page" style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}>
      <h2>Flex Drop</h2>
      {status === 'loading' && <p>Claiming your flex...</p>}
      {status === 'success' && <>
        <p style={{ fontSize: 22, color: 'green' }}>You received <b>{amount}</b> FLEX! 🎉</p>
      </>}
      {status === 'already' && <p style={{ color: 'orange' }}>You have already claimed this flex drop.</p>}
      {status === 'expired' && <p style={{ color: 'red' }}>This flex drop link has expired.</p>}
      {status === 'notoken' && <p style={{ color: 'red' }}>You must be logged in to claim this flex drop.</p>}
      {status === 'error' && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FlexDropClaim;
