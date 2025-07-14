import React from 'react';
import './TournamentBracket.css';

const TournamentBracket: React.FC = () => (
  <div className="bracket-bg">
    <h2 className="bracket-title">TRADESPOT CHAMPIONS</h2>
    <div className="bracket-main">

      {/* Left Top - all purple */}
      <div className="bracket-side bracket-left">
        <div className="bracket-round round-left round0">
          {Array(5).fill(null).map((_, i) => (
            <div className="bracket-block block-left color-purple" key={i}></div>
          ))}
        </div>
        <div className="bracket-round round-left round1">
          <div className="bracket-block block-left color-purple"></div>
          <div className="bracket-block block-left color-purple"></div>
          <div className="bracket-block block-left color-purple"></div>
        </div>
        <div className="bracket-round round-left round2">
          <div className="bracket-block block-left color-purple"></div>
          <div className="bracket-block block-left color-purple"></div>
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
          <div className="bracket-block block-left color-yellow"></div>
          <div className="bracket-block block-left color-yellow"></div>
          <div className="bracket-block block-left color-yellow"></div>
        </div>
        <div className="bracket-round round-left round2">
          <div className="bracket-block block-left color-yellow"></div>
          <div className="bracket-block block-left color-yellow"></div>
        </div>
      </div>

      {/* Semifinals Left */}
      <div className="bracket-semifinals bracket-left">
        <div className="bracket-block semi color-semi-orange"></div>
        <div className="bracket-block semi color-semi-orange"></div>
      </div>

      {/* Center Final */}
      <div className="bracket-center">
        <div className="trophy">🏆</div>
        <div className="bracket-block final"></div>
      </div>

      {/* Semifinals Right */}
      <div className="bracket-semifinals bracket-right">
        <div className="bracket-block semi color-semi-red"></div>
        <div className="bracket-block semi color-semi-red"></div>
      </div>

      {/* Right Top - all blue */}
      <div className="bracket-side bracket-right">
        <div className="bracket-round round-right round0">
          {Array(5).fill(null).map((_, i) => (
            <div className="bracket-block block-right color-blue" key={i}></div>
          ))}
        </div>
        <div className="bracket-round round-right round1">
          <div className="bracket-block block-right color-blue"></div>
          <div className="bracket-block block-right color-blue"></div>
          <div className="bracket-block block-right color-blue"></div>
        </div>
        <div className="bracket-round round-right round2">
          <div className="bracket-block block-right color-blue"></div>
          <div className="bracket-block block-right color-blue"></div>
        </div>
      </div>

      {/* Right Bottom - all orange */}
      <div className="bracket-side bracket-right">
        <div className="bracket-round round-right round0">
          {Array(5).fill(null).map((_, i) => (
            <div className="bracket-block block-right color-orange" key={i}></div>
          ))}
        </div>
        <div className="bracket-round round-right round1">
          <div className="bracket-block block-right color-orange"></div>
          <div className="bracket-block block-right color-orange"></div>
          <div className="bracket-block block-right color-orange"></div>
        </div>
        <div className="bracket-round round-right round2">
          <div className="bracket-block block-right color-orange"></div>
          <div className="bracket-block block-right color-orange"></div>
        </div>
      </div>
    </div>

    <div className="bracket-footer">Who will be the Champion?</div>
  </div>
);

export default TournamentBracket;
