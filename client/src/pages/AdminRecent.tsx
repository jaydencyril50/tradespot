import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Activity {
  _id: string;
  type: string;
  user: { fullName: string; email: string; spotid: string };
  createdAt: string;
  details?: any;
}

const AdminRecent: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');
        const res = await axios.get('http://localhost:5000/api/admin/recent-activities', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(res.data.activities || []);
      } catch (e: any) {
        setError(e?.response?.data?.error || e.message || 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', boxShadow: '0 4px 32px rgba(30,60,114,0.18)', padding: 24, borderRadius: 0, minHeight: 400 }}>
      <h2 style={{ fontWeight: 700, color: '#1e3c72', marginBottom: 18, fontSize: 22, letterSpacing: 1 }}>Recent Activities</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {activities.map((activity) => (
          <li key={activity._id} style={{ marginBottom: 18, borderBottom: '1px solid #eaf1fb', paddingBottom: 10 }}>
            <div style={{ fontWeight: 600, color: '#1e3c72' }}>{activity.type.replace(/_/g, ' ')}</div>
            <div style={{ fontSize: 14, color: '#25324B' }}>
              User: {activity.user.fullName} ({activity.user.email}, {activity.user.spotid})
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>{new Date(activity.createdAt).toLocaleString()}</div>
            {activity.details && (
              <pre style={{ background: '#f7faff', padding: 8, borderRadius: 4, fontSize: 13, marginTop: 6 }}>{JSON.stringify(activity.details, null, 2)}</pre>
            )}
          </li>
        ))}
        {!loading && activities.length === 0 && <li>No recent activities found.</li>}
      </ul>
    </div>
  );
};

export default AdminRecent;
