import React from 'react';
import axios from 'axios';

const AdminRewards: React.FC = () => {
  const API = process.env.REACT_APP_API_BASE_URL || '/api';
  const [values, setValues] = React.useState<string[]>(Array(29).fill(''));
  const [saving, setSaving] = React.useState<number | null>(null);
  const [success, setSuccess] = React.useState<string>('');
  // Removed colorRowMap

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
        value: values[i]
      });
      setSuccess(`Saved #${i + 1}`);
    } catch (e: any) {
      setSuccess('Error saving');
    }
    setSaving(null);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
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
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 10px 40px 0 rgba(7, 8, 11, 0.43), 0 2px 8px 0 rgba(8,23,51,0.18)',
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
    </div>
  );
};

export default AdminRewards;
