import React, { useEffect, useState } from 'react';
import { getTeamInfo } from '../services/api';

const Team: React.FC = () => {
  const [referralLink, setReferralLink] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const data = await getTeamInfo();
        setReferralLink(data.referralLink);
        setMembers(data.members);
        setError('');
      } catch (e: any) {
        setError(e.message || 'Failed to load team info');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f6f9fe',
          padding: '16px 24px 10px 18px',
          border: '1.5px solid #232b36',
          borderTop: 0,
          borderLeft: 0,
          borderRight: 0,
        }}
      >
        <span
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#232b36',
            letterSpacing: 1,
            fontFamily: 'serif',
          }}
        >
          MY TEAM
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 30,
          gap: 20,
        }}
      >
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        {/* Referral Link Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 0,
            boxShadow:
              '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
            border: '1px solid #e3e6ef',
            padding: '12px 16px',
            minWidth: 200,
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            marginBottom: 0,
            fontFamily: 'inherit',
            height: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '1.1rem',
              marginBottom: 4,
              fontWeight: 700,
              color: '#25324B',
              letterSpacing: 1,
            }}
          >
            Your Referral Link
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <input
              type="text"
              value={copied ? 'Copied!' : referralLink}
              readOnly
              style={{
                width: '90%',
                padding: 8,
                border: '1px solid #ccc',
                fontSize: 15,
                background: '#f7faff',
                borderRadius: 0,
                cursor: 'pointer',
                color: copied ? '#1e3c72' : undefined,
                fontWeight: copied ? 600 : undefined,
              }}
              onFocus={e => e.target.select()}
              onClick={async () => {
                if (referralLink) {
                  await navigator.clipboard.writeText(referralLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }
              }}
            />
          </div>
        </div>
        {/* Total Members Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 0,
            boxShadow:
              '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
            border: '1px solid #e3e6ef',
            padding: '12px 16px',
            minWidth: 200,
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            marginBottom: 0,
            fontFamily: 'inherit',
            height: 80,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: '#25324B',
              fontSize: '1.1rem',
              letterSpacing: 1,
            }}
          >
            Total Members: {members.length}
          </div>
        </div>
        {/* Members List Cards */}
        {loading ? (
          <div
            style={{
              background: '#fff',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              border: '1px solid #e3e6ef',
              borderRadius: 0,
              padding: 18,
              width: '100%',
              maxWidth: 380,
              textAlign: 'center',
              fontSize: 16,
              marginBottom: 20,
            }}
          >
            Loading...
          </div>
        ) : members.length === 0 ? (
          <div
            style={{
              background: '#fff',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              border: '1px solid #e3e6ef',
              borderRadius: 0,
              padding: 18,
              width: '100%',
              maxWidth: 380,
              textAlign: 'center',
              fontSize: 16,
              marginBottom: 20,
            }}
          >
            No team members yet.
          </div>
        ) : (
          members.map((member: any, idx: number) => (
            <div
              key={member.id}
              style={{
                background: '#fff',
                borderRadius: 0,
                boxShadow:
                  '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
                border: '1px solid #e3e6ef',
                padding: '12px 16px',
                minWidth: 200,
                maxWidth: 380,
                width: '100%',
                textAlign: 'center',
                marginBottom: idx === members.length - 1 ? 20 : 0,
                fontFamily: 'inherit',
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: '#25324B',
                  fontSize: '1.05rem',
                  marginBottom: 4,
                }}
              >
                {member.fullName}
              </div>
              <div
                style={{ color: '#555', fontSize: '0.97rem', marginBottom: 2 }}
              >
                {member.email}
              </div>
              <div
                style={{ color: '#888', fontSize: '0.93rem', marginBottom: 2 }}
              >
                Joined: {new Date(member.joinedAt).toLocaleDateString()}
              </div>
              <div style={{ fontSize: 13, marginTop: 2 }}>
                TradeSpoter: {member.validMember ? '✅' : '❌'}
              </div>
            </div>
          ))
        )}
        <style>
          {`
            @media (max-width: 600px) {
              div[style*="box-shadow"] {
                max-width: 90vw !important;
                min-width: 0 !important;
                width: 90vw !important;
                margin-left: 5vw !important;
                margin-right: 5vw !important;
                padding: 10px 2vw !important;
                height: 90px !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};
export default Team;
