import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const AdditionalSettings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);

    return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: 0,
        boxShadow: 'var(--card-shadow)',
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
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: 4, letterSpacing: 1 }}>Additional Settings</div>
        <div style={{ fontSize: '0.95rem', color: 'var(--text)', marginBottom: 8 }}>
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
            marginTop: 0,
            background: 'var(--secondary)',
            color: '#fff', // force white text
            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
            transition: 'background 0.2s',
            alignSelf: 'center',
            width: '100%'
          }}
          onClick={() => navigate('/faq')}
        >
         FAQ Data
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
            background: 'var(--secondary)',
            color: '#fff', // force white text
            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
            transition: 'background 0.2s',
            alignSelf: 'center',
            width: '100%'
          }}
          onClick={() => setShowThemeModal(true)}
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
            background: 'var(--secondary)',
            color: '#fff', // force white text
            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
            transition: 'background 0.2s',
            alignSelf: 'center',
            width: '100%'
          }}
        >
         Change language
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
            background: 'var(--secondary)',
            color: '#fff',
            boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
            transition: 'background 0.2s',
            alignSelf: 'center',
            width: '100%'
          }}
          onClick={() => navigate('/about')}
        >
         About TradeSpot
        </button>
        {showThemeModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(30,40,60,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
          }}>
            <div style={{
              background: 'var(--card-bg)',
              borderRadius: 8,
              boxShadow: 'var(--card-shadow)',
              minWidth: 0,
              maxWidth: 320,
              width: '100%',
              boxSizing: 'border-box',
              textAlign: 'center',
              fontFamily: 'inherit',
              padding: '22px 18px 18px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto',
            }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: 10 }}>Theme</div>
              <div style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: 16 }}>
                Select your preferred theme mode:
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <button
                  style={{
                    padding: '8px 18px',
                    borderRadius: 4,
                    border: theme === 'light' ? '2px solid #25324B' : '1px solid #888',
                    background: theme === 'light' ? '#fff' : 'var(--secondary)',
                    color: theme === 'light' ? '#25324B' : 'var(--text)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => setTheme('light')}
                  disabled={theme === 'light'}
                >
                  Light
                </button>
                <button
                  style={{
                    padding: '8px 18px',
                    borderRadius: 4,
                    border: theme === 'dark' ? '2px solid #25324B' : '1px solid #888',
                    background: theme === 'dark' ? '#232b36' : 'var(--secondary)',
                    color: theme === 'dark' ? '#e3e6ef' : 'var(--text)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => setTheme('dark')}
                  disabled={theme === 'dark'}
                >
                  Dark
                </button>
              </div>
              <button
                style={{
                  border: 'none',
                  borderRadius: 3,
                  padding: '9px 0',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  background: 'var(--secondary)',
                  color: 'var(--text)',
                  width: '100%',
                  boxShadow: '0 1px 4px rgba(30,60,114,0.08)',
                  transition: 'background 0.2s',
                  alignSelf: 'center',
                }}
                onClick={() => setShowThemeModal(false)}
              >Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalSettings;
