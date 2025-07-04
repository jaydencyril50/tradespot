import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await adminLogin(email, password);
      localStorage.setItem('adminToken', resp.token);
      setLoading(false);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7faff' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 10, boxShadow: '0 2px 16px rgba(30,60,114,0.10)', minWidth: 320 }}>
        <h2 style={{ marginBottom: 18, color: '#1e3c72' }}>Admin Login</h2>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '95%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1px solid #e3eafc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '95%', marginBottom: 18, padding: 10, borderRadius: 6, border: '1px solid #e3eafc' }}
        />
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#1e3c72', color: '#fff', padding: 12, border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
