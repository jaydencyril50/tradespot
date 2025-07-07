import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

// Check if a user is a valid user (has at least 0.6 SPOT in staking)
export const isValidUser = async (userId: string): Promise<boolean> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  const res = await axios.get(`${API}/api/user/${userId}/is-valid-user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.isValidUser;
};
