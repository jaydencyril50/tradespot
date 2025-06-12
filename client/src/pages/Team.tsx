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
    <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', boxShadow: '0 2px 16px rgba(30,60,114,0.10)', padding: 24 }}>
      <h2 style={{ color: '#1e3c72', marginBottom: 24, textAlign: 'center' }}>My Team</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, color: '#25324B', marginBottom: 8 }}>Your Referral Link:</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            value={copied ? 'Copied!' : referralLink}
            readOnly
            style={{ width: '97%', padding: 8, border: '1px solid #ccc', fontSize: 15, background: '#f7faff', borderRadius: 0, cursor: 'pointer', color: copied ? '#1e3c72' : undefined, fontWeight: copied ? 600 : undefined }}
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
            onClick={async () => {
              if (referralLink) {
                await navigator.clipboard.writeText(referralLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }
            }}
            style={{ padding: '7px 14px', background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 14 }}
            type="button"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div style={{ fontWeight: 600, color: '#25324B', marginBottom: 8 }}>
        Total Members: {members.length}
      </div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', background: '#f7faff', borderRadius: 0 }}>
          <thead>
            <tr style={{ background: '#eaf1fb' }}>
              <th style={{ padding: 10, textAlign: 'left', color: '#1e3c72' }}>Name</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#1e3c72' }}>Email</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#1e3c72' }}>Joined</th>
              <th style={{ padding: 10, textAlign: 'center', color: '#1e3c72' }}>Active Stock</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 18 }}>Loading...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 18 }}>No team members yet.</td></tr>
            ) : (
              members.map((member: any) => (
                <tr key={member.id}>
                  <td style={{ padding: 10 }}>{member.fullName}</td>
                  <td style={{ padding: 10 }}>{member.email}</td>
                  <td style={{ padding: 10 }}>{new Date(member.joinedAt).toLocaleDateString()}</td>
                  <td style={{ padding: 10, textAlign: 'center', fontSize: 20 }}>
                    {member.activeStock ? '✅' : '❌'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Team;
