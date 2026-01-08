import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const API_BASE = 'http://localhost:5000/api';

export default function Vendors() {
    const [vendors, setVendors] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/vendors`);
            // Add mock status and type for demonstration since it might not be in the real API yet
            const enrichedVendors = res.data.map(v => ({
                ...v,
                status: v.isApproved ? 'active' : 'pending',
                type: ['Hotel', 'Cinema', 'Rental'][Math.floor(Math.random() * 3)],
                joined: '2025-11-12'
            }));
            setVendors(enrichedVendors);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'approve') {
                await axios.post(`${API_BASE}/admin/vendors/approve`, { vendorId: id });
                alert('Vendor approved');
            } else {
                alert(`Vendor ${action} action performed (Mock)`);
            }
            fetchVendors();
        } catch (err) {
            alert('Action failed');
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Vendor Management</h1>
                <div style={{ position: 'relative', width: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        className="btn"
                        style={{ width: '100%', paddingLeft: '2.5rem', background: 'white', border: '1px solid var(--border)', cursor: 'text' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                </div>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                            <th style={{ padding: '1rem' }}>Vendor Details</th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Member Since</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVendors.map(vendor => (
                            <tr key={vendor.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: '600' }}>{vendor.name}</div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>{vendor.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>{vendor.type}</td>
                                <td style={{ padding: '1rem', color: 'var(--secondary)' }}>{vendor.joined}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        background: vendor.status === 'active' ? '#dcfce7' : '#fef3c7',
                                        color: vendor.status === 'active' ? '#166534' : '#92400e',
                                        textTransform: 'capitalize'
                                    }}>
                                        {vendor.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {vendor.status === 'pending' && (
                                            <button onClick={() => handleAction(vendor.id, 'approve')} className="btn btn-accent" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }}>
                                                Approve
                                            </button>
                                        )}
                                        <button onClick={() => handleAction(vendor.id, 'suspend')} className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem', border: '1px solid var(--border)', background: 'white' }}>
                                            Suspend
                                        </button>
                                        <button onClick={() => handleAction(vendor.id, 'delete')} className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem', color: '#ef4444', border: '1px solid #fee2e2', background: 'white' }}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredVendors.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)' }}>
                        No vendors found matching your search.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

