import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API_BASE = 'http://localhost:5000/api';

export default function CreateListing() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'hotel',
        price: '',
        location: '',
        // Dynamic fields
        roomType: 'single',
        movieTitle: '',
        area: '',
        vehicleType: 'car'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const item = localStorage.getItem('user');
        let user = null;

        try {
            if (item) {
                const trimmedItem = item.trim();
                if (trimmedItem.startsWith('U2FsdGVkX1') || (!trimmedItem.startsWith('{') && !trimmedItem.startsWith('['))) {
                    throw new Error("Invalid format");
                }
                user = JSON.parse(trimmedItem);
            }
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
        }

        if (!user || !user.id) {
            alert('User not logged in or invalid session. Please log in again.');
            return;
        }

        try {
            await axios.post(`${API_BASE}/listings`,
                { ...formData, vendorId: user.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Listing created!');
            router.push('/listings');
        } catch (err) {
            alert('Error creating listing');
        }
    };

    return (
        <AdminLayout>
            <h1>Create New Listing</h1>
            <div className="card" style={{ marginTop: '2rem', maxWidth: '600px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Title</label>
                        <input type="text" name="title" className="btn" style={{ width: '100%', border: '1px solid var(--border)', background: 'white' }} onChange={handleChange} required />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Type</label>
                        <select name="type" className="btn" style={{ width: '100%', border: '1px solid var(--border)', background: 'white' }} onChange={handleChange}>
                            <option value="hotel">Hotel</option>
                            <option value="cinema">Cinema</option>
                            <option value="space">Space</option>
                            <option value="vehicle">Vehicle</option>
                        </select>
                    </div>

                    {/* Conditional Fields based on Type */}
                    {formData.type === 'hotel' && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Room Type</label>
                            <select name="roomType" className="btn" style={{ width: '100%', border: '1px solid var(--border)', background: 'white' }} onChange={handleChange}>
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="king">King</option>
                            </select>
                        </div>
                    )}

                    {/* ... Other types would have similar blocks ... */}

                    <div style={{ marginBottom: '1rem' }}>
                        <label>Price</label>
                        <input type="number" name="price" className="btn" style={{ width: '100%', border: '1px solid var(--border)', background: 'white' }} onChange={handleChange} required />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Location</label>
                        <input type="text" name="location" className="btn" style={{ width: '100%', border: '1px solid var(--border)', background: 'white' }} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn btn-accent">Publish Listing</button>
                </form>
            </div>
        </AdminLayout>
    );
}
