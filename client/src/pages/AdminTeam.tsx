import React, { useEffect, useState } from 'react';
import { getAdminTeamUsers } from '../services/api';

interface TeamUser {
  id: string;
  fullName: string;
  email: string;
  teamCount: number;
}

const AdminTeam: React.FC = () => {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Users with Team Members</h1>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : users.length === 0 ? (
        <div>No users with team members found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f6f9fe' }}>
              <th style={{ padding: 8, border: '1px solid #e3e6ef' }}>Full Name</th>
              <th style={{ padding: 8, border: '1px solid #e3e6ef' }}>Email</th>
              <th style={{ padding: 8, border: '1px solid #e3e6ef' }}># of Team Members</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ padding: 8, border: '1px solid #e3e6ef' }}>{user.fullName}</td>
                <td style={{ padding: 8, border: '1px solid #e3e6ef' }}>{user.email}</td>
                <td style={{ padding: 8, border: '1px solid #e3e6ef', textAlign: 'center' }}>{user.teamCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTeam;
