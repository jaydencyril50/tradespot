import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const API = process.env.REACT_APP_API_BASE_URL || '';

const NoticeModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/announcement`);
        const data = await res.json();
        setNotice(data.notice || '');
        setOpen(!!data.notice);
      } catch {
        setNotice('');
        setOpen(false);
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
    // Optionally, poll or use websockets for real-time updates
  }, [API]);

  if (!open || !notice) return null;

  return (
    <Modal onClose={() => setOpen(false)}>
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 8px 32px 0 rgba(30,60,114,0.18)',
          border: 'none',
          padding: 0,
          minWidth: 240,
          maxWidth: 380,
          width: '85vw',
          maxHeight: '70vh',
          overflow: 'hidden',
          fontFamily: 'inherit',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          background: '#25324B',
          color: '#fff',
          padding: '10px 0 8px 0',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 1,
          fontFamily: 'inherit',
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          position: 'relative',
        }}>
          TRADESPOT NEWS🌍 
          <button
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              top: 6,
              right: 8,
              background: 'none',
              border: 'none',
              fontSize: 13,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 400,
              lineHeight: 1,
            }}
            aria-label="Close"
          >×</button>
        </div>
        {/* Content */}
        <div style={{
          padding: '28px 32px 18px 32px',
          overflowY: 'auto',
          flex: 1,
          textAlign: 'left',
          maxHeight: '60vh',
        }} className="notice-modal-content">
          {/* Title (if present) */}
          <div style={{
            color: '#e74c3c',
            fontWeight: 700,
            fontSize: 32,
            textAlign: 'center',
            marginBottom: 12,
            fontFamily: 'inherit',
          }} className="notice-modal-title">{notice.split('\n')[0]}</div>
          {/* Body */}
          <div style={{
            color: '#25324B',
            fontSize: 20,
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            marginBottom: 0,
            wordBreak: 'break-word',
          }} className="notice-modal-body">{notice.split('\n').slice(1).join('\n')}</div>
        </div>
        {/* Bottom blue bar for beauty */}
        <div style={{
          background: '#25324B',
          height: 20,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          width: '100%',
        }} />
        {/* Responsive style for mobile */}
        <style>{`
          @media (max-width: 600px) {
            div[style*='box-shadow'] {
              max-width: 92vw !important;
              min-width: 0 !important;
              width: 92vw !important;
              margin-left: 4vw !important;
              margin-right: 6vw !important;
              padding: 0 !important;
              /* Remove position, top, left, transform to allow parent modal to center */
            }
            .notice-modal-content {
              padding: 12px 3vw 8px 3vw !important;
              max-height: 60vh !important;
              overflow-y: auto !important;
            }
            .notice-modal-header {
              font-size: 18px !important;
              padding: 10px 0 8px 0 !important;
            }
            .notice-modal-title {
              font-size: 20px !important;
            }
            .notice-modal-body {
              font-size: 15px !important;
              padding: 0 2vw !important;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
};

export default NoticeModal;
