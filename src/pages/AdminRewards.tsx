import React from 'react';
import axios from 'axios';

const AdminRewards: React.FC = () => {
  // Editable awards table data
  const initialAwards = [
    { category: 'TOP SOUL WINNING TEAM', team: 'Team Alpha', reward: '$500' },
    { category: 'TOP DEPOSITING TEAMS', team: 'Team Beta', reward: '$400' },
    { category: 'TEAM MANAGERS AWARDS', team: 'Jane Doe', reward: '$300' },
    { category: 'TEAM ASSISTANT AWARDS', team: 'John Smith', reward: '$200' },
    { category: 'TOP TEAM ORDERS AWARDS', team: 'Mary Lee', reward: '$150' },
    { category: 'HIGHEST DEPOSITS TEAM', team: 'Chris Ray', reward: '$120' },
    { category: 'TOP USDT TEAM HOLDERS', team: 'Team Gamma', reward: '$100' },
    { category: 'TOP ADVERTISING TEAMS', team: 'Team Delta', reward: '$80' },
  ];
  const [awards, setAwards] = React.useState(initialAwards);

  const handleAwardChange = (idx: number, field: 'team' | 'reward', value: string) => {
    setAwards(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };
  const API = process.env.REACT_APP_API_BASE_URL || '/api';
  const [values, setValues] = React.useState<string[]>(Array(29).fill(''));
  React.useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await axios.get(`${API}/api/reward/rewards`);
        if (res.data && Array.isArray(res.data.rewards)) {
          const arr = Array(29).fill('');
          res.data.rewards.forEach((reward: any) => {
            if (
              typeof reward.index === 'number' &&
              reward.index >= 0 &&
              reward.index < 29 &&
              typeof reward.value === 'string'
            ) {
              arr[reward.index] = reward.value;
            }
          });
          setValues(arr);
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchRewards();
  }, [API]);
  const [saving, setSaving] = React.useState<number | null>(null);
  const [success, setSuccess] = React.useState<string>('');
  const colorRowMap = [
    'dark-yellow', 'dark-yellow', 'dark-yellow',
    'light-yellow', 'light-yellow', 'light-yellow',
    'deep-green', 'deep-green', 'deep-green',
    'light-green', 'light-green', 'light-green',
    'light-blue', 'light-blue', 'light-blue',
    'deep-blue', 'deep-blue', 'deep-blue',
    'light-red', 'light-red', 'light-red',
    'deep-red', 'deep-red', 'deep-red',
    'silver', 'silver', 'silver',
    'silver',
    'gold'
  ];

  const handleInput = (i: number, val: string) => {
    const digits = val.replace(/[^\d]/g, '').slice(0, 7);
    setValues(prev => {
      const copy = [...prev];
      copy[i] = digits;
      return copy;
    });
  };

  const handleSave = async (i: number) => {
  const API = process.env.REACT_APP_API_BASE_URL || '/api';
  const [awardSaving, setAwardSaving] = React.useState<number | null>(null);
  const [awardSuccess, setAwardSuccess] = React.useState<string>('');
  const defaultAwards = [
    { category: 'TOP SOUL WINNING TEAM', team: '', reward: '' },
    { category: 'TOP DEPOSITING TEAMS', team: '', reward: '' },
    { category: 'TEAM MANAGERS AWARDS', team: '', reward: '' },
    { category: 'TEAM ASSISTANT AWARDS', team: '', reward: '' },
    { category: 'TOP TEAM ORDERS AWARDS', team: '', reward: '' },
    { category: 'HIGHEST DEPOSITS TEAM', team: '', reward: '' },
    { category: 'TOP USDT TEAM HOLDERS', team: '', reward: '' },
    { category: 'TOP ADVERTISING TEAMS', team: '', reward: '' },
  ];
  const [awards, setAwards] = React.useState(defaultAwards);

  // Fetch awards table from backend
  React.useEffect(() => {
    const fetchAwardTable = async () => {
      try {
        const res = await axios.get(`${API}/api/reward/award-table`);
        if (res.data && Array.isArray(res.data.rows)) {
          // Map backend rows to defaultAwards order
          const updated = defaultAwards.map(row => {
            const found = res.data.rows.find((r: any) => r.category === row.category);
            return found ? { category: row.category, team: found.team, reward: found.reward } : row;
          });
          setAwards(updated);
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchAwardTable();
  }, [API]);

  // Save award row to backend
  const saveAwardRow = async (idx: number) => {
    setAwardSaving(idx);
    setAwardSuccess('');
    try {
      const row = awards[idx];
      await axios.post(`${API}/api/reward/award-table`, {
        category: row.category,
        team: row.team,
        reward: row.reward
      });
      setAwardSuccess(`Saved ${row.category}`);
    } catch (e: any) {
      setAwardSuccess('Error saving');
    }
    setAwardSaving(null);
  };
    setSaving(i);
    setSuccess('');
    try {
      await axios.post(`${API}/api/reward/reward`, {
        index: i,
        value: values[i],
        colorRow: colorRowMap[i]
      });
      setSuccess(`Saved #${i + 1}`);
    } catch (e: any) {
      setSuccess('Error saving');
    }
    setSaving(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f6f9fe',
        padding: '16px 24px 10px 18px',
        border: '1.5px solid #232b36',
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0
      }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          ADMIN REWARDS
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
          maxWidth: 540,
          margin: '24px auto',
          justifyContent: 'center',
          width: '100%',
          paddingLeft: 18,
          paddingRight: 18,
          boxSizing: 'border-box',
        }}
      >
        {[...Array(29)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '100%',
              minWidth: 0,
              aspectRatio: '1 / 1.2',
              background: i < 3
                ? '#ffffffff' // first row dark yellow
                : i < 6
                ? '#ffffffff' // second row lighter yellow
                : i < 9
                ? '#ffffffff' // third row deep green
                : i < 12
                ? '#ffffffff' // fourth row lighter green
                : i < 15
                ? '#ffffffff' // fifth row lighter blue
                : i < 18
                ? '#ffffffff' // sixth row deep blue
                : i < 21
                ? '#ffffffff' // seventh row light red
                : i < 24
                ? '#ffffffff' // eighth row deep red
                : i < 27
                ? '#ffffffff' // ninth row silver
                : i < 28
                ? '#ffffffff' // tenth row, last card silver
                : i < 29
                ? '#ffffffff' // eleventh row, last card gold
                : '#f7f7f7',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(37, 38, 40, 0.7), 0 2px 8px rgba(30,60,114,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 10,
              boxSizing: 'border-box',
              marginBottom: 0,
              height: 110,
              maxWidth: 150,
            }}
          >
            <label style={{ display: 'block', marginBottom: 7, fontWeight: 700, color: '#1e3c72', fontSize: 15, textAlign: 'center', letterSpacing: 1 }}>
              #{i + 1}
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={7}
              placeholder={`Award`}
              value={values[i]}
              onChange={e => handleInput(i, e.target.value)}
              style={{
                width: '100%',
                minWidth: 0,
                height: 30,
                borderRadius: 6,
                border: '1px solid #ccc',
                fontSize: 14,
                textAlign: 'center',
                boxSizing: 'border-box',
                background: '#fff',
                marginBottom: 2,
              }}
            />
            <button
              style={{
                marginTop: 4,
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                background: '#232b36',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13,
                opacity: saving === i ? 0.6 : 1
              }}
              disabled={saving === i || !values[i]}
              onClick={() => handleSave(i)}
            >{saving === i ? 'Saving...' : 'Save'}</button>
          </div>
        ))}
      </div>
      {success && <div style={{textAlign:'center',marginTop:12,color:'#176a3aff',fontWeight:600}}>{success}</div>}
      <style>{`
        @media (max-width: 600px) {
          div[style*='grid'] {
            padding-left: 2vw !important;
            padding-right: 2vw !important;
          }
          input[type="text"] {
            font-size: 14px !important;
            height: 32px !important;
          }
        }
      `}</style>

      {/* Awards Table Below Rewards */}
      <div className="awards-table-container" style={{ maxWidth: 600, margin: '32px auto', padding: '0 12px' }}>
        <table className="awards-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#f7f7f7', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(30,60,114,0.10)' }}>
          <thead>
            <tr>
              <th style={{ background: '#232b36', color: '#fff', padding: '12px 8px', fontWeight: 700, fontSize: 15 }}>AWARD CATEGORY</th>
              <th style={{ background: '#232b36', color: '#fff', padding: '12px 8px', fontWeight: 700, fontSize: 15 }}>TEAMS</th>
              <th style={{ background: '#232b36', color: '#fff', padding: '12px 8px', fontWeight: 700, fontSize: 15 }}>REWARDS</th>
            </tr>
          </thead>
          <tbody>
            {awards.map((row, idx) => (
              <tr key={idx}>
                <td style={{ padding: '10px 8px', fontWeight: 600 }}>{row.category}</td>
                <td style={{ padding: '10px 8px' }}>
                  <input
                    type="text"
                    value={row.team}
                    onChange={e => handleAwardChange(idx, 'team', e.target.value)}
                    style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', fontSize: 14, textAlign: 'center', boxSizing: 'border-box', background: '#fff', padding: '4px 8px' }}
                  />
                </td>
                <td style={{ padding: '10px 8px' }}>
                  <input
                    type="text"
                    value={row.reward}
                    onChange={e => handleAwardChange(idx, 'reward', e.target.value)}
                    style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', fontSize: 14, textAlign: 'center', boxSizing: 'border-box', background: '#fff', padding: '4px 8px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRewards;
