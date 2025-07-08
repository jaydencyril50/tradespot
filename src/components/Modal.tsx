import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.45)', // darken the rest of the page
        zIndex: 2000,
        display: 'grid',
        placeItems: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: 'auto',
          maxWidth: '98vw',
          margin: '0 auto',
          background: 'var(--card-bg)',
          color: 'var(--text)',
          border: '1.5px solid var(--primary)', // Add border lines on modal edges
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;