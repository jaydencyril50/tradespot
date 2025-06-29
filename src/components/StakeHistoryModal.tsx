import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal';

const API = process.env.REACT_APP_API_BASE_URL || '';

interface StakeRecord {
  purchaseAmount: number;
  startDate: string;
  vipLevel: number;
  dailyRate: number;
  durationDays?: number;
}

interface StakeHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

const StakeHistoryModal: React.FC<StakeHistoryModalProps> = ({ open, onClose }) => {
  const [history, setHistory] = useState<StakeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('[StakeHistoryModal] useEffect triggered. open:', open);
    if (!open) return;
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      console.log('[StakeHistoryModal] Fetching stake history...');
      try {
        const token = localStorage.getItem('token');
        console.log('[StakeHistoryModal] Token:', token);
        if (!token) throw new Error('Not authenticated');
        const url = `${API}/api/staking/history`;
        console.log('[StakeHistoryModal] Fetch URL:', url);
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('[StakeHistoryModal] Response status:', res.status);
        let data;
        try {
          data = await res.json();
          console.log('[StakeHistoryModal] Response JSON:', data);
        } catch (jsonErr) {
          console.error('[StakeHistoryModal] Failed to parse JSON:', jsonErr);
          throw new Error('Invalid JSON response');
        }
        if (Array.isArray(data.stakes)) {
          const filtered = data.stakes.filter((t: any) => t.direction === 'stake');
          console.log('[StakeHistoryModal] Filtered stake records:', filtered);
          setHistory(filtered);
        } else {
          console.warn('[StakeHistoryModal] stakes is not an array:', data.stakes);
          setHistory([]);
        }
      } catch (e: any) {
        console.error('[StakeHistoryModal] Error fetching stake history:', e);
        setError('Failed to fetch stake history');
      } finally {
        setLoading(false);
        console.log('[StakeHistoryModal] Loading finished.');
      }
    };
    fetchHistory();
  }, [open]);

  if (!open) {
    console.log('[StakeHistoryModal] Modal not open, returning null.');
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <div className="market-history-modal">
        <div className="market-history-modal-content">
          {/* Header */}
          <button
            onClick={() => {
              console.log('[StakeHistoryModal] Close button clicked.');
              onClose();
            }}
            className="market-history-close"
            aria-label="Close"
          >×</button>
          <div style={{
            background: 'none',
            color: '#232b36',
            padding: '0 0 8px 0',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 1,
            fontFamily: 'inherit',
            borderRadius: 0,
            marginBottom: 10
          }}>
            Stake History
          </div>
          {/* Content */}
          <div style={{
            padding: '0 0 0 0',
            overflowY: 'auto',
            flex: 1,
            textAlign: 'left',
            maxHeight: '50vh',
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#888' }}>Loading...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', color: '#e74c3c' }}>{error}</div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888' }}>No stake records found.</div>
            ) : (
              <div className="market-history-table-scroll">
                {history.map((rec, i) => {
                  // Log each record before rendering
                  console.log('[StakeHistoryModal] Rendering record:', rec);
                  // Calculate days remaining if durationDays and startDate are present
                  let daysRemaining = null;
                  if (rec.durationDays && rec.startDate) {
                    const start = new Date(rec.startDate);
                    const end = new Date(start.getTime() + rec.durationDays * 24 * 60 * 60 * 1000);
                    const now = new Date();
                    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (diff > 0) daysRemaining = diff;
                  }
                  return (
                    <div key={i} style={{
                      background: '#f6f9fe',
                      borderRadius: 6,
                      boxShadow: '0 2px 8px 0 rgba(30,60,114,0.10)',
                      border: '1px solid #e3e6ef',
                      padding: '10px 14px',
                      marginBottom: 12,
                      fontFamily: 'inherit',
                    }}>
                      <div style={{ fontWeight: 700, color: '#25324B', fontSize: '1.05rem', marginBottom: 2 }}>
                        VIP {rec.vipLevel || 1} Stake
                      </div>
                      <div style={{ fontSize: '1.02rem', color: '#10c98f', fontWeight: 600, marginBottom: 2 }}>
                        +{rec.purchaseAmount} SPOT @ {(rec.dailyRate * 100).toFixed(2)}%
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 2 }}>
                        {rec.startDate ? new Date(rec.startDate).toLocaleString() : ''}
                      </div>
                      {rec.durationDays && (
                        <div style={{ fontSize: '0.93rem', color: '#888' }}>
                          Duration: {rec.durationDays} days
                          {daysRemaining !== null && (
                            <span style={{ color: '#10c98f', marginLeft: 8 }}>
                              | {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StakeHistoryModal;
