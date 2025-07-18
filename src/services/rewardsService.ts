import axios from 'axios';

export const fetchRewards = async (token: string) => {
  const API = process.env.REACT_APP_API_BASE_URL || '';
  const response = await axios.get(`${API}/api/reward/rewards/${token}`);
  return response.data.rewards;
};
