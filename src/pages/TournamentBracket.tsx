import React from 'react';
import './TournamentBracket.css';

const leftTopTeams = ['Purple 1', 'Purple 2', 'Purple 3', 'Purple 4', 'Purple 5'];
const leftBottomTeams = ['Orange 1', 'Orange 2', 'Orange 3', 'Orange 4', 'Orange 5'];
const rightTopTeams = ['Blue 1', 'Blue 2', 'Blue 3', 'Blue 4', 'Blue 5'];
const rightBottomTeams = ['Red 1', 'Red 2', 'Red 3', 'Red 4', 'Red 5'];

const TournamentBracket: React.FC = () => (
  <div className="bracket-bg">
    <h2 className="bracket-title">Championship Bracket</h2>
    <div className="bracket-main">

      {/* Left Top */}
      <div className="bracket-side bracket-left">
        <div className="bracket-round round-left round0">
          {leftTopTeams.map((team, i) => (
            <div className="bracket-block block-left color-purple" key={i}>{team}</div>
          ))}
        </div>
        <div className="bracket-round round-left round1">
          <div className="bracket-block block-left color-pink">Winner 1</div>
          <div className="bracket-block block-left color-pink">Winner 2</div>
          <div className="bracket-block block-left color-pink">Winner 3</div>
        </div>
        <div className="bracket-round round-left round2">
          <div className="bracket-block block-left color-orange">Quarterfinal 1</div>
          <div className="bracket-block block-left color-orange">Quarterfinal 2</div>
        </div>
      </div>

      {/* Left Bottom */}
      <div className="bracket-side bracket-left">
        <div className="bracket-round round-left round0">
          {leftBottomTeams.map((team, i) => (
            <div className="bracket-block block-left color-yellow" key={i}>{team}</div>
          ))}
        </div>
        <div className="bracket-round round-left round1">
          <div className="bracket-block block-left color-orange">Winner 4</div>
          <div className="bracket-block block-left color-orange">Winner 5</div>
          <div className="bracket-block block-left color-orange">Winner 6</div>
        </div>
        <div className="bracket-round round-left round2">
          <div className="bracket-block block-left color-pink">Quarterfinal 3</div>
          <div className="bracket-block block-left color-pink">Quarterfinal 4</div>
        </div>
      </div>

      {/* Semifinals Left */}
      <div className="bracket-semifinals bracket-left">
        <div className="bracket-block semi color-semi-orange">Semifinal</div>
        <div className="bracket-block semi color-semi-orange">Semifinal</div>
      </div>

      {/* Center Final */}
      <div className="bracket-center">
        <div className="trophy">🏆</div>
        <div className="bracket-block final">Final</div>
      </div>

      {/* Semifinals Right */}
      <div className="bracket-semifinals bracket-right">
        <div className="bracket-block semi color-semi-red">Semifinal</div>
        <div className="bracket-block semi color-semi-red">Semifinal</div>
      </div>

      {/* Right Top */}
      <div className="bracket-side bracket-right">
        <div className="bracket-round round-right round0">
          {rightTopTeams.map((team, i) => (
            <div className="bracket-block block-right color-blue" key={i}>{team}</div>
          ))}
        </div>
        <div className="bracket-round round-right round1">
          <div className="bracket-block block-right color-cyan">Winner 7</div>
          <div className="bracket-block block-right color-cyan">Winner 8</div>
          <div className="bracket-block block-right color-cyan">Winner 9</div>
        </div>
        <div className="bracket-round round-right round2">
          <div className="bracket-block block-right color-red">Quarterfinal 5</div>
          <div className="bracket-block block-right color-red">Quarterfinal 6</div>
        </div>
      </div>

      {/* Right Bottom */}
      <div className="bracket-side bracket-right">
        <div className="bracket-round round-right round0">
          {rightBottomTeams.map((team, i) => (
            <div className="bracket-block block-right color-orange" key={i}>{team}</div>
          ))}
        </div>
        <div className="bracket-round round-right round1">
          <div className="bracket-block block-right color-red">Winner 10</div>
          <div className="bracket-block block-right color-red">Winner 11</div>
          <div className="bracket-block block-right color-red">Winner 12</div>
        </div>
        <div className="bracket-round round-right round2">
          <div className="bracket-block block-right color-cyan">Quarterfinal 7</div>
          <div className="bracket-block block-right color-cyan">Quarterfinal 8</div>
        </div>
      </div>
    </div>

    <div className="bracket-footer">Who will be the Champion?</div>
  </div>
);

export default TournamentBracket;
