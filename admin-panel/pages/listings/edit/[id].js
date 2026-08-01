import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../components/AdminLayout';
import { useAuth } from '../../../context/AuthContext';
import {
    Save,
    ArrowLeft,
    Building2,
    Sparkles
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export default function EditListing() {
    const router = useRouter();
    const { id } = router.query;
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        if (id) {
            fetchListingDetails();
        }
    }, [id]);

    const fetchListingDetails = async () => {
        try {
            const res = await axios.get(`${API_BASE}/listings/${id}`);
            const data = res.data;
            setFormData({
                title: data.title || '',
                description: data.description || '',
                type: data.type || 'hotel',
                price: data.price || '',
                location: data.location || '',
                vendorId: data.vendorId?._id || data.vendorId || '',
                roomType: data.details?.roomType || 'single',
                totalRooms: data.details?.totalRooms || '5',
                movieTitle: data.details?.movieTitle || '',
                showTime: data.details?.showTime || '',
                seatRows: data.details?.seatLayout?.rows || '10',
                seatCols: data.details?.seatLayout?.cols || '10',
                area: data.details?.area || '',
                usageType: data.details?.usageType || 'event',
                totalUnits: data.details?.totalUnits || '1',
                vehicleType: data.details?.vehicleType || 'car',
                capacity: data.details?.capacity || '',
                features: data.details?.features?.join(', ') || '',
                amenities: data.details?.amenities?.join(', ') || ''
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching listing:', err);
            toast.error('Failed to load listing details');
            router.push('/listings');
        }
    };

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
            await axios.put(`${API_BASE}/listings/${id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Listing updated successfully!');
            router.push('/listings');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error updating listing');
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
                            Edit Listing
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                            Modify and save changes to your service listing.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 font-semibold">
                        Loading listing details...
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        value={formData.title}
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
                                    value={formData.description}
                                    required
                                    placeholder="Describe your service..."
                                ></textarea>
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
                                        value={formData.price}
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
                                        value={formData.location}
                                        required
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>

                            {/* Save Changes Button Footer */}
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
                                    <Save className="w-4 h-4" />
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
