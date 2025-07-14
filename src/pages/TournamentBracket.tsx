import React, { useEffect, useRef, useState } from 'react';
import './TournamentBracket.css';

const DJ_SONGS = [
  process.env.PUBLIC_URL + '/djkings/TS2.mp3',
  process.env.PUBLIC_URL + '/djkings/TS1.mp3',
];

const TournamentBracket: React.FC = () => {
  const [currentSong, setCurrentSong] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const [curtainOpen, setCurtainOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  return (
    <div className="bracket-bg">
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
          {Array(5).fill(null).map((_, i) => (
            <div className="bracket-block block-left color-yellow2" key={i}></div>
          ))}
        </div>
        <div className="bracket-round round-left round1">
          <div className="bracket-block block-left color-green"></div>
          <div className="bracket-block block-left color-green"></div>
          <div className="bracket-block block-left color-green"></div>
        </div>
        <div className="bracket-round round-left round2">
          <div className="bracket-block block-left color-green"></div>
          <div className="bracket-block block-left color-green"></div>
        </div>
      </div>

      {/* Left Bottom - all yellow */}
      <div className="bracket-side bracket-left">
        <div className="bracket-round round-left round0">
          {Array(5).fill(null).map((_, i) => (
            <div className="bracket-block block-left color-yellow" key={i}></div>
          ))}
        </div>
        <div className="bracket-round round-left round1">
          <div className="bracket-block block-left color-grass"></div>
          <div className="bracket-block block-left color-grass"></div>
          <div className="bracket-block block-left color-grass"></div>
        </div>
        <div className="bracket-round round-left round2">
          <div className="bracket-block block-left color-grass"></div>
          <div className="bracket-block block-left color-grass"></div>
        </div>
      </div>

      {/* Semifinals Left */}
      <div className="bracket-semifinals bracket-left">
        <div className="bracket-block semi color-silver"></div>
        <div className="bracket-block semi color-silver"></div>
      </div>

      {/* Center Final */}
      <div className="bracket-center">
        <div className="trophy">🏆</div>
        <div className="bracket-block final"></div>
      </div>

      {/* Semifinals Right */}
      <div className="bracket-semifinals bracket-right">
        <div className="bracket-block semi color-silver"></div>
        <div className="bracket-block semi color-silver"></div>
      </div>

      {/* Right Top - all blue */}
      <div className="bracket-side bracket-right">
        <div className="bracket-round round-right round0">
          {Array(5).fill(null).map((_, i) => (
            <div className="bracket-block block-right color-blue" key={i}></div>
          ))}
        </div>
        <div className="bracket-round round-right round1">
          <div className="bracket-block block-right color-red"></div>
          <div className="bracket-block block-right color-red"></div>
          <div className="bracket-block block-right color-red"></div>
        </div>
        <div className="bracket-round round-right round2">
          <div className="bracket-block block-right color-red"></div>
          <div className="bracket-block block-right color-red"></div>
        </div>
      </div>

      {/* Right Bottom - all orange */}
      <div className="bracket-side bracket-right">
        <div className="bracket-round round-right round0">
          {Array(5).fill(null).map((_, i) => (
            <div className="bracket-block block-right color-navi" key={i}></div>
          ))}
        </div>
        <div className="bracket-round round-right round1">
          <div className="bracket-block block-right color-blood"></div>
          <div className="bracket-block block-right color-blood"></div>
          <div className="bracket-block block-right color-blood"></div>
        </div>
        <div className="bracket-round round-right round2">
          <div className="bracket-block block-right color-blood"></div>
          <div className="bracket-block block-right color-blood"></div>
        </div>
      </div>

  </div>

  {/* Awards Table Below Bracket */}
  <div className="awards-table-container">
    <table className="awards-table">
      <thead>
        <tr>
          <th className="awards-header">AWARD CATEGORY</th>
          <th className="teams-header">TEAMS AND USERS</th>
          <th className="rewards-header">REWARDS</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>TOP SOUL WINNING NEWBIES</td>
          <td>Team Alpha</td>
          <td>$500</td>
        </tr>
        <tr>
          <td>TOP DEPOSITING TEAMS</td>
          <td>Team Beta</td>
          <td>$400</td>
        </tr>
        <tr>
          <td>GROUP MANAGERS AWARDS</td>
          <td>Jane Doe</td>
          <td>$300</td>
        </tr>
        <tr>
          <td>GROUP ASSISTANT AWARDS</td>
          <td>John Smith</td>
          <td>$200</td>
        </tr>
        <tr>
          <td>TOP INDIVIDUAL ORDERS AWARDS</td>
          <td>Mary Lee</td>
          <td>$150</td>
        </tr>
        <tr>
          <td>TOP INDIVIDUAL DEPOSITS AWARDS</td>
          <td>Chris Ray</td>
          <td>$120</td>
        </tr>
        <tr>
          <td>TOP USDT BALANCE HOLDERS</td>
          <td>Team Gamma</td>
          <td>$100</td>
        </tr>
        <tr>
          <td>TOP ADVERTISING TEAMS</td>
          <td>Team Delta</td>
          <td>$80</td>
        </tr>
      </tbody>
    </table>
  </div>
  </div>
  );
};

export default TournamentBracket;
