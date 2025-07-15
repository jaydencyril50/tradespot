import React from 'react';

const Staking: React.FC = () => {
  return (
    <div className="staking-root" style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '48px' }}>
      {/* Header Bar */}
      <div className="staking-header" style={{ background: 'var(--card-bg)', borderBottom: '1.5px solid var(--primary)', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
       <span className="staking-header-title" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 22, marginLeft: 24 }}>
  STAKE
</span>
      </div>
      {/* Staking Cards */}
      <div className="staking-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', justifyContent: 'flex-start', marginTop: 32, marginLeft: 24, marginRight: 24 }}>
        {[
          { label: '7 DAYS', days: 7 },
          { label: '15 DAYS', days: 15 },
          { label: '30 DAYS', days: 30 },
          { label: '120 DAYS', days: 120 },
          { label: '365 DAYS', days: 365 },
        ].map((option) => (
          <div
            key={option.days}
            className="staking-card"
            style={{
              background: 'var(--card-bg)',
              borderRadius: 0,
              boxShadow: 'var(--card-shadow)',
              border: '1px solid rgba(120,140,180,0.18)',
              padding: '14px 16px',
              width: '100%',
              maxWidth: 320,
              textAlign: 'center',
              margin: '0 auto',
              fontFamily: 'inherit',
              height: 110,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 1,
              transition: 'box-shadow 0.2s',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', letterSpacing: 1 }}>{option.label}</span>
          </div>
        ))}
        <style>{`
          @media (max-width: 600px) {
            .staking-cards {
              gap: 1.1rem !important;
              margin-left: 4px !important;
              margin-right: 4px !important;
            }
            .staking-card {
              max-width: 90vw !important;
              width: 90vw !important;
              height: 100px !important;
              padding: 6px 2vw !important;
              font-size: 0.95rem !important;
              margin: 0 auto 0 auto !important;
            }
            .staking-header-title {
              font-size: 1.45rem !important;
              margin-left: 8px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Staking;
