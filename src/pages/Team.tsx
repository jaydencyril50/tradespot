import React, { useEffect, useState } from 'react';
import { getTeamInfo } from '../services/api';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { formatTradeSpotDate } from '../utils/tradeSpotTime';

const Team: React.FC = () => {
  const [referralLink, setReferralLink] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

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

  // Helper to shorten the referral link for display
  const getShortLink = (link: string) => {
    if (!link) return '';
    if (link.length <= 32) return link;
    return link.slice(0, 24) + '...' + link.slice(-8);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--card-bg)',
          padding: '16px 24px 10px 18px',
          border: '1.5px solid rgba(120,130,150,0.13)',
          borderTop: 0,
          borderLeft: 0,
          borderRight: 0,
        }}
      >
        <span
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--text)',
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
            background: 'var(--card-bg)',
            borderRadius: 0,
            boxShadow: 'var(--card-shadow)',
            border: '1px solid rgba(120,130,150,0.13)',
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
              color: 'var(--text)',
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
              value={copied ? 'Copied!' : getShortLink(referralLink)}
              readOnly
              style={{
                width: '80%',
                padding: 8,
                border: '1px solid #ccc',
                fontSize: 15,
                background: 'var(--bg)',
                borderRadius: 0,
                cursor: 'pointer',
                color: copied ? 'var(--primary)' : 'var(--text)',
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
            <button
              style={{
                background: 'var(--bg)',
                border: 'none',
                borderRadius: 4,
                padding: '6px 10px',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--primary)',
                fontSize: 15,
                boxShadow: '0 1px 4px var(--bg)',
              }}
              title="Show QR Code"
              onClick={() => setShowQR(true)}
            >
              QR
            </button>
          </div>
        </div>
        {/* Total Members Card */}
        <div
          style={{
            background: 'var(--card-bg)',
            borderRadius: 0,
            boxShadow: 'var(--card-shadow)',
            border: '1px solid rgba(120,130,150,0.13)',
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
              color: 'var(--text)',
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
              background: 'var(--card-bg)',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              border: '1px solid rgba(120,130,150,0.13)',
              borderRadius: 0,
              padding: 18,
              width: '100%',
              maxWidth: 380,
              textAlign: 'center',
              fontSize: 16,
              marginBottom: 20,
              color: 'var(--text)'
            }}
          >
            Loading...
          </div>
        ) : members.length === 0 ? (
          <div
            style={{
              background: 'var(--card-bg)',
              boxShadow: '0 1px 4px rgba(30,60,114,0.10)',
              border: '1px solid rgba(120,130,150,0.13)',
              borderRadius: 0,
              padding: 18,
              width: '100%',
              maxWidth: 380,
              textAlign: 'center',
              fontSize: 16,
              marginBottom: 20,
              color: 'var(--text)'
            }}
          >
            No team members yet.
          </div>
        ) : (
          members.map((member: any, idx: number) => (
            <div
              key={member.id}
              style={{
                background: 'var(--card-bg)',
                borderRadius: 0,
                boxShadow: 'var(--card-shadow)',
                border: '1px solid rgba(120,130,150,0.13)',
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
                  color: 'var(--text)',
                  fontSize: '1.05rem',
                  marginBottom: 4,
                }}
              >
                {member.fullName}
              </div>
              <div
                style={{ color: 'var(--secondary)', fontSize: '0.97rem', marginBottom: 2 }}
              >
                {member.email}
              </div>
              <div
                style={{ color: '#888', fontSize: '0.93rem', marginBottom: 2 }}
              >
                Joined: {formatTradeSpotDate(member.joinedAt)}
              </div>
              <div style={{ fontSize: 13, marginTop: 2, color: 'var(--text)' }}>
                TradeSpoter: {member.validMember ? '✅' : '❌'}
              </div>
            </div>
          ))
        )}
        {/* QR Code Modal */}
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowQR(false)}
          >
            <motion.div
              id="qrModalCard"
              initial={{ y: 64 }}
              animate={{ y: 0 }}
              exit={{ y: 64 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                background: 'var(--card-bg)',
                padding: 24,
                borderRadius: '3px',
                boxShadow: 'var(--card-shadow)',
                border: '1px solid rgba(120,130,150,0.13)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '90vw',
                maxWidth: 320,
                minHeight: 240,
                justifyContent: 'center', // ensure vertical centering
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Responsive QR Wrapper */}
              <div
                style={{
                  background: '#fff',
                  padding: 8,
                  borderRadius: 4,
                  boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                  width: '100%',
                  maxWidth: 140,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center', // center vertically in wrapper
                  margin: '0 auto', // center horizontally in modal
                }}
              >
                <QRCodeCanvas
                  value={referralLink}
                  size={window.innerWidth < 600 ? 120 : 140}
                  bgColor="#fff"
                  fgColor="#000"
                  style={{ width: '100%', maxWidth: 140, height: 'auto', display: 'block', margin: '0 auto' }}
                />
              </div>
              <div
                style={{
                  marginTop: 25,
                  fontSize: 14,
                  color: 'var(--primary)',
                  wordBreak: 'break-word',
                  textAlign: 'center',
                  padding: '0 8px',
                }}
              >
                {referralLink}
              </div>
              <style>{`
                @media (max-width: 600px) {
                  #qrModalCard {
                    padding: 12px !important;
                    border-radius: 3px !important;
                    width: 90vw !important;
                    max-width: 70vw !important;
                    min-height: 200px !important;
                  }
                  #qrModalCard > div:first-child {
                    max-width: 90px !important;
                    max-height: 300px !important;
                    padding: 20px !important;
                    margin: 0 auto !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                  }
                  #qrModalCard canvas {
                    width: 100% !important;
                    height: auto !important;
                    max-width: 120px !important;
                    min-width: 125px !important;
                    display: block !important;
                    margin: 0 auto !important;
                  }
                  #qrModalCard div {
                    word-break: break-word !important;
                    font-size: 13px !important;
                  }
                }
              `}</style>
            </motion.div>
          </motion.div>
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
