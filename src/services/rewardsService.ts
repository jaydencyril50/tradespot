import axios from 'axios';

export const fetchRewards = async () => {
  const API = process.env.REACT_APP_API_URL || '';
  const response = await axios.get(`${API}/api/reward/rewards`);
  return response.data.rewards;
};
