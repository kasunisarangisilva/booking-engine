import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../components/AdminLayout';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export default function ViewBooking() {
    const router = useRouter();
    const { id } = router.query;
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);

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
            setBooking(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching booking:', err);
            toast.error('Failed to load booking details');
            router.push('/bookings');
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

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">View Booking</h1>
                        <p className="text-secondary mt-2 text-lg font-medium">Details for Reservation #{booking._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="flex gap-4">
                        {booking.status !== 'cancelled' && (
                            <Link href={`/bookings/edit/${booking._id}`} className="px-6 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded-xl transition-colors">
                                Edit
                            </Link>
                        )}
                        <button onClick={() => router.back()} className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl transition-colors">
                            Back
                        </button>
                    </div>
                </header>

                <div className="card p-8 shadow-xl border border-border space-y-8">
                    {/* Status Alert */}
                    {booking.status === 'cancelled' && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                            <h4 className="text-red-800 font-bold">Booking Cancelled</h4>
                            <p className="text-red-700 mt-1">Reason: {booking.cancellationReason || 'No reason provided'}</p>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Guest</h3>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{booking.userId?.name || 'Guest User'}</p>
                            <p className="text-secondary">{booking.userId?.email || 'N/A'}</p>
                            <p className="text-secondary">{booking.phone || 'No phone provided'}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Status</h3>
                            <p className={`capitalize px-3 py-1 rounded inline-block font-bold text-sm ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {booking.status}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Listing</h3>
                            <p className="text-lg font-bold text-blue-600">
                                <Link href={`/listings/view/${booking.listingId?._id}`}>
                                    {booking.listingId?.title || 'Unknown Listing'}
                                </Link>
                            </p>
                            <p className="text-secondary capitalize">{booking.listingId?.type}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Created At</h3>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                {new Date(booking.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Booking Specific Details */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6 underline underline-offset-8">Booking Specific Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            {/* Dates */}
                            {booking.details?.checkIn && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Check-In</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{booking.details.checkIn}</p>
                                </div>
                            )}
                            {booking.details?.checkOut && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Check-Out</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{booking.details.checkOut}</p>
                                </div>
                            )}
                            {booking.details?.date && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Date</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{booking.details.date}</p>
                                </div>
                            )}
                            {booking.details?.pickupDate && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Pickup Date</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{booking.details.pickupDate}</p>
                                </div>
                            )}
                            {booking.details?.eventDate && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Event Date</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{booking.details.eventDate}</p>
                                </div>
                            )}

                            {/* Options */}
                            {booking.details?.roomNumber && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Room Number</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{booking.details.roomNumber}</p>
                                </div>
                            )}
                            {booking.details?.unitNumber && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Unit Number</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{booking.details.unitNumber}</p>
                                </div>
                            )}
                            {booking.details?.guests && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Guests</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{booking.details.guests}</p>
                                </div>
                            )}
                            {booking.details?.seats?.length > 0 && (
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Seats</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{booking.details.seats.join(', ')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Total Price</h3>
                            <p className="text-2xl font-black text-green-600">${booking.totalPrice}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Payment Method</h3>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 capitalize">{booking.paymentMethod}</p>
                            {booking.paymentDetails?.transactionId && (
                                <p className="text-sm text-secondary">Txn ID: {booking.paymentDetails.transactionId}</p>
                            )}
                        </div>
                    </div>
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
