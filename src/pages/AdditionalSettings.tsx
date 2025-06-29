import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdditionalSettings: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#f6f9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: '#fff',
        borderRadius: 0,
        boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
        padding: '12px 16px',
        minWidth: 200,
        maxWidth: 380,
        width: '100%',
        textAlign: 'center',
        marginBottom: 0,
        fontFamily: 'inherit',
        height: 220,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#25324B', marginBottom: 4, letterSpacing: 1 }}>Additional Settings</div>
        <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 8 }}>
          Configure extra options and features here.
        </div>
        <button
          style={{
            border: 'none',
            borderRadius: 0,
            padding: '10px 0',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: 4,
            background: '#888',
            color: '#fff',
            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
            transition: 'background 0.2s',
            alignSelf: 'center',
            width: '100%'
          }}
          // onClick={() => {}}
        >
         Change theme
        </button>
        <button
          style={{
            border: 'none',
            borderRadius: 0,
            padding: '10px 0',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: 8,
            background: '#888',
            color: '#fff',
            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
            transition: 'background 0.2s',
            alignSelf: 'center',
            width: '100%'
          }}
          // onClick={() => {}}
        >
         Change language
        </button>
      </div>
    </div>
  );
};

export default AdditionalSettings;
