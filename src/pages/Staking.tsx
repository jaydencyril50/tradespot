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
      {/* Staking page will be implemented here */}
    </div>
  );
};

export default Staking;
