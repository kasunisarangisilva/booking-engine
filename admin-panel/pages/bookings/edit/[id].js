import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../components/AdminLayout';
import { useAuth } from '../../../context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export default function EditBooking() {
    const router = useRouter();
    const { id } = router.query;
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);

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
        if (id) {
            fetchBookingDetails();
        }
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reconstruct the details object based on what was provided
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
            await axios.put(`${API_BASE}/bookings/${id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Booking updated successfully!');
            router.push('/bookings');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error updating booking');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="card p-8 shadow-xl border border-border text-center">Loading...</div>
            </AdminLayout>
        );
    }

    if (!booking) return null;

    const type = booking.listingId?.type;

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Edit Booking</h1>
                    <p className="text-secondary mt-2 text-lg font-medium">Update reservation details for #{booking._id.slice(-6).toUpperCase()}</p>
                </header>

                <div className="card p-8 shadow-xl border border-border">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Total Price ($)</label>
                                <input
                                    type="number"
                                    name="totalPrice"
                                    className="w-full p-4 rounded-xl border border-border focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold transition-all"
                                    onChange={handleChange}
                                    value={formData.totalPrice}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Guest Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="w-full p-4 rounded-xl border border-border focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold transition-all"
                                    onChange={handleChange}
                                    value={formData.phone}
                                />
                            </div>
                        </div>

                        {/* Category Specific Booking Details */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6 underline underline-offset-8">Booking Details</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(type === 'hotel' || type === 'hostel') && (
                                    <>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Check-In</label>
                                            <input type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} className="p-3 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Check-Out</label>
                                            <input type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} className="p-3 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Room Number</label>
                                            <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} className="p-3 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold" />
                                        </div>
                                    </>
                                )}

                                {type === 'cinema' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Date</label>
                                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-3 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold" />
                                    </div>
                                )}

                                {type === 'vehicle' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Pickup Date</label>
                                        <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="p-3 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold" />
                                    </div>
                                )}

                                {type === 'space' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Event Date</label>
                                        <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className="p-3 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold" />
                                    </div>
                                )}

                                {(type === 'space' || type === 'vehicle') && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Unit Number</label>
                                        <input type="text" name="unitNumber" value={formData.unitNumber} onChange={handleChange} className="p-3 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold" />
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Guests</label>
                                    <input type="number" name="guests" value={formData.guests} onChange={handleChange} className="p-3 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row gap-6">
                            <button type="submit" className="btn-primary bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex-1 sm:flex-none">
                                🚀 Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="bg-slate-100 text-slate-700 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all flex-1 sm:flex-none"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .card {
                    border-radius: 2rem;
                }
                .text-secondary {
                    color: #64748b;
                }
                :global(.dark) .text-secondary {
                    color: #94a3b8;
                }
            `}</style>
        </AdminLayout>
    );
}
