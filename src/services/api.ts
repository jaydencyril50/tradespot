import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

export const fetchMarketData = async () => {
    try {
        const response = await axios.get(`${API}/market-data`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching market data');
    }
};

export const fetchUserPortfolio = async (userId: string) => {
    try {
        const response = await axios.get(`${API}/users/${userId}/portfolio`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching user portfolio');
    }
};

export const executeTrade = async (tradeDetails: any) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    try {
        const response = await axios.post(`${API}/api/simulated-sellers/buy`, tradeDetails, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Error executing trade');
    }
};

export const loginUser = async (email: string, password: string, twoFAToken?: string) => {
    try {
        const payload: any = { email, password };
        if (twoFAToken) payload.twoFAToken = twoFAToken;
        const response = await axios.post(`${API}/auth/login`, payload);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Login failed');
    }
};

// Update registerUser to throw backend error message if available
export const registerUser = async (fullName: string, email: string, password: string, wallet: string, referredBy?: string) => {
    try {
        const response = await axios.post(`${API}/auth/register`, { fullName, email, password, wallet, referredBy });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Registration failed');
    }
};

// Add new getPortfolio and convertBalance
export const getPortfolio = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.get(`${API}/api/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Convert FLEX to USDT only
export const convertBalance = async (amount: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.post(`${API}/api/convert`, { direction: 'FLEX_TO_USDT', amount }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Add getTeamInfo API call to fetch referral link and team members for the Team page.
export const getTeamInfo = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.get(`${API}/api/team`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Add a function to the API service to validate if a referral code exists in the backend.
export const validateReferralCode = async (code: string) => {
    const res = await axios.get(`${API}/api/validate-referral/${code}`);
    return res.data.valid;
};

// Transfer SPOT to another user by email
export const transferSpot = async (recipientEmail: string, amount: number, twoFAToken: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.post(`${API}/api/transfer`, { recipientEmail, amount, twoFAToken }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Add API functions to send the name change verification code and to change the user's name after code verification.
export const sendNameVerificationCode = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.post(`${API}/api/send-name-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const changeName = async (newName: string, code: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    try {
        const res = await axios.post(`${API}/api/change-name`, { newName, code }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            // Return the backend error message as the error message
            throw new Error(error.response.data.error);
        }
        // If no backend error, show the default axios error message
        throw new Error(error.message || 'Failed to update name.');
    }
};

// Add API functions to send verification code and change for email and wallet, similar to name change functions.
export const sendEmailVerificationCode = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.post(`${API}/api/send-email-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const changeEmail = async (newEmail: string, spotid: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.post(`${API}/api/change-email`, { newEmail, spotid }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const sendWalletVerificationCode = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.post(`${API}/api/send-wallet-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const changeWallet = async (newWallet: string, code: string, spotid: string, twoFAToken: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.post(`${API}/api/change-wallet`, { newWallet, code, spotid, twoFAToken }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Add this function to actually call the backend for password verification code (placeholder for now)
export const sendPasswordVerificationCode = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.post(`${API}/api/send-password-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Send funds privacy verification code to email
export const sendFundsPrivacyVerificationCode = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.post(`${API}/api/send-funds-privacy-code`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Verify funds privacy (lock funds actions)
export const verifyFundsPrivacy = async (spotid: string, emailCode: string, password: string, twoFAToken: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.post(`${API}/api/verify-funds-privacy`, {
        spotid, emailCode, password, twoFAToken
    }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Change password
export const changePassword = async (newPassword: string, code: string, spotid: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const payload = { newPassword, code, spotid }; // REMOVE twoFAToken from payload
    const res = await axios.post(`${API}/api/change-password`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Admin login
export const adminLogin = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API}/auth/admin/login`, { email, password });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Admin login failed');
    }
};

// Add an API function to fetch all users (for admin).
export const getAllUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await axios.get(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// ADMIN: Get all users who have team members and the number of members they have
export const getAdminTeamUsers = async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) throw new Error('Not authenticated as admin');
    const res = await axios.get(`${API}/api/admin/team-users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    return res.data;
};

// API call to resolve email to userId
export const getUserIdByEmail = async (email: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  const res = await axios.post(`${API}/api/get-user-id`, { email }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.userId;
};