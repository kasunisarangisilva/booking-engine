import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import {
    Rocket,
    ArrowLeft,
    Building2,
    DollarSign,
    MapPin,
    Tag,
    UserCheck,
    FileText,
    Sparkles
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export default function CreateListing() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'hotel',
        price: '',
        location: '',
        vendorId: '',
        roomType: 'single',
        totalRooms: '5',
        movieTitle: '',
        showTime: '',
        seatRows: '10',
        seatCols: '10',
        area: '',
        usageType: 'event',
        totalUnits: '1',
        vehicleType: 'car',
        capacity: '',
        features: '',
        amenities: ''
    });

    const [vendors, setVendors] = useState([]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchVendors();
        }
    }, [user]);

    const fetchVendors = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/vendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const vendorsData = Array.isArray(res.data) ? res.data : (res.data.vendors || []);
            const approvedVendors = vendorsData.filter(v => v.role === 'vendor');
            setVendors(approvedVendors);
        } catch (err) {
            console.error('Error fetching vendors:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const currentUserId = user?._id || user?.id;

        if (!currentUserId) {
            toast.error('Your session has expired. Please log in again.');
            return;
        }

        let selectedVendorId;
        if (user.role === 'admin') {
            selectedVendorId = formData.vendorId;
            if (!selectedVendorId) {
                toast.error('Please select a vendor for this listing');
                return;
            }
        } else {
            selectedVendorId = currentUserId;
        }

        setSubmitting(true);

        const payload = {
            ...formData,
            vendorId: selectedVendorId,
            price: Number(formData.price),
            amenities: formData.amenities ? formData.amenities.split(',').map(s => s.trim()) : [],
            features: formData.features ? formData.features.split(',').map(s => s.trim()) : [],
            capacity: Number(formData.capacity),
            area: Number(formData.area),
            seatLayout: {
                rows: Number(formData.seatRows) || 10,
                cols: Number(formData.seatCols) || 10,
                aisles: []
            },
            totalRooms: Number(formData.totalRooms) || 5,
            totalUnits: Number(formData.totalUnits) || 1,
        };

        try {
            await axios.post(`${API_BASE}/listings`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Listing published successfully!');
            router.push('/listings');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error creating listing');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                            Create New Listing
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                            Add a new property or service listing to the booking platform.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Admin Vendor Selection */}
                        {user?.role === 'admin' && (
                            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">
                                    Assign to Vendor *
                                </label>
                                <select
                                    name="vendorId"
                                    className="w-full p-3 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                    onChange={handleChange}
                                    value={formData.vendorId}
                                    required
                                >
                                    <option value="">Select a vendor...</option>
                                    {vendors.map(vendor => (
                                        <option key={vendor._id} value={vendor._id}>
                                            {vendor.name} ({vendor.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                    Service Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Grand Luxury Suite"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="type"
                                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                                    onChange={handleChange}
                                    value={formData.type}
                                >
                                    <option value="hotel">🏨 Hotel / Stay</option>
                                    <option value="hostel">🏕️ Hostel</option>
                                    <option value="cinema">🎬 Cinema / Movie</option>
                                    <option value="space">🏢 Event Space</option>
                                    <option value="vehicle">🚗 Vehicle Rental</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                rows="4"
                                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                onChange={handleChange}
                                required
                                placeholder="Describe your service, features, rules, and amenities in detail..."
                            ></textarea>
                        </div>

                        {/* Category Specific Details */}
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4" /> Category Details
                            </h3>

                            {(formData.type === 'hotel' || formData.type === 'hostel') && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Room Type</label>
                                        <select name="roomType" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold">
                                            {formData.type === 'hotel' ? (
                                                <>
                                                    <option value="single">Single Room</option>
                                                    <option value="double">Double Room</option>
                                                    <option value="king">King Suite</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="dormitory">Dormitory</option>
                                                    <option value="private">Private Room</option>
                                                    <option value="mixed">Mixed Dorm</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Total Rooms</label>
                                        <input type="number" name="totalRooms" min="1" value={formData.totalRooms} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Amenities</label>
                                        <input type="text" name="amenities" onChange={handleChange} placeholder="WiFi, Pool, Spa" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                </div>
                            )}

                            {formData.type === 'cinema' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Movie Title</label>
                                        <input type="text" name="movieTitle" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Show Time</label>
                                        <input type="datetime-local" name="showTime" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                </div>
                            )}

                            {formData.type === 'space' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Area (sq ft)</label>
                                        <input type="number" name="area" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Usage Type</label>
                                        <select name="usageType" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold">
                                            <option value="event">Event</option>
                                            <option value="storage">Storage</option>
                                            <option value="office">Office</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Total Sections</label>
                                        <input type="number" name="totalUnits" min="1" value={formData.totalUnits} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                </div>
                            )}

                            {formData.type === 'vehicle' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Vehicle Type</label>
                                        <select name="vehicleType" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold">
                                            <option value="car">Car</option>
                                            <option value="van">Van</option>
                                            <option value="bus">Bus</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Capacity</label>
                                        <input type="number" name="capacity" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Features</label>
                                        <input type="text" name="features" onChange={handleChange} placeholder="AC, GPS, Driver" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                    Price ($) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    onChange={handleChange}
                                    required
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    onChange={handleChange}
                                    required
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                <Rocket className="w-4 h-4" />
                                {submitting ? 'Publishing...' : 'Publish Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
