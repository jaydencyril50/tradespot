import './InvitationCompetition.css';

import { useEffect, useState } from 'react';

interface UserRanking {
  spotId: string;
  newTeamMembers: number;
}

const InvitationCompetition: React.FC = () => {
  const [rankings, setRankings] = useState<UserRanking[]>([]);

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
      <div className="party-bg">
        {rainDrops}
        {flashLights}
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
