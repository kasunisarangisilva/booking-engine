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

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear field error on change
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        } else if (formData.title.length > 100) {
            newErrors.title = 'Title cannot exceed 100 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        } else if (formData.description.length > 1000) {
            newErrors.description = 'Description cannot exceed 1000 characters';
        }

        const priceNum = Number(formData.price);
        if (formData.price === '' || isNaN(priceNum) || priceNum <= 0) {
            newErrors.price = 'Price must be greater than $0';
        } else if (priceNum > 1000000) {
            newErrors.price = 'Price cannot exceed $1,000,000';
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        } else if (formData.location.trim().length < 2) {
            newErrors.location = 'Location must be at least 2 characters';
        } else if (formData.location.length > 150) {
            newErrors.location = 'Location cannot exceed 150 characters';
        }

        if (formData.type === 'cinema') {
            if (!formData.movieTitle.trim()) {
                newErrors.movieTitle = 'Movie title is required';
            } else if (formData.movieTitle.length > 100) {
                newErrors.movieTitle = 'Movie title cannot exceed 100 characters';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix validation errors before submitting.');
            return;
        }

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
            title: formData.title.trim(),
            description: formData.description.trim(),
            location: formData.location.trim(),
            vendorId: selectedVendorId,
            price: Number(formData.price),
            amenities: formData.amenities ? formData.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
            features: formData.features ? formData.features.split(',').map(s => s.trim()).filter(Boolean) : [],
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
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Service Title *
                                    </label>
                                    <span className={`text-xs font-mono font-medium ${formData.title.length >= 90 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                                        {formData.title.length}/100
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    name="title"
                                    maxLength={100}
                                    className={`w-full p-3.5 rounded-xl border ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 transition-all`}
                                    onChange={handleChange}
                                    value={formData.title}
                                    required
                                    placeholder="e.g. Grand Luxury Suite"
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500 font-medium">{errors.title}</p>}
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
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    Description *
                                </label>
                                <span className={`text-xs font-mono font-medium ${formData.description.length >= 900 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                                    {formData.description.length}/1000
                                </span>
                            </div>
                            <textarea
                                name="description"
                                rows="4"
                                maxLength={1000}
                                className={`w-full p-3.5 rounded-xl border ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 transition-all`}
                                onChange={handleChange}
                                value={formData.description}
                                required
                                placeholder="Describe your service, features, rules, and amenities in detail..."
                            ></textarea>
                            {errors.description && <p className="mt-1 text-xs text-red-500 font-medium">{errors.description}</p>}
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
                                        <select name="roomType" value={formData.roomType} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold">
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
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Total Rooms (Max 1000)</label>
                                        <input type="number" name="totalRooms" min="1" max="1000" value={formData.totalRooms} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-semibold text-slate-500">Amenities</label>
                                            <span className="text-[10px] font-mono text-slate-400">{formData.amenities.length}/250</span>
                                        </div>
                                        <input type="text" name="amenities" maxLength={250} value={formData.amenities} onChange={handleChange} placeholder="WiFi, Pool, Spa" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                </div>
                            )}

                            {formData.type === 'cinema' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-semibold text-slate-500">Movie Title *</label>
                                            <span className="text-[10px] font-mono text-slate-400">{formData.movieTitle.length}/100</span>
                                        </div>
                                        <input type="text" name="movieTitle" maxLength={100} value={formData.movieTitle} onChange={handleChange} className={`w-full p-2.5 rounded-xl border ${errors.movieTitle ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-sm font-semibold`} />
                                        {errors.movieTitle && <p className="mt-1 text-xs text-red-500">{errors.movieTitle}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Show Time</label>
                                        <input type="datetime-local" name="showTime" value={formData.showTime} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                </div>
                            )}

                            {formData.type === 'space' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Area (sq ft, Max 1,000,000)</label>
                                        <input type="number" name="area" min="1" max="1000000" value={formData.area} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Usage Type</label>
                                        <select name="usageType" value={formData.usageType} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold">
                                            <option value="event">Event</option>
                                            <option value="storage">Storage</option>
                                            <option value="office">Office</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Total Sections (Max 1000)</label>
                                        <input type="number" name="totalUnits" min="1" max="1000" value={formData.totalUnits} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                </div>
                            )}

                            {formData.type === 'vehicle' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Vehicle Type</label>
                                        <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold">
                                            <option value="car">Car</option>
                                            <option value="van">Van</option>
                                            <option value="bus">Bus</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Capacity (Max 500)</label>
                                        <input type="number" name="capacity" min="1" max="500" value={formData.capacity} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-semibold text-slate-500">Features</label>
                                            <span className="text-[10px] font-mono text-slate-400">{formData.features.length}/250</span>
                                        </div>
                                        <input type="text" name="features" maxLength={250} value={formData.features} onChange={handleChange} placeholder="AC, GPS, Driver" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
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
                                    min="0.01"
                                    max="1000000"
                                    step="0.01"
                                    value={formData.price}
                                    className={`w-full p-3.5 rounded-xl border ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 transition-all`}
                                    onChange={handleChange}
                                    required
                                    placeholder="0.00"
                                />
                                {errors.price && <p className="mt-1 text-xs text-red-500 font-medium">{errors.price}</p>}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Location *
                                    </label>
                                    <span className={`text-xs font-mono font-medium ${formData.location.length >= 135 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                                        {formData.location.length}/150
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    name="location"
                                    maxLength={150}
                                    value={formData.location}
                                    className={`w-full p-3.5 rounded-xl border ${errors.location ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 transition-all`}
                                    onChange={handleChange}
                                    required
                                    placeholder="City, Country"
                                />
                                {errors.location && <p className="mt-1 text-xs text-red-500 font-medium">{errors.location}</p>}
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
