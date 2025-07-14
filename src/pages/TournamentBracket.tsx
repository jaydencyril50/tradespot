import React, { useEffect, useRef, useState } from 'react';
import './TournamentBracket.css';

const DJ_SONGS = [
  process.env.PUBLIC_URL + '/djkings/TS2.mp3',
  process.env.PUBLIC_URL + '/djkings/TS1.mp3',
];

const TournamentBracket: React.FC = () => {
  const [currentSong, setCurrentSong] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // When the song changes, play it
    if (audioRef.current) {
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [currentSong]);

  const handleEnded = () => {
    setCurrentSong((prev) => (prev + 1) % DJ_SONGS.length);
  };

  return (
    <div className="bracket-bg">
      {/* DJ Kings Music Autoplay */}
      <audio
        ref={audioRef}
        src={DJ_SONGS[currentSong]}
        autoPlay
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

  </div>
  );
};

export default TournamentBracket;
