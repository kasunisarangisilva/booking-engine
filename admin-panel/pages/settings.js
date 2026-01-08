import AdminLayout from '../components/AdminLayout';

export default function Settings() {
    return (
        <AdminLayout>
            <h1>Platform Settings</h1>
            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Platform Name</label>
                    <input type="text" defaultValue="Multi-Vendor Booking" className="btn" style={{ border: '1px solid var(--border)', background: 'white', cursor: 'text', width: '300px' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Commission Rate (%)</label>
                    <input type="number" defaultValue="10" className="btn" style={{ border: '1px solid var(--border)', background: 'white', cursor: 'text', width: '300px' }} />
                </div>
                <button className="btn btn-accent">Save Changes</button>
            </div>
        </AdminLayout>
    );
}
