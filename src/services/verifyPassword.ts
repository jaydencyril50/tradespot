import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

export const verifyPassword = async (password: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.post(`${API}/api/verify-password`, { password }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
