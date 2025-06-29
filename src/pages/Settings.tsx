import React from 'react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          SETTINGS
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        {/* Basic Settings Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 0,
            boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
            border: '1px solid #e3e6ef',
            padding: '12px 16px',
            minWidth: 200,
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            marginBottom: 0,
            fontFamily: 'inherit',
            height: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 4, fontWeight: 700, color: '#25324B', letterSpacing: 1 }}>Basic Settings</h2>
          <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 8 }}>
            Manage your account and preferences here.
          </div>
          <button
            style={{
              border: 'none',
              borderRadius: 6,
              padding: '6px 28px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: 4,
              background: '#888',
              color: '#fff',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
              alignSelf: 'center',
            }}
            onClick={() => navigate('/settings/edit-basic')}
          >
            Edit
          </button>
        </div>
        {/* Privacy Settings Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 0,
            boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
            border: '1px solid #e3e6ef',
            padding: '12px 16px',
            minWidth: 200,
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            marginBottom: 0,
            fontFamily: 'inherit',
            height: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 4, fontWeight: 700, color: '#25324B', letterSpacing: 1 }}>Privacy Settings</h2>
          <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 8 }}>
            Control your privacy and security options here.
          </div>
          <button
            style={{
              border: 'none',
              borderRadius: 6,
              padding: '6px 28px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: 4,
              background: '#888',
              color: '#fff',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
              alignSelf: 'center',
            }}
            onClick={() => navigate('/settings/privacy')}
          >
            Edit
          </button>
        </div>
        {/* Additional Settings Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 0,
            boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
            border: '1px solid #e3e6ef',
            padding: '12px 16px',
            minWidth: 200,
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            marginBottom: 0,
            fontFamily: 'inherit',
            height: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 4, fontWeight: 700, color: '#25324B', letterSpacing: 1 }}>Additional Settings</h2>
          <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 8 }}>
            {/* Placeholder for additional settings content */}
            Configure extra options and features here.
          </div>
          <button
            style={{
              border: 'none',
              borderRadius: 6,
              padding: '6px 28px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: 4,
              background: '#888',
              color: '#fff',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
              alignSelf: 'center',
            }}
            onClick={() => navigate('/settings/additional')}
          >
            Edit
          </button>
        </div>
        <style>
          {`
            @media (max-width: 600px) {
              div[style*="box-shadow"] {
                max-width: 90vw !important;
                min-width: 0 !important;
                width: 90vw !important;
                margin-left: 5vw !important;
                margin-right: 5vw !important;
                padding: 10px 2vw !important;
                height: 90px !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Settings;
