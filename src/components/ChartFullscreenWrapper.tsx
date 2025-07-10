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
      className={`market-chart-container${isFullscreen ? ' fullscreen' : ''}`}
      style={isFullscreen ? {
        width: '100vw',
        height: '100vh',
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
