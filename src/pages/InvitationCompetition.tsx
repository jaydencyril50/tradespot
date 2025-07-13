import './InvitationCompetition.css';

import React, { useEffect, useState, useRef } from 'react';
// Confetti colors
const confettiColors = [
  '#FF595E', // red
  '#FFCA3A', // yellow
  '#8AC926', // green
  '#1982C4', // blue
  '#6A4C93', // purple
  '#FF61A6', // pink
  '#FFB5E8', // light pink
  '#B5FFD9', // mint
  '#F9F871', // light yellow
  '#FFD6E0', // pastel pink
  '#B28DFF', // lavender
  '#FFB347', // orange
  '#A0E7E5', // cyan
  '#FBE7C6', // peach
  '#F7B801', // gold
  '#00F2F2', // aqua
  '#F15BB5', // magenta
  '#9D4EDD', // deep purple
  '#43AA8B', // teal
  '#F72585', // hot pink
  '#3A86FF', // vivid blue
  '#FF006E', // neon pink
  '#8338EC', // violet
  '#FB5607', // vivid orange
  '#FFBE0B', // bright yellow
  '#C0FDFF', // baby blue
  '#A3F7BF', // light green
  '#F9C74F', // yellow-orange
  '#90BE6D', // olive green
  '#577590', // steel blue
];

interface UserRanking {
  spotId: string;
  newTeamMembers: number;
}

