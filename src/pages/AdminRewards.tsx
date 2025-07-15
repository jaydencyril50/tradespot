import React from 'react';
import axios from 'axios';

// Add rewards state and fetchRewards function
const fetchRewards = async () => {
  try {
    const API = process.env.REACT_APP_API_BASE_URL || '/api';
    const res = await axios.get(`${API}/api/reward/reward`);
    return res.data;
  } catch {
    return [];
  }
};

const AdminRewards: React.FC = () => {
  const API = process.env.REACT_APP_API_BASE_URL || '/api';
  const [rewards, setRewards] = React.useState<any[]>([]);
  const [values, setValues] = React.useState<string[]>(Array(29).fill(''));
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

  // Periodically fetch rewards every 3 seconds
  React.useEffect(() => {
    fetchRewards().then(setRewards).catch(() => setRewards([]));
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
  const handleInput = (i: number, val: string) => {
    const digits = val.replace(/[^\d]/g, '').slice(0, 7);
    setValues(prev => {
      const copy = [...prev];
      copy[i] = digits;
      return copy;
    });
  };

  const handleSave = async (i: number) => {
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
                ? '#b5aa2dff' // first row dark yellow
                : i < 6
                ? '#e9c537ff' // second row lighter yellow
                : i < 9
                ? '#176a3aff' // third row deep green
                : i < 12
                ? '#6edc7aff' // fourth row lighter green
                : i < 15
                ? '#7ecbff' // fifth row lighter blue
                : i < 18
                ? '#325ed7ff' // sixth row deep blue
                : i < 21
                ? '#e04646ff' // seventh row light red
                : i < 24
                ? '#ef3333ff' // eighth row deep red
                : i < 27
                ? '#7a7575ff' // ninth row silver
                : i < 28
                ? '#8b8585ff' // tenth row, last card silver
                : i < 29
                ? '#ff8c00ff' // eleventh row, last card gold
                : '#f7f7f7',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(8, 23, 51, 0.4), 0 2px 8px rgba(30,60,114,0.18)',
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
      {/* Display fetched rewards data for debugging/visualization */}
      <div style={{maxWidth:540,margin:'18px auto',padding:12,background:'#f6f9fe',borderRadius:8,fontSize:13,color:'#232b36'}}>
        <div style={{fontWeight:600,marginBottom:6}}>Fetched Rewards Data:</div>
        <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all',margin:0}}>{JSON.stringify(rewards, null, 2)}</pre>
      </div>
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
    </div>
  );
};

export default AdminRewards;
