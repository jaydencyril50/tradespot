import React from 'react';

interface TeamMembersTableModalProps {
  open: boolean;
  onClose: () => void;
  members: { spotid: string; email?: string }[];
}

const TeamMembersTableModal: React.FC<TeamMembersTableModalProps> = ({ open, onClose, members }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(30,44,80,0.18)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 8px 32px 0 rgba(30,60,114,0.18)',
        padding: 24,
        minWidth: 360,
        maxWidth: '100vw',
        minHeight: 440,
        maxHeight: '100vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            fontSize: 22,
            cursor: 'pointer',
            color: '#888',
          }}
          aria-label="Close"
        >
          ×
        </button>
        <h2 style={{ marginBottom: 16, fontSize: '1.1rem', fontWeight: 700, color: '#25324B', letterSpacing: 1 }}>Team Members' Spot IDs</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 18 }}>
            <thead>
              <tr style={{ background: '#f6f9fe' }}>
                <th style={{ padding: 12, border: '1px solid #e3e6ef' }}>Spot ID</th>
                <th style={{ padding: 12, border: '1px solid #e3e6ef' }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan={2} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No team members found.</td></tr>
              ) : (
                members.map((m, idx) => (
                  <tr key={m.spotid + idx}>
                    <td style={{ padding: 12, border: '1px solid #e3e6ef', textAlign: 'center', wordBreak: 'break-all' }}>{m.spotid}</td>
                    <td style={{ padding: 12, border: '1px solid #e3e6ef', textAlign: 'center', wordBreak: 'break-all' }}>{m.email || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <style>{`
          @media (max-width: 600px) {
            div[style*='box-shadow'] {
              min-width: 0 !important;
              width: 98vw !important;
              max-width: 98vw !important;
              min-height: 320px !important;
              max-height: 95vh !important;
              padding: 10px 2vw !important;
            }
            table {
              font-size: 16px !important;
            }
            th, td {
              padding: 8px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TeamMembersTableModal;
