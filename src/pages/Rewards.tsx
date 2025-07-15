import React, { useEffect, useRef, useState } from 'react';
import { fetchRewards } from '../services/rewardsService';
import './TournamentBracket.css';

const DJ_SONGS = [
  process.env.PUBLIC_URL + '/djkings/TS2.mp3',
  process.env.PUBLIC_URL + '/djkings/TS1.mp3',
];

const TournamentBracket: React.FC = () => {
  const [currentSong, setCurrentSong] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const [curtainOpen, setCurtainOpen] = useState(false);
  type Reward = {
    index: number;
    value: string;
    colorRow: string;
    updatedAt: string;
  };
  const [rewards, setRewards] = useState<Reward[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);


  useEffect(() => {
    let isMounted = true;
    const getRewards = () => {
      fetchRewards().then(data => {
        if (isMounted) setRewards(data);
      }).catch(() => {
        if (isMounted) setRewards([]);
      });
    };
    getRewards();
    const interval = setInterval(getRewards, 3000); // fetch every 3 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (musicStarted && audioRef.current) {
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [currentSong, musicStarted]);

  const handleEnded = () => {
    setCurrentSong((prev) => (prev + 1) % DJ_SONGS.length);
  };

  const handleStartMusic = () => {
    setCurtainOpen(true);
    setTimeout(() => setMusicStarted(true), 1800); // match curtain animation duration (1.8s)
  };



  // Build a map for fast lookup by index
  const rewardMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    (rewards ?? []).forEach(r => { map[r.index] = r.value; });
    return map;
  }, [rewards]);

  // Helper to get reward value or fallback
  const getRewardValue = (idx: number) => rewardMap[idx] || '';

  // Awards Table State
  type AwardRow = { category: string; team: string; reward: string };
  const [awardRows, setAwardRows] = useState<AwardRow[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAwardRows = () => {
      fetch('/api/reward/award-table')
        .then(res => res.json())
        .then(data => {
          if (isMounted) {
            if (data && Array.isArray(data.rows)) {
              setAwardRows(data.rows);
            } else {
              setAwardRows([]);
            }
          }
        })
        .catch(() => {
          if (isMounted) setAwardRows([]);
        });
    };
    fetchAwardRows();
    const interval = setInterval(fetchAwardRows, 3000); // fetch every 3 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`bracket-bg${curtainOpen ? ' edge-light-active' : ''}`}> 
      {/* Fullscreen Overlay for Join Button */}
      {!musicStarted && (
        <div className={`join-overlay${curtainOpen ? ' curtain-open' : ''}`}>
          <button className="join-club-btn" onClick={handleStartMusic}>
            Join the Club
          </button>
          <div className="curtain curtain-left" />
          <div className="curtain curtain-right" />
        </div>
      )}
      {/* Illuminating Header */}
      <h1 className="vip-header">TRADESPOT VIP CLUB</h1>
      {/* DJ Kings Music Autoplay */}
      <audio
        ref={audioRef}
        src={DJ_SONGS[currentSong]}
        autoPlay={musicStarted}
        onEnded={handleEnded}
        loop={false}
        preload="auto"
        style={{ display: 'none' }}
      />
      {/* Party Lights Background */}
      <div className="party-lights-bg" aria-hidden="true">
        {[
          { left: '10%', top: '12%', color: 'light1' },
          { left: '25%', top: '30%', color: 'light2' },
          { left: '40%', top: '18%', color: 'light3' },
          { left: '60%', top: '10%', color: 'light4' },
          { left: '80%', top: '25%', color: 'light5' },
          { left: '15%', top: '70%', color: 'light6' },
          { left: '35%', top: '80%', color: 'light7' },
          { left: '55%', top: '75%', color: 'light8' },
          { left: '75%', top: '65%', color: 'light9' },
        ].map((light, i) => (
          <span
            key={i}
            className={`party-light ${light.color}`}
            style={{ left: light.left, top: light.top }}
          />
        ))}
      </div>
      <h2 className="bracket-title">TRADESPOT CHAMPIONS</h2>
      <div className="bracket-main">

      {/* Left Top - all purple */}
      <div className="bracket-side bracket-left">
        <div className="bracket-round round-left round0">
          {[0,1,2].map(i => (
            <div className="bracket-block block-left color-yellow2" key={i}>{getRewardValue(i)}</div>
          ))}
        </div>
        <div className="bracket-round round-left round1">
          {[3,4,5].map(i => (
            <div className="bracket-block block-left color-green" key={i}>{getRewardValue(i)}</div>
          ))}
        </div>
      </div>

      {/* Left Bottom - all yellow */}
      <div className="bracket-side bracket-left">
        <div className="bracket-round round-left round0">
          {[6,7,8].map(i => (
            <div className="bracket-block block-left color-yellow" key={i}>{getRewardValue(i)}</div>
          ))}
        </div>
        <div className="bracket-round round-left round1">
          {[9,10,11].map(i => (
            <div className="bracket-block block-left color-grass" key={i}>{getRewardValue(i)}</div>
          ))}
        </div>
      </div>

      {/* Semifinals Left */}
      <div className="bracket-semifinals bracket-left">
        {[24,25].map(i => (
          <div className="bracket-block semi color-silver" key={i}>{getRewardValue(i)}</div>
        ))}
      </div>

      {/* Center Final */}
      <div className="bracket-center">
        <div className="trophy">🏆</div>
        <div className="bracket-block final">{getRewardValue(27)}</div>
      </div>

      {/* Semifinals Right */}
      <div className="bracket-semifinals bracket-right">
        {[26,28].map(i => (
          <div className="bracket-block semi color-silver" key={i}>{getRewardValue(i)}</div>
        ))}
      </div>

      {/* Right Top - all blue */}
      <div className="bracket-side bracket-right">
        <div className="bracket-round round-right round0">
          {[12,13,14].map(i => (
            <div className="bracket-block block-right color-blue" key={i}>{getRewardValue(i)}</div>
          ))}
        </div>
        <div className="bracket-round round-right round1">
          {[15,16,17].map(i => (
            <div className="bracket-block block-right color-red" key={i}>{getRewardValue(i)}</div>
          ))}
        </div>
      </div>

      {/* Right Bottom - all orange */}
      <div className="bracket-side bracket-right">
        <div className="bracket-round round-right round0">
          {[18,19,20].map(i => (
            <div className="bracket-block block-right color-navi" key={i}>{getRewardValue(i)}</div>
          ))}
        </div>
        <div className="bracket-round round-right round1">
          {[21,22,23].map(i => (
            <div className="bracket-block block-right color-blood" key={i}>{getRewardValue(i)}</div>
          ))}
        </div>
      </div>

  </div>

  {/* Awards Table Below Bracket */}
  <div className="awards-table-container">
    <table className="awards-table">
      <thead>
        <tr>
          <th className="awards-header">AWARD CATEGORY</th>
          <th className="teams-header">TEAMS</th>
          <th className="rewards-header">REWARDS</th>
        </tr>
      </thead>
      <tbody>
        {awardRows.length === 0 && (
          <tr>
            <td colSpan={3} style={{textAlign:'center', color:'#888', fontStyle:'italic'}}>No awards found.</td>
          </tr>
        )}
        {awardRows.length > 0 && awardRows.map((row, idx) => (
          <tr key={idx}>
            <td>{row.category}</td>
            <td>{row.team}</td>
            <td>{row.reward}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  </div>
  );
};

export default TournamentBracket;
