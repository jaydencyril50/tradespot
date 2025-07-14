import React from 'react';

const AdminRewards: React.FC = () => {
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
                pattern="\\d*"
                maxLength={7}
                placeholder={`Award`}
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
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^\d]/g, '').slice(0, 7);
                }}
              />
            </div>
          ))}
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
