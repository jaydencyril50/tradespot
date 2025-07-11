import React from 'react';

const PreventBackNavigation: React.FC = () => {
  React.useEffect(() => {
    const handleBack = (e: PopStateEvent) => {
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handleBack);
    return () => {
      window.removeEventListener('popstate', handleBack);
    };
  }, []);
  return null;
};

export default PreventBackNavigation;
