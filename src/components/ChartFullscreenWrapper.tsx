import React, { useEffect, useRef } from 'react';

interface ChartFullscreenWrapperProps {
  isFullscreen: boolean;
  onExit: () => void;
  children: React.ReactNode;
}

const ChartFullscreenWrapper: React.FC<ChartFullscreenWrapperProps> = ({
  isFullscreen,
  onExit,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle fullscreen resize
  useEffect(() => {
    if (!isFullscreen) return;
    const chartDiv = containerRef.current;
    if (!chartDiv) return;

    const updateSize = () => {
      chartDiv.style.height = `${window.innerHeight}px`;
      chartDiv.style.width = `${window.innerWidth}px`;
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
      chartDiv.style.height = '';
      chartDiv.style.width = '';
    };
  }, [isFullscreen]);

  // Prevent body scroll
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      className="market-chart-container"
      style={isFullscreen ? {
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        background: 'var(--bg)',
        borderRadius: 0,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.85)',
        margin: 0,
        padding: 0,
        maxWidth: '100vw',
        overflow: 'hidden'
      } : undefined}
    >
      {isFullscreen && (
        <button
          onClick={onExit}
          style={{
            position: 'absolute',
            top: 16,
            right: 24,
            zIndex: 10001,
            background: 'rgba(30,30,30,0.7)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            fontSize: 22,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Exit Fullscreen"
        >
          ×
        </button>
      )}
      {children}
    </div>
  );
};

export default ChartFullscreenWrapper;
