import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function Reports() {
    const [reportType, setReportType] = useState('revenue');
    const [dateRange, setDateRange] = useState('last-30');

    // Mock data for the demonstration
    const mockReportData = [
        { id: 1, date: '2026-01-01', description: 'Booking - Grand Hotel', amount: 450, status: 'Completed' },
        { id: 2, date: '2026-01-03', description: 'Booking - Cinema City', amount: 25, status: 'Completed' },
        { id: 3, date: '2026-01-05', description: 'Booking - Event Space A', amount: 1200, status: 'Pending' },
        { id: 4, date: '2026-01-07', description: 'Booking - Luxury Car Rental', amount: 150, status: 'Completed' },
    ];

    const handleGenerate = () => {
        alert(`Generating ${reportType} report for ${dateRange}...`);
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Analytics & Reports</h1>
                <button
                    onClick={handleGenerate}
                    className="btn btn-accent"
                    style={{ padding: '0.75rem 1.5rem' }}
                >
                    Generate Report
                </button>
            </div>

            {/* Filters Section */}
            <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Report Type</label>
                    <select
                        className="btn"
                        style={{ width: '100%', border: '1px solid var(--border)', background: 'white' }}
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value="revenue">Revenue Report</option>
                        <option value="bookings">Bookings Summary</option>
                        <option value="vendors">Vendor Performance</option>
                        <option value="inventory">Inventory Analysis</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date Range</label>
                    <select
                        className="btn"
                        style={{ width: '100%', border: '1px solid var(--border)', background: 'white' }}
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="today">Today</option>
                        <option value="last-7">Last 7 Days</option>
                        <option value="last-30">Last 30 Days</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Export Format</label>
                    <select className="btn" style={{ width: '100%', border: '1px solid var(--border)', background: 'white' }}>
                        <option value="pdf">PDF Document</option>
                        <option value="csv">CSV Spreadsheet</option>
                        <option value="excel">Excel Worksheet</option>
                    </select>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
                    <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Sales</h3>
                    <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>$12,450.00</p>
                    <p style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>↑ 12% from last month</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Bookings</h3>
                    <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>84</p>
                    <p style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>↑ 5% increase</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Avg. Order Value</h3>
                    <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>$148.20</p>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>Steady growth</p>
                </div>
            </div>

            {/* Report Data Table */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem' }}>Recent Transaction Log</h2>
                    <span style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>Showing {mockReportData.length} records</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Description</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockReportData.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>{item.date}</td>
                                <td style={{ padding: '1rem' }}>{item.description}</td>
                                <td style={{ padding: '1rem', fontWeight: '600' }}>${item.amount.toFixed(2)}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        background: item.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                                        color: item.status === 'Completed' ? '#166534' : '#92400e'
                                    }}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
