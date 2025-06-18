import React, { createContext, useContext, useEffect, useState } from 'react';

const NetworkStatusContext = createContext({ online: true });

export const useNetworkStatus = () => useContext(NetworkStatusContext);

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={{ online }}>
      {!online && <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(30,40,60,0.85)',
        zIndex: 99999,
        pointerEvents: 'all',
        transition: 'background 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        <div style={{
          width: '100%',
          background: '#e74c3c',
          color: '#fff',
          fontWeight: 700,
          textAlign: 'center',
          padding: '10px 0',
          fontSize: 18,
          letterSpacing: 1,
          boxShadow: '0 2px 8px rgba(231,76,60,0.18)',
        }}>
          Network error.
        </div>
      </div>}
      {children}
    </NetworkStatusContext.Provider>
  );
};
