import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../theme.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', border: '1.5px solid var(--secondary)', borderTop: 0, borderLeft: 0, borderRight: 0, opacity: 0.5 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif' }}>
          SETTINGS
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        {/* Basic Settings Card */}
        <div
          className="card"
          style={{
            borderRadius: 0,
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
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--secondary)',
            background: 'var(--card-bg)',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 4, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1 }}>Basic Settings</h2>
          <div style={{ fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: 8 }}>
            Manage your account and preferences here.
          </div>
          <button
            className="button"
            style={{
              borderRadius: 6,
              padding: '6px 28px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: 4,
              alignSelf: 'center',
              background: 'var(--secondary)',
              color: 'var(--button-text)',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
            }}
            onClick={() => navigate('/settings/edit-basic')}
          >
            Edit
          </button>
        </div>
        {/* Privacy Settings Card */}
        <div
          className="card"
          style={{
            borderRadius: 0,
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
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--secondary)',
            background: 'var(--card-bg)',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 4, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1 }}>Privacy Settings</h2>
          <div style={{ fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: 8 }}>
            Control your privacy and security options here.
          </div>
          <button
            className="button"
            style={{
              borderRadius: 6,
              padding: '6px 28px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: 4,
              alignSelf: 'center',
              background: 'var(--secondary)',
              color: 'var(--button-text)',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
            }}
            onClick={() => navigate('/settings/privacy')}
          >
            Edit
          </button>
        </div>
        {/* Additional Settings Card */}
        <div
          className="card"
          style={{
            borderRadius: 0,
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
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--secondary)',
            background: 'var(--card-bg)',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 4, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1 }}>Additional Settings</h2>
          <div style={{ fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: 8 }}>
            {/* Placeholder for additional settings content */}
            Configure extra options and features here.
          </div>
          <button
            className="button"
            style={{
              borderRadius: 6,
              padding: '6px 28px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: 4,
              alignSelf: 'center',
              background: 'var(--secondary)',
              color: 'var(--button-text)',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
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
