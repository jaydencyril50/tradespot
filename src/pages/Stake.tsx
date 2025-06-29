import React, { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { getPortfolio } from '../services/api';
import axios from 'axios';
import StakeHistoryModal from '../components/StakeHistoryModal';

const API = process.env.REACT_APP_API_BASE_URL;

const vipConfigs = [
  { level: 1, rate: 0.02, label: '2%', min: 0.06, max: 1, invitees: 0, rule: 'Stake 0.06 to 1 SPOT, no invitee needed.' },
  { level: 2, rate: 0.028, label: '2.8%', min: 0.2, max: 4, invitees: 10, rule: 'Stake 0.2 to 4 SPOT, 10 invitees needed.' },
  { level: 3, rate: 0.035, label: '3.5%', min: 1, max: 0, invitees: 30, rule: 'Stake 1 SPOT and above, 30 invitees needed.' },
];

const Stake: React.FC = () => {
  const [vipLevel, setVipLevel] = useState<number>(1);
  const [stakeInput, setStakeInput] = useState<string>('');
  const [spotBalance, setSpotBalance] = useState<number>(0);
  const [activeInput, setActiveInput] = useState<string>('');
  const [stakeError, setStakeError] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [userInvitees, setUserInvitees] = useState<number>(0);

  React.useEffect(() => {
    // Fetch spot balance and invitee count from backend
    const fetchSpotBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await axios.get(`${API}/api/trade/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSpotBalance(res.data.spotBalance || 0);
        setUserInvitees(res.data.validInvitees || 0); // validInvitees should be provided by backend
      } catch {
        setSpotBalance(0);
        setUserInvitees(0);
      }
    };
    fetchSpotBalance();
  }, []);

  const handleStake = async (level: number, rate: number) => {
    setStakeError('');
    if (!activeInput || isNaN(Number(activeInput))) return;
    const amount = Number(activeInput);
    const vip = vipConfigs.find(v => v.level === level);
    if (!vip) return;
    // VIP staking rules
    if (amount < vip.min || (vip.max > 0 && amount > vip.max)) {
      setStakeError(`Amount must be between ${vip.min} and ${vip.max > 0 ? vip.max : '∞'} SPOT for VIP ${level}`);
      return;
    }
    if (amount > spotBalance) {
      setStakeError('Insufficient SPOT balance');
      return;
    }
    if (userInvitees < vip.invitees) {
      setStakeError(`You need at least ${vip.invitees} valid invitees for VIP ${level}`);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.post(`${API}/api/staking`, {
        amount,
        vipLevel: level,
        dailyRate: vip.rate,
        durationDays: 365
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpotBalance(prev => prev - amount); // Optimistic update
      setActiveInput('');
    } catch (e: any) {
      setStakeError(e?.response?.data?.error || e.message || 'Failed to stake');
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
            STAKING
          </span>
          <button
            style={{
              background: '#888',
              color: '#fff',
              border: 'none',
              borderRadius: 0,
              padding: '6px 18px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              transition: 'background 0.2s',
              marginLeft: 12,
            }}
            className="market-history-btn"
            onClick={() => setShowHistory(true)}
          >
            History
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20, marginBottom: 40 }}>
          {vipConfigs.map((vip) => (
            <div key={vip.level}
              style={{
                background: '#fff',
                borderRadius: 0,
                boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
                border: '1px solid #e3e6ef',
                padding: '12px 16px',
                minWidth: 200,
                maxWidth: 380,
                width: '100%',
                textAlign: 'center',
                marginBottom: 0,
                fontFamily: 'inherit',
                opacity: vipLevel === vip.level ? 1 : 0.6,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: '1.05rem', color: '#1e3c72', marginBottom: 6 }}>
                VIP Level: <b>{vip.level}</b>
              </div>
              <div style={{ fontSize: '1.05rem', color: '#10c98f', fontWeight: 700, marginBottom: 10 }}>
                Daily Staking Profit: <b>{vip.label}</b>
              </div>
              <div style={{ fontSize: '0.97rem', color: '#e67e22', marginBottom: 8, fontWeight: 500 }}>
                {vip.rule}
              </div>
              {vip.invitees > 0 && (
                <div style={{ fontSize: '0.95rem', color: '#888', marginBottom: 4 }}>
                  Your valid invitees: {userInvitees} / {vip.invitees}
                </div>
              )}
              {stakeError && (
                <div style={{ color: '#ea3943', fontWeight: 600, marginBottom: 8, fontSize: '1rem', textAlign: 'center' }}>{stakeError}</div>
              )}
              <input
                type="number"
                placeholder="SPOT to stake"
                value={vipLevel === vip.level ? activeInput : ''}
                onChange={e => vipLevel === vip.level && setActiveInput(e.target.value)}
                min={0.1}
                step={0.01}
                disabled={vipLevel !== vip.level}
                style={{ border: '1px solid #e3e6ef', borderRadius: 0, padding: '8px 12px', fontSize: '1rem', width: 180, marginBottom: 8, textAlign: 'center', background: vipLevel !== vip.level ? '#eee' : '#fff', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
              />
              <button
                style={{ background: vipLevel === vip.level ? '#10c98f' : '#888', color: '#fff', border: 'none', borderRadius: 0, padding: '6px 28px', fontWeight: 600, fontSize: '1rem', cursor: vipLevel === vip.level ? 'pointer' : 'not-allowed', boxShadow: '0 1px 4px rgba(30,60,114,0.10)', transition: 'background 0.2s', marginBottom: 10, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                onClick={() => vipLevel === vip.level && handleStake(vip.level, vip.rate)}
                disabled={vipLevel !== vip.level}
              >
                Stake
              </button>
            </div>
          ))}
          {/* SPOT Balance Card */}
          <div style={{
            background: '#fff',
            borderRadius: 0,
            boxShadow: '0 12px 40px 0 rgba(30,60,114,0.18), 0 2px 8px 0 rgba(30,60,114,0.10)',
            border: '1px solid #e3e6ef',
            padding: '4px 8px',
            minWidth: 120,
            maxWidth: 320,
            width: '100%',
            textAlign: 'center',
            fontFamily: 'inherit',
            fontWeight: 700,
            color: '#10c98f',
            fontSize: '1rem',
            marginTop: 8
          }}>
            SPOT Balance: {spotBalance}
          </div>
          <style>
            {`
              @media (max-width: 600px) {
                div[style*="SPOT Balance"] {
                  min-width: 90vw !important;
                  max-width: 90vw !important;
                  font-size: 0.98rem !important;
                  padding: 3px 2vw !important;
                }
              }
            `}
          </style>
        </div>
        <StakeHistoryModal open={showHistory} onClose={() => setShowHistory(false)} />
      </div>
    </ProtectedRoute>
  );
};

export default Stake;
