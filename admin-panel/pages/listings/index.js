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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold">My Listings</h1>
                <Link href="/listings/create" className="btn btn-accent no-underline w-full sm:w-auto text-center">
                    + Add New Listing
                </Link>
            </div>

            <div className="card !p-0 overflow-hidden mt-8">
                {listings.length === 0 ? (
                    <p className="text-center py-12 text-secondary">No listings found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b-2 border-border text-left bg-slate-50 text-xs uppercase text-secondary">
                                    <th className="p-4 font-semibold">Title</th>
                                    <th className="p-4 font-semibold">Type</th>
                                    <th className="p-4 font-semibold">Price</th>
                                    <th className="p-4 font-semibold">Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map(l => (
                                    <tr key={l.id} className="border-b border-border hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-sm">{l.title}</td>
                                        <td className="p-4 text-sm capitalize">{l.type}</td>
                                        <td className="p-4 text-sm font-semibold">${l.price}</td>
                                        <td className="p-4 text-sm text-secondary">{l.location}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
