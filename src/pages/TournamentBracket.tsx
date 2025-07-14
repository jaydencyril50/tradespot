import React from 'react';
import './TournamentBracket.css';

const leftTopTeams = ['Purple 1', 'Purple 2', 'Purple 3', 'Purple 4', 'Purple 5'];
const leftBottomTeams = ['Orange 1', 'Orange 2', 'Orange 3', 'Orange 4', 'Orange 5'];
const rightTopTeams = ['Blue 1', 'Blue 2', 'Blue 3', 'Blue 4', 'Blue 5'];
const rightBottomTeams = ['Red 1', 'Red 2', 'Red 3', 'Red 4', 'Red 5'];

const TournamentBracket: React.FC = () => (
  <div className="bracket-bg">
    <h2 className="bracket-title">TRADESPOT CHAMPIONS</h2>
    <div className="bracket-main">

      {/* Left Top */}
      <div className="bracket-side bracket-left">
        <div className="bracket-round round-left round0">
          {leftTopTeams.map((_, i) => (
            <div className="bracket-block block-left color-purple" key={i}></div>
          ))}
        </div>
        <div className="bracket-round round-left round1">
          <div className="bracket-block block-left color-pink"></div>
          <div className="bracket-block block-left color-pink"></div>
          <div className="bracket-block block-left color-pink"></div>
        </div>
        <div className="bracket-round round-left round2">
          <div className="bracket-block block-left color-orange"></div>
          <div className="bracket-block block-left color-orange"></div>
        </div>
      </div>

      {/* Left Bottom */}
      <div className="bracket-side bracket-left">
        <div className="bracket-round round-left round0">
          {leftBottomTeams.map((_, i) => (
            <div className="bracket-block block-left color-yellow" key={i}></div>
          ))}
        </div>
        <div className="bracket-round round-left round1">
          <div className="bracket-block block-left color-orange"></div>
          <div className="bracket-block block-left color-orange"></div>
          <div className="bracket-block block-left color-orange"></div>
        </div>
        <div className="bracket-round round-left round2">
          <div className="bracket-block block-left color-pink"></div>
          <div className="bracket-block block-left color-pink"></div>
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

      {/* Right Top */}
      <div className="bracket-side bracket-right">
        <div className="bracket-round round-right round0">
          {rightTopTeams.map((_, i) => (
            <div className="bracket-block block-right color-blue" key={i}></div>
          ))}
        </div>
        <div className="bracket-round round-right round1">
          <div className="bracket-block block-right color-cyan"></div>
          <div className="bracket-block block-right color-cyan"></div>
          <div className="bracket-block block-right color-cyan"></div>
        </div>
        <div className="bracket-round round-right round2">
          <div className="bracket-block block-right color-red"></div>
          <div className="bracket-block block-right color-red"></div>
        </div>
      </div>

      {/* Right Bottom */}
      <div className="bracket-side bracket-right">
        <div className="bracket-round round-right round0">
          {rightBottomTeams.map((_, i) => (
            <div className="bracket-block block-right color-orange" key={i}></div>
          ))}
        </div>
        <div className="bracket-round round-right round1">
          <div className="bracket-block block-right color-red"></div>
          <div className="bracket-block block-right color-red"></div>
          <div className="bracket-block block-right color-red"></div>
        </div>
        <div className="bracket-round round-right round2">
          <div className="bracket-block block-right color-cyan"></div>
          <div className="bracket-block block-right color-cyan"></div>
        </div>
      </div>
    </div>

    <div className="bracket-footer">Who will be the Champion?</div>
  </div>
);

export default TournamentBracket;
