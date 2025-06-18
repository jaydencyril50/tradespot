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
      {!online && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.02)', // almost invisible overlay
          backdropFilter: 'blur(1px)', // optional effect
          zIndex: 9999,
          pointerEvents: 'all', // blocks interaction
        }}>
          <div style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ffe9e9',
            border: '1px solid #ff4d4f',
            color: '#c0392b',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            animation: 'fadeInDown 0.3s ease',
            zIndex: 10000,
          }}>
            🌐 You're currently offline. Please check your connection.
          </div>
        </div>
      )}
      {children}
    </NetworkStatusContext.Provider>
  );
};
