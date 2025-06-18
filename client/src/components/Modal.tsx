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
        background: 'rgba(30,44,80,0.18)',
        zIndex: 2000,
        display: 'grid',
        placeItems: 'center', // Ensures perfect centering
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 'auto',
          maxWidth: '98vw',
          margin: '0 auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
