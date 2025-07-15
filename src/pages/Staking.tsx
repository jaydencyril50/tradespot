import React from 'react';

const Staking: React.FC = () => {
  return (
    <div className="staking-root" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header Bar */}
      <div className="staking-header" style={{ background: 'var(--card-bg)', borderBottom: '1.5px solid var(--primary)', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
       <span className="staking-header-title" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 22, marginLeft: 24 }}>
  STAKE
</span>
      </div>
      {/* Staking Cards */}
      <div className="staking-cards" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-start', flexWrap: 'wrap', marginTop: 32, marginLeft: 24 }}>
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
              border: '1.5px solid var(--primary)',
              borderRadius: 10,
              boxShadow: 'var(--card-shadow)',
              padding: '28px 32px',
              minWidth: 140,
              minHeight: 90,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 20,
              color: 'var(--primary)',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Staking;
