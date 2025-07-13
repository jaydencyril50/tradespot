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
    // Now TS2 is first, so save/restore for audio2
    const savedTime = localStorage.getItem('audio2Time');
    if (audio2Ref.current && savedTime) {
      audio2Ref.current.currentTime = parseFloat(savedTime);
    }
    const saveTime = () => {
      if (audio2Ref.current) {
        localStorage.setItem('audio2Time', audio2Ref.current.currentTime.toString());
      }
    };
    if (audio2Ref.current) {
      audio2Ref.current.addEventListener('timeupdate', saveTime);
      audio2Ref.current.addEventListener('pause', saveTime);
    }
    window.addEventListener('beforeunload', saveTime);
    return () => {
      if (audio2Ref.current) {
        audio2Ref.current.removeEventListener('timeupdate', saveTime);
        audio2Ref.current.removeEventListener('pause', saveTime);
      }
      window.removeEventListener('beforeunload', saveTime);
    };
  }, []);

  useEffect(() => {
    // Play TS2 first, then TS1, then loop
    if (audio2Ref.current && audio1Ref.current) {
      const playTS2 = () => {
        if (audio2Ref.current) {
          audio2Ref.current.play().catch(() => {});
        }
      };
      const playTS1 = () => {
        if (audio1Ref.current) {
          audio1Ref.current.play().catch(() => {});
        }
      };
      audio2Ref.current.onended = playTS1;
      audio1Ref.current.onended = playTS2;
      playTS2();
    }
  }, []);
  const [showModal, setShowModal] = useState(true);
  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  // Mock data for each reward section (top 3 only)
  const rewardSections = [
    {
      title: 'Top Newbie Team',
      columns: ['Rank', 'Team Name', 'New Members'],
      data: [
        { rank: 1, name: 'Team Alpha', value: 32 },
        { rank: 2, name: 'Team Beta', value: 27 },
        { rank: 3, name: 'Team Gamma', value: 21 },
      ],
    },
    {
      title: 'Highest Recharge Team',
      columns: ['Rank', 'Team Name', 'Deposits ($)'],
      data: [
        { rank: 1, name: 'Team Delta', value: 12000 },
        { rank: 2, name: 'Team Omega', value: 9500 },
        { rank: 3, name: 'Team Sigma', value: 8700 },
      ],
    },
    {
      title: 'Group Managers Awards',
      columns: ['Rank', 'Manager', 'Performance'],
      data: [
        { rank: 1, name: 'Alice', value: 'Excellent' },
        { rank: 2, name: 'Bob', value: 'Amazing' },
        { rank: 3, name: 'Charlie', value: 'Great' },
      ],
    },
    {
      title: 'Group Assistant Awards',
      columns: ['Rank', 'Assistant', 'Performance'],
      data: [
        { rank: 1, name: 'Diana', value: 'Outstanding' },
        { rank: 2, name: 'Eve', value: 'Excellent' },
        { rank: 3, name: 'Frank', value: 'Great' },
      ],
    },
    {
      title: 'Highest Individual Orders Awards',
      columns: ['Rank', 'User', 'Orders'],
      data: [
        { rank: 1, name: 'SPOT123', value: 54 },
        { rank: 2, name: 'SPOT456', value: 47 },
        { rank: 3, name: 'SPOT789', value: 39 },
      ],
    },
    {
      title: 'Highest Individual Deposits Awards',
      columns: ['Rank', 'User', 'Deposits ($)'],
      data: [
        { rank: 1, name: 'SPOT321', value: 8000 },
        { rank: 2, name: 'SPOT654', value: 7200 },
        { rank: 3, name: 'SPOT987', value: 6900 },
      ],
    },
  ];

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

  // ...existing code...

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
      {/* Main illuminated header */}
      <div style={{ width: '100%', textAlign: 'center', marginTop: '2.2rem', marginBottom: '1.2rem', zIndex: 2, position: 'relative' }}>
        <h1 className="vip-header">TRADESPOT VIP CLUB</h1>
      </div>
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
        <div className="vip-modal" style={{
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
              if (audio2Ref.current && audio1Ref.current) {
                // Restore time for TS2
                const savedTime = localStorage.getItem('audio2Time');
                if (savedTime) {
                  audio2Ref.current.currentTime = parseFloat(savedTime);
                }
                const playTS2 = () => {
                  if (audio2Ref.current) {
                    audio2Ref.current.play();
                  }
                };
                const playTS1 = () => {
                  if (audio1Ref.current) {
                    audio1Ref.current.play();
                  }
                };
                audio2Ref.current.onended = playTS1;
                audio1Ref.current.onended = playTS2;
                playTS2();
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

      {/* Carousel for reward tables */}
      <div className="carousel-fade-in" style={{ maxWidth: '950px', margin: '3rem auto 2rem auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' }}>
          <button
            onClick={() => setActiveSlide(s => Math.max(0, s - 1))}
            disabled={activeSlide === 0}
            style={{
              background: 'linear-gradient(90deg, #00e6ff 60%, #ff00c8 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '1.7rem',
              cursor: activeSlide === 0 ? 'not-allowed' : 'pointer',
              marginRight: '1rem',
              boxShadow: '0 2px 12px #00e6ff55',
              opacity: activeSlide === 0 ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            ◀
          </button>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.3rem',
              color: '#ffd700',
              letterSpacing: '1px',
              textShadow: '0 2px 12px #ffd70055',
              flex: 1,
              textAlign: 'center',
              display: 'inline-block',
            }}
          >
            {rewardSections[activeSlide].title}
          </span>
          <button
            onClick={() => setActiveSlide(s => Math.min(rewardSections.length - 1, s + 1))}
            disabled={activeSlide === rewardSections.length - 1}
            style={{
              background: 'linear-gradient(90deg, #ff00c8 60%, #00e6ff 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '1.7rem',
              cursor: activeSlide === rewardSections.length - 1 ? 'not-allowed' : 'pointer',
              marginLeft: '1rem',
              boxShadow: '0 2px 12px #ff00c855',
              opacity: activeSlide === rewardSections.length - 1 ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            ▶
          </button>
        </div>
        <div style={{ width: '100%', overflow: 'hidden', minHeight: '220px' }}>
          <div style={{ display: 'flex', transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)', transform: `translateX(-${activeSlide * 100}%)` }}>
            {rewardSections.map((section, idx) => (
              <div key={section.title} style={{ minWidth: '100%', boxSizing: 'border-box', padding: '0 1rem' }}>
                <div className="invitation-competition-table-wrapper">
                  <table className="invitation-competition-table ilum-table">
                    <thead>
                      <tr>
                        {section.columns.map(col => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.data.map((row, idx2) => {
                        let rowClass = '';
                        if (idx2 === 0) rowClass = 'top-1';
                        else if (idx2 === 1) rowClass = 'top-2';
                        else if (idx2 === 2) rowClass = 'top-3';
                        let icon = null;
                        if (idx2 === 0) icon = <span title="1st" role="img" aria-label="crown" style={{fontSize:'1.7em', verticalAlign:'middle', animation:'popRank 0.7s'}}>👑</span>;
                        else if (idx2 === 1) icon = <span title="2nd" role="img" aria-label="trophy" style={{fontSize:'1.5em', verticalAlign:'middle', animation:'popRank 0.7s'}}>🏆</span>;
                        else if (idx2 === 2) icon = <span title="3rd" role="img" aria-label="diamond" style={{fontSize:'1.3em', verticalAlign:'middle', animation:'popRank 0.7s'}}>💎</span>;
                        return (
                          <tr key={row.name} className={rowClass}>
                            <td className="rank-cell">{icon || row.rank}</td>
                            <td>{row.name}</td>
                            <td>{row.value}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roulette Section */}
      <div className="roulette-section roulette-fade-in">
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

