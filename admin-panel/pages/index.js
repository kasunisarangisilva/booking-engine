import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const API_BASE = 'http://localhost:5000/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/reports`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard Overview</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>Last 7 Days</button>
          <button className="btn btn-accent">Download Report</button>
        </div>
      </div>

      {/* Main Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Revenue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>
            ${stats?.totalRevenue || 0}
          </p>
          <p style={{ color: '#10b981', fontSize: '0.8125rem', marginTop: '0.5rem' }}>↑ 14% vs last week</p>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, fontSize: '5rem' }}>💰</div>
        </div>
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Bookings</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {stats?.totalBookings || 0}
          </p>
          <p style={{ color: '#10b981', fontSize: '0.8125rem', marginTop: '0.5rem' }}>↑ 8% vs last week</p>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, fontSize: '5rem' }}>📅</div>
        </div>
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Listings</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {stats?.totalListings || 0}
          </p>
          <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem' }}>↓ 2% vs last week</p>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, fontSize: '5rem' }}>📑</div>
        </div>
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Vendors</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {stats?.totalVendors || 12}
          </p>
          <p style={{ color: '#10b981', fontSize: '0.8125rem', marginTop: '0.5rem' }}>↑ 3 new today</p>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, fontSize: '5rem' }}>👥</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Recent Bookings / Performance Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Platform Growth</h2>
            <Link href="/reports" style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none' }}>View Detailed Reports →</Link>
          </div>
          <div style={{ height: '240px', background: '#f8fafc', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)' }}>
            <p style={{ color: 'var(--secondary)' }}>Chart Visualization Area (Revenue vs Time)</p>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { text: 'New vendor "Oceanic Stays" registered', time: '10 mins ago', icon: '👤' },
              { text: 'Booking #842 completed by User42', time: '2 hours ago', icon: '✅' },
              { text: 'New listing "Mountain Cabin" pending approval', time: '5 hours ago', icon: '🔔' },
              { text: 'Payout of $4,200 processed to VendorX', time: '1 day ago', icon: '💸' },
            ].map((activity, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: '1.25rem' }}>{activity.icon}</div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '500' }}>{activity.text}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--secondary)' }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Helper component for the Link
function Link({ href, children, style }) {
  return <a href={href} style={style}>{children}</a>;
}

