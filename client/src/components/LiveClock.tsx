import React, { useEffect, useState } from 'react';

interface LiveClockProps {
  utc?: boolean;
}

const LiveClock: React.FC<LiveClockProps> = ({ utc = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span>{utc ? time.toUTCString() : time.toLocaleTimeString()}</span>
  );
};

export default LiveClock;
