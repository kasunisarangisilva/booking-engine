import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../components/AdminLayout';
import { useAuth } from '../../../context/AuthContext';
import {
    Save, ArrowLeft, Calendar, Phone, DollarSign,
    BedDouble, Users, Car, MapPin, Clapperboard, CheckCircle2
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export default function EditBooking() {
    const router = useRouter();
    const { id } = router.query;
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [booking, setBooking] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    const [formData, setFormData] = useState({
        totalPrice: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        date: '',
        pickupDate: '',
        eventDate: '',
        roomNumber: '',
        unitNumber: '',
        guests: ''
    });

    useEffect(() => {
        if (id) fetchBookingDetails();
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            const res = await axios.get(`${API_BASE}/bookings/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const b = res.data;
            setBooking(b);
            setFormData({
                totalPrice: b.totalPrice || '',
                phone: b.phone || '',
                checkIn: b.details?.checkIn || '',
                checkOut: b.details?.checkOut || '',
                date: b.details?.date || '',
                pickupDate: b.details?.pickupDate || '',
                eventDate: b.details?.eventDate || '',
                roomNumber: b.details?.roomNumber || '',
                unitNumber: b.details?.unitNumber || '',
                guests: b.details?.guests || ''
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching booking:', err);
            toast.error('Failed to load booking details');
            router.push('/bookings');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setIsDirty(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const details = { ...booking.details };
        if (formData.checkIn) details.checkIn = formData.checkIn;
        if (formData.checkOut) details.checkOut = formData.checkOut;
        if (formData.date) details.date = formData.date;
        if (formData.pickupDate) details.pickupDate = formData.pickupDate;
        if (formData.eventDate) details.eventDate = formData.eventDate;
        if (formData.roomNumber) details.roomNumber = formData.roomNumber;
        if (formData.unitNumber) details.unitNumber = formData.unitNumber;
        if (formData.guests) details.guests = Number(formData.guests);

        const payload = {
            totalPrice: Number(formData.totalPrice),
            phone: formData.phone,
            details
        };

        try {
            await axios.put(`${API_BASE}/bookings/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Booking updated successfully!');
            setIsDirty(false);
            router.push('/bookings');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error updating booking');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center animate-pulse">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mx-auto mb-3" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mx-auto" />
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!booking) return null;

    const type = booking.listingId?.type;

    const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2';
    const inputClass = 'w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all';

    const getStatusBadge = (status) => {
        const map = {
            confirmed: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
            pending: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
            cancelled: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
        };
        return map[status] || map.pending;
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                Edit Booking
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 ml-11">
                            Reservation <span className="font-bold text-slate-700 dark:text-slate-300">#{booking._id.slice(-6).toUpperCase()}</span>
                            {' · '}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusBadge(booking.status)}`}>
                                {booking.status}
                            </span>
                        </p>
                    </div>

                    {/* Unsaved indicator */}
                    {isDirty && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                            Unsaved changes
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

                        {/* Booking Reference Banner */}
                        <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none">
                                    #{booking._id.slice(-2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                                        {booking.listingId?.title || 'Unknown Listing'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                                        {booking.listingId?.type || 'Booking'} · {booking.userId?.name || booking.details?.customerName || 'Guest'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booked on</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {new Date(booking.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">

                            {/* Financials & Contact */}
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">General Info</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>
                                            <span className="inline-flex items-center gap-1.5">
                                                <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                                                Total Price
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            name="totalPrice"
                                            className={inputClass}
                                            onChange={handleChange}
                                            value={formData.totalPrice}
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                                                Guest Phone
                                            </span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className={inputClass}
                                            onChange={handleChange}
                                            value={formData.phone}
                                            placeholder="+94..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Booking Details — type-specific */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Booking Details</p>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                                        {(type === 'hotel' || type === 'hostel') && (<>
                                            <div>
                                                <label className={labelClass}>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                                        Check-In
                                                    </span>
                                                </label>
                                                <input type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                                        Check-Out
                                                    </span>
                                                </label>
                                                <input type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <BedDouble className="w-3.5 h-3.5 text-indigo-500" />
                                                        Room Number
                                                    </span>
                                                </label>
                                                <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} className={inputClass} placeholder="e.g. 204" />
                                            </div>
                                        </>)}

                                        {type === 'cinema' && (
                                            <div>
                                                <label className={labelClass}>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clapperboard className="w-3.5 h-3.5 text-indigo-500" />
                                                        Show Date
                                                    </span>
                                                </label>
                                                <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} />
                                            </div>
                                        )}

                                        {type === 'vehicle' && (
                                            <div>
                                                <label className={labelClass}>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Car className="w-3.5 h-3.5 text-indigo-500" />
                                                        Pickup Date
                                                    </span>
                                                </label>
                                                <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className={inputClass} />
                                            </div>
                                        )}

                                        {type === 'space' && (
                                            <div>
                                                <label className={labelClass}>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                                        Event Date
                                                    </span>
                                                </label>
                                                <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className={inputClass} />
                                            </div>
                                        )}

                                        {(type === 'space' || type === 'vehicle') && (
                                            <div>
                                                <label className={labelClass}>Unit Number</label>
                                                <input type="text" name="unitNumber" value={formData.unitNumber} onChange={handleChange} className={inputClass} placeholder="e.g. V-01" />
                                            </div>
                                        )}

                                        <div>
                                            <label className={labelClass}>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                                                    Guests
                                                </span>
                                            </label>
                                            <input type="number" name="guests" value={formData.guests} onChange={handleChange} className={inputClass} min="1" placeholder="1" />
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-400 disabled:to-purple-400 text-white font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none cursor-pointer transition-all transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Saving changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    disabled={saving}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Cancel
                                </button>

                                {isDirty && !saving && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium sm:ml-auto">
                                        You have unsaved changes
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
