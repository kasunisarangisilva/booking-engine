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
                user = JSON.parse(trimmedItem);
            }
        } catch (e) {
            console.error("Error parsing user:", e);
        }

        if (!user || !user.id) {
            alert('Please log in again.');
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
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold">Create New Listing</h1>
                    <p className="text-secondary mt-2">Fill in the details to publish a new service.</p>
                </header>

                <div className="card p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="w-full p-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Grand Plaza Hotel"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold">Service Type</label>
                                <select
                                    name="type"
                                    className="w-full p-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-accent bg-white"
                                    onChange={handleChange}
                                >
                                    <option value="hotel">Hotel</option>
                                    <option value="cinema">Cinema</option>
                                    <option value="space">Space</option>
                                    <option value="vehicle">Vehicle</option>
                                </select>
                            </div>
                        </div>

                        {/* Conditional Fields based on Type */}
                        {formData.type === 'hotel' && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold">Room Type</label>
                                <select
                                    name="roomType"
                                    className="w-full p-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-accent bg-white"
                                    onChange={handleChange}
                                >
                                    <option value="single">Single</option>
                                    <option value="double">Double</option>
                                    <option value="king">King</option>
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold">Price per Night/Booking ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="w-full p-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                                    onChange={handleChange}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="w-full p-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                                    onChange={handleChange}
                                    required
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <button type="submit" className="btn btn-accent px-8 py-3 w-full sm:w-auto">Publish Listing</button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn bg-white border border-border px-8 py-3 w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
