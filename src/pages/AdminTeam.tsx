import React, { useEffect, useState } from 'react';
import { getAdminTeamUsers } from '../services/api';
import { getUserTeamMembers } from '../services/teamService';
import TeamMembersTableModal from '../components/TeamMembersTableModal';

interface TeamUser {
  id: string;
  fullName: string;
  email: string;
  teamCount: number;
}

interface TeamMember {
  spotid: string;
  email?: string;
}

const AdminTeam: React.FC = () => {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMembers, setModalMembers] = useState<TeamMember[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getAdminTeamUsers();
        setUsers(data);
        setError('');
      } catch (e: any) {
        setError(e.message || 'Failed to load team users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f9fe', padding: '16px 24px 10px 18px', border: '1.5px solid #232b36', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#232b36', letterSpacing: 1, fontFamily: 'serif' }}>
          ADMIN TEAM
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        {loading && <div style={{ color: '#1e3c72', fontWeight: 500 }}>Loading...</div>}
        {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {!loading && !error && users.length === 0 && (
          <div style={{ color: '#888', fontSize: 16, textAlign: 'center', margin: '40px 0' }}>No users with team members found.</div>
        )}
        {!loading && !error && users.length > 0 && (
          users.map((user) => (
            <div
              key={user.id}
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
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={async () => {
                setSelectedUser(user);
                setModalOpen(true);
                setModalLoading(true);
                setModalError('');
                setModalMembers([]);
                try {
                  const data = await getUserTeamMembers(user.id);
                  setModalMembers(data.members || []);
                } catch (e: any) {
                  setModalError(e.message || 'Failed to load team members');
                } finally {
                  setModalLoading(false);
                }
              }}
            >
              <div style={{ fontWeight: 700, color: '#25324B', fontSize: '1.1rem', letterSpacing: 1, marginBottom: 6 }}>{user.fullName}</div>
              <div style={{ fontSize: '1.05rem', color: '#1e3c72', fontWeight: 600, marginBottom: 2 }}>{user.email}</div>
              <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 2 }}>Team Members: <span style={{ fontWeight: 700 }}>{user.teamCount}</span></div>
            </div>
          ))
        )}
      </div>
      <TeamMembersTableModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        members={modalMembers}
      />
      {modalOpen && modalLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(255,255,255,0.8)', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(30,60,114,0.18)', color: '#1e3c72', fontWeight: 600, fontSize: 18 }}>Loading team members...</div>
        </div>
      )}
      {modalOpen && modalError && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(30,60,114,0.18)', color: '#e74c3c', fontWeight: 600, fontSize: 18 }}>{modalError}</div>
        </div>
      )}
      <style>{`
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
      `}</style>
    </div>
  );
};

export default AdminTeam;
