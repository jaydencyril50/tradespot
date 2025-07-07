import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

export const getUserTeamMembers = async (userId: string) => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) throw new Error('Not authenticated as admin');
  const res = await axios.get(`${API}/api/admin/team-members/${userId}`,
    { headers: { Authorization: `Bearer ${adminToken}` } });
  return res.data;
};
