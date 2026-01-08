import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';

const API_BASE = 'http://localhost:5000/api';

export default function ManageListings() {
    const [listings, setListings] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const item = localStorage.getItem('user');
        if (!item) return;

        try {
            // Check if it's potentially an encrypted string (starts with U2FsdGVkX1)
            // or if it doesn't look like JSON (doesn't start with { or [)
            const trimmedItem = item.trim();
            if (trimmedItem.startsWith('U2FsdGVkX1') || (!trimmedItem.startsWith('{') && !trimmedItem.startsWith('['))) {
                throw new Error("Invalid JSON format detected (possibly encrypted or raw string)");
            }

            const storedUser = JSON.parse(trimmedItem);
            setUser(storedUser);
            if (storedUser?.id) {
                fetchListings(storedUser.id);
            }
        } catch (e) {
            console.error("Critical error parsing user from localStorage:", e.message);
            // Optional: Clear invalid data to stop the error from recurring
            // localStorage.removeItem('user');
        }
    }, []);

    const fetchListings = async (vendorId) => {
        try {
            const res = await axios.get(`${API_BASE}/listings`);
            // Filter for this vendor
            setListings(res.data.filter(l => l.vendorId === vendorId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>My Listings</h1>
                <Link href="/listings/create" className="btn btn-accent">
                    + Add New Listing
                </Link>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                {listings.length === 0 ? <p>No listings found.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Title</th>
                                <th style={{ padding: '1rem' }}>Type</th>
                                <th style={{ padding: '1rem' }}>Price</th>
                                <th style={{ padding: '1rem' }}>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.map(l => (
                                <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>{l.title}</td>
                                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{l.type}</td>
                                    <td style={{ padding: '1rem' }}>${l.price}</td>
                                    <td style={{ padding: '1rem' }}>{l.location}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
}
