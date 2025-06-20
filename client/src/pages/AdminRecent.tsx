import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Activity {
  _id: string;
  type: string;
  user: { fullName: string; email: string; spotid: string };
  createdAt: string;
  details?: any;
}

const API = process.env.REACT_APP_API_BASE_URL;

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
        const res = await axios.get(`${API}/api/admin/recent-activities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Only keep activities from the last 7 days
        const now = Date.now();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const filtered = (res.data.activities || []).filter((a: Activity) => now - new Date(a.createdAt).getTime() <= sevenDaysMs);
        setActivities(filtered);
      } catch (e: any) {
        setError(e?.response?.data?.error || e.message || 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f6f9fe',
          padding: '16px 24px 10px 18px',
          border: '1.5px solid #232b36',
          borderTop: 0,
          borderLeft: 0,
          borderRight: 0,
        }}
      >
        <span
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#232b36',
            letterSpacing: 1,
            fontFamily: 'serif',
          }}
        >
          RECENT ACTIVITIES
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 30,
          gap: 20,
          marginBottom: 40,
        }}
      >
        {loading && <div style={{ color: '#1e3c72', fontWeight: 500 }}>Loading...</div>}
        {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {!loading && activities.length === 0 && (
          <div style={{ color: '#888', fontSize: 16, textAlign: 'center', margin: '40px 0' }}>
            No recent activities found.
          </div>
        )}
        {!loading && activities.length > 0 && (
          activities.map((activity) => (
            <div
              key={activity._id}
              style={{
                background: '#fff',
                borderRadius: 0,
                boxShadow: '0 12px 40px 0 rgba(30,60,114,0.38), 0 4px 16px 0 rgba(30,60,114,0.22)',
                border: '1px solid #e3e6ef',
                padding: '12px 16px',
                minWidth: 200,
                maxWidth: 380,
                width: '100%',
                textAlign: 'left',
                marginBottom: 0,
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 6,
              }}
            >
              <div style={{ fontWeight: 700, color: '#1e3c72', fontSize: 18, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left' }}>
                {activity.type.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: 16, color: '#25324B', fontWeight: 600, marginBottom: 0, textAlign: 'left' }}>
                <span>{activity.user.fullName}</span>
                <span style={{ color: '#6c7a89', fontWeight: 400, fontSize: 15, marginLeft: 6 }}>
                  ({activity.user.email}, {activity.user.spotid})
                </span>
              </div>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 2, textAlign: 'left' }}>
                {new Date(activity.createdAt).toLocaleString()}
              </div>
              {activity.details && (
                <div
                  style={{
                    background: '#f7faff',
                    padding: '8px 12px',
                    borderRadius: 4,
                    fontSize: 13,
                    marginTop: 6,
                    color: '#1e3c72',
                    border: '1px solid #eaf1fb',
                    width: '100%',
                    textAlign: 'left',
                    marginBottom: 0,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                  }}
                >
                  {(() => {
                    if (activity.type === 'USER_UPDATE' && activity.details.updatedFields) {
                      const fields = Object.entries(activity.details.updatedFields)
                        .map(([key, value]) => {
                          if (typeof value === 'object' && value !== null && 'old' in value && 'new' in value) {
                            return `${key} changed from ${value.old === null ? 'null' : value.old} to ${value.new === null ? 'null' : value.new}`;
                          } else {
                            return `${key} set to ${value === null ? 'null' : value}`;
                          }
                        })
                        .join('; ');
                      return (
                        <span>
                          Admin updated user <b>{activity.user.fullName}</b> ({activity.user.email}, {activity.user.spotid}): {fields}
                        </span>
                      );
                    }
                    // Add more activity type explanations here as needed
                    return <span>{Object.keys(activity.details).length ? 'Details: ' + JSON.stringify(activity.details) : 'No further details.'}</span>;
                  })()}
                </div>
              )}
            </div>
          ))
        )}
        <style>
          {`
            @media (max-width: 600px) {
              div[style*="box-shadow"] {
                max-width: 90vw !important;
                min-width: 0 !important;
                width: 90vw !important;
                margin-left: 5vw !important;
                margin-right: 5vw !important;
                padding: 10px 2vw !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AdminRecent;