const InvitationCompetition: React.FC = () => {
  // Audio playback logic
  const audio1Ref = useRef<HTMLAudioElement>(null);
  const audio2Ref = useRef<HTMLAudioElement>(null);

  // Save and restore audio position
  useEffect(() => {
    const savedTime = localStorage.getItem('audio1Time');
    if (audio1Ref.current && savedTime) {
      audio1Ref.current.currentTime = parseFloat(savedTime);
    }
    // Save time on pause, timeupdate, and beforeunload
    const saveTime = () => {
      if (audio1Ref.current) {
        localStorage.setItem('audio1Time', audio1Ref.current.currentTime.toString());
      }
    };
    if (audio1Ref.current) {
      audio1Ref.current.addEventListener('timeupdate', saveTime);
      audio1Ref.current.addEventListener('pause', saveTime);
    }
    window.addEventListener('beforeunload', saveTime);
    return () => {
      if (audio1Ref.current) {
        audio1Ref.current.removeEventListener('timeupdate', saveTime);
        audio1Ref.current.removeEventListener('pause', saveTime);
      }
      window.removeEventListener('beforeunload', saveTime);
    };
  }, []);

  useEffect(() => {
    // Play first audio on mount
    if (audio1Ref.current) {
      audio1Ref.current.play().catch(() => {});
      audio1Ref.current.onended = () => {
        if (audio2Ref.current) {
          audio2Ref.current.play().catch(() => {});
        }
      };
    }
  }, []);
  const [showModal, setShowModal] = useState(true);
  const [rankings, setRankings] = useState<UserRanking[]>([]);

  // Confetti state
  const [confetti, setConfetti] = useState<{
    id: number,
    left: number,
    size: number,
    color: string,
    rotate: number,
    duration: number,
    delay: number,
    created: number
  }[]>([]);

  useEffect(() => {
    // Function to generate a batch of confetti pieces
    const generateConfetti = (count = 60) => Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + Math.random() + i,
      left: Math.random() * 100, // vw
      size: 4 + Math.random() * 7, // px (smaller confetti)
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotate: Math.random() * 360,
      duration: 4 + Math.random() * 3.5, // seconds (slower, smoother fall)
      delay: Math.random() * 2.5, // seconds
      created: Date.now(),
    }));

    // Start with an initial batch
    setConfetti(generateConfetti(180));
    const interval = setInterval(() => {
      setConfetti(prev => {
        // Add new confetti
        const newConfetti = generateConfetti(60);
        // Remove confetti older than 5s (max duration + delay)
        const now = Date.now();
        const filtered = prev.filter(piece => now - (piece.created || now) < 5000);
        return [...filtered, ...newConfetti];
      });
    }, 600); // Add new confetti every 0.6s for smoother, more continuous effect
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // TODO: Replace with real API call
    // Mock data for now
    const mockData: UserRanking[] = [
      { spotId: 'SPOT123', newTeamMembers: 12 },
      { spotId: 'SPOT456', newTeamMembers: 9 },
      { spotId: 'SPOT789', newTeamMembers: 7 },
      { spotId: 'SPOT321', newTeamMembers: 6 },
      { spotId: 'SPOT654', newTeamMembers: 5 },
    ];
    setRankings(mockData);
  }, []);

  // Generate rain and lights
  const rainDrops = Array.from({ length: 40 }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 1.5;
    const duration = 1 + Math.random() * 1.5;
    return (
      <div
        key={i}
        className="rain-drop"
        style={{ left: `${left}vw`, animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
      />
    );
  });

  const flashColors = ['#ff00c8', '#00e6ff', '#ffd700', '#00ffb8', '#ff5e62', '#fffc00'];
  const flashLights = Array.from({ length: 8 }).map((_, i) => {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const color = flashColors[i % flashColors.length];
    const delay = Math.random() * 2;
    return (
      <div
        key={i}
        className="flash-light"
        style={{ left: `${left}vw`, top: `${top}vh`, background: color, animationDelay: `${delay}s` }}
      />
    );
  });

  const [spinning, setSpinning] = useState(false);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => setSpinning(false), 2500);
  };

  return (
    <>
      {/* Hidden audio elements for sequential playback */}
      <audio
        ref={audio1Ref}
        src={process.env.PUBLIC_URL + '/djkings/TS1.mp3'}
        style={{ display: 'none' }}
      />
      <audio
        ref={audio2Ref}
        src={process.env.PUBLIC_URL + '/djkings/TS2.mp3'}
        style={{ display: 'none' }}
      />
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(20, 20, 20, 0.97)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <h2 style={{ color: '#fff', marginBottom: '2rem', fontWeight: 700, fontSize: '2.2rem', letterSpacing: '2px', textShadow: '0 2px 12px #000' }}>Welcome to VIP club</h2>
          <button
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.3rem',
              fontWeight: 600,
              borderRadius: '2rem',
              background: 'linear-gradient(90deg, #ff00c8 0%, #00e6ff 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 16px #0008',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              outline: 'none',
              letterSpacing: '1px',
            }}
            onClick={() => {
              if (audio1Ref.current) {
                // Restore time again in case user refreshed and clicks quickly
                const savedTime = localStorage.getItem('audio1Time');
                if (savedTime) {
                  audio1Ref.current.currentTime = parseFloat(savedTime);
                }
                audio1Ref.current.play();
                audio1Ref.current.onended = () => {
                  if (audio2Ref.current) {
                    audio2Ref.current.play();
                  }
                };
              }
              setShowModal(false);
            }}
          >
            JOIN ROOM
          </button>
        </div>
      )}
      <div className="party-bg">
        {rainDrops}
        {flashLights}
        {/* Confetti celebration */}
        <div className="confetti-wrapper">
          {confetti.map(piece => (
            <div
              key={piece.id}
              className="confetti-piece"
              style={{
                left: `${piece.left}vw`,
                width: `${piece.size}px`,
                height: `${piece.size * 0.4}px`,
                background: piece.color,
                transform: `rotate(${piece.rotate}deg)`,
                animationDuration: `${piece.duration}s`,
                animationDelay: `${piece.delay}s`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="invitation-competition-container">
        <h2>Invitation Competition Rankings (This Week)</h2>
        <div className="invitation-competition-table-wrapper">
          <table className="invitation-competition-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User SpotID</th>
                <th>New Team Members (7 days)</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((user: UserRanking, idx: number) => {
                let rowClass = '';
                if (idx === 0) rowClass = 'top-1';
                else if (idx === 1) rowClass = 'top-2';
                else if (idx === 2) rowClass = 'top-3';
                else if (idx === 3) rowClass = 'top-4';
                else if (idx === 4) rowClass = 'top-5';
                let icon = null;
                if (idx === 0) icon = <span title="1st" role="img" aria-label="crown" style={{fontSize:'1.7em', verticalAlign:'middle', animation:'popRank 0.7s'}}>👑</span>;
                else if (idx === 1) icon = <span title="2nd" role="img" aria-label="trophy" style={{fontSize:'1.5em', verticalAlign:'middle', animation:'popRank 0.7s'}}>🏆</span>;
                else if (idx === 2) icon = <span title="3rd" role="img" aria-label="diamond" style={{fontSize:'1.3em', verticalAlign:'middle', animation:'popRank 0.7s'}}>💎</span>;
                else if (idx === 3) icon = <span title="4th" role="img" aria-label="star" style={{fontSize:'1.2em', verticalAlign:'middle', animation:'popRank 0.7s'}}>⭐</span>;
                else if (idx === 4) icon = <span title="5th" role="img" aria-label="medal" style={{fontSize:'1.1em', verticalAlign:'middle', animation:'popRank 0.7s'}}>🏅</span>;
                return (
                  <tr key={user.spotId} className={rowClass}>
                    <td className="rank-cell">
                      {icon || (idx + 1)}
                    </td>
                    <td>{user.spotId}</td>
                    <td>{user.newTeamMembers}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roulette Section */}
      <div className="roulette-section">
        <h3 className="roulette-title">Weekly Lucky Roulette</h3>
        <div className={`roulette-wheel${spinning ? ' roulette-spinning' : ''}`}>
          <div className="roulette-inner">
            <div className="roulette-marker">▼</div>
              <div className="roulette-slices">
                <div className="roulette-slice slice1">100$</div>
                <div className="roulette-slice slice2">200$</div>
                <div className="roulette-slice slice3">300$</div>
                <div className="roulette-slice slice4">400$</div>
                <div className="roulette-slice slice5">500$</div>
                <div className="roulette-slice slice6">600$</div>
                <div className="roulette-slice slice7">700$</div>
                <div className="roulette-slice slice8">800$</div>
                <div className="roulette-slice slice9">900$</div>
                <div className="roulette-slice slice10">1000$</div>
                <div className="roulette-slice slice11">150$</div>
                <div className="roulette-slice slice12">250$</div>
                <div className="roulette-slice slice13">350$</div>
                <div className="roulette-slice slice14">450$</div>
                <div className="roulette-slice slice15">550$</div>
                <div className="roulette-slice slice16">750$</div>
              </div>
          </div>
        </div>
        <button className="roulette-spin-btn" onClick={handleSpin} disabled={spinning}>
          {spinning ? 'Spinning...' : 'Spin Roulette'}
        </button>
      </div>
      <div className="roulette-bottom-gap"></div>
    </>
  );
};

export default InvitationCompetition;

