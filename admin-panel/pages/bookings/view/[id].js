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
    const [emailModal, setEmailModal] = useState(false);
    const [emailTo, setEmailTo] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);

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
            // Pre-fill email with customer email
            const b = res.data;
            setEmailTo(b.details?.customerEmail || b.userId?.email || '');
            setLoading(false);

            // Automatically mark as read/seen if unread
            if (!b.isRead) {
                axios.put(`${API_BASE}/bookings/${id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(e => console.warn('Failed to mark booking as read', e));
            }
        } catch (err) {
            console.error('Error fetching booking:', err);
            toast.error('Failed to load booking details');
            router.push('/bookings');
        }
    };

    const handleDownloadInvoice = async () => {
        setDownloadingPDF(true);
        try {
            const res = await axios.get(`${API_BASE}/bookings/${id}/invoice`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id.slice(-8).toUpperCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Invoice downloaded!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate invoice');
        } finally {
            setDownloadingPDF(false);
        }
    };

    const handleEmailInvoice = async () => {
        if (!emailTo.trim()) { toast.error('Please enter an email address'); return; }
        setSendingEmail(true);
        try {
            const res = await axios.post(`${API_BASE}/bookings/${id}/email-invoice`,
                { toEmail: emailTo.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message || 'Invoice sent!');
            if (res.data.previewUrl) {
                toast((t) => (
                    <span>
                        Preview (Ethereal):&nbsp;
                        <a href={res.data.previewUrl} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 700 }}>
                            Open Email
                        </a>
                    </span>
                ), { duration: 10000, icon: '📧' });
            }
            setEmailModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send invoice');
        } finally {
            setSendingEmail(false);
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
                    <div className="flex gap-3 flex-wrap">
                        {/* Download Invoice */}
                        <button
                            onClick={handleDownloadInvoice}
                            disabled={downloadingPDF}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60 shadow-sm"
                        >
                            {downloadingPDF ? '⏳ Generating…' : '📄 Download Invoice'}
                        </button>

                        {/* Email Invoice */}
                        <button
                            onClick={() => setEmailModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                        >
                            📧 Email Invoice
                        </button>

                        {booking.status !== 'cancelled' && (
                            <Link href={`/bookings/edit/${booking._id}`} className="px-5 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded-xl transition-colors">
                                Edit
                            </Link>
                        )}
                        <button onClick={() => router.back()} className="px-5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl transition-colors">
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

                    {/* Bank Transfer / Pay on Arrival Alert */}
                    {(booking.paymentMethod === 'bank_transfer' || booking.paymentMethod === 'cash') && (
                        <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-4 rounded-r-2xl shadow-xs">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">🏦</span>
                                <div>
                                    <h4 className="text-amber-900 dark:text-amber-200 font-bold text-sm">
                                        Bank Transfer / Pay on Arrival Notice
                                    </h4>
                                    <p className="text-amber-800 dark:text-amber-300 text-xs mt-1 leading-relaxed">
                                        This booking was placed via <strong>Bank Transfer / Pay on Arrival</strong> without automatic online payment proof. Please contact the customer to verify payment receipt or collect funds.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold text-amber-950 dark:text-amber-100">
                                        <span className="bg-amber-100 dark:bg-amber-900/60 px-3 py-1 rounded-lg">
                                            📞 Phone: {booking.details?.customerPhone || booking.phone || booking.userId?.phone || 'N/A'}
                                        </span>
                                        <span className="bg-amber-100 dark:bg-amber-900/60 px-3 py-1 rounded-lg">
                                            ✉️ Email: {booking.details?.customerEmail || booking.userId?.email || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Guest</h3>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {booking.userId?.name || booking.details?.customerName || 'Guest User'}
                            </p>
                            <p className="text-secondary">
                                {/* Show real contact email for widget guests */}
                                {booking.details?.customerEmail || booking.userId?.email || 'N/A'}
                            </p>
                            <p className="text-secondary">
                                {booking.details?.customerPhone || booking.phone || 'No phone provided'}
                            </p>
                            {booking.details?.customerLocation && (
                                <p className="text-secondary flex items-center gap-1 mt-1">
                                    📍 {booking.details.customerLocation}
                                </p>
                            )}
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

                        {/* Special Requirements */}
                        {booking.details?.specialRequirements && (
                            <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                                <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">✨ Special Requirements</h4>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {booking.details.specialRequirements}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Total Price</h3>
                            <p className="text-2xl font-black text-green-600">
                                ${booking.totalPrice}
                                <br />
                                <span className="text-sm font-bold text-slate-500">(LKR {(booking.totalPrice * 300).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                            </p>
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

            {/* Email Invoice Modal */}
            {emailModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEmailModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xl">📧</div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white">Send Invoice by Email</h2>
                                <p className="text-xs text-slate-500">Invoice PDF will be attached to the email</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Recipient Email</label>
                            <input
                                type="email"
                                value={emailTo}
                                onChange={e => setEmailTo(e.target.value)}
                                placeholder="customer@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                            />
                            <p className="mt-2 text-xs text-slate-400">Pre-filled from booking customer email. Edit if needed.</p>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 mb-6">
                            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                                💡 <strong>Local Demo Mode:</strong> Email will be sent via Ethereal test server. A preview link will appear in the notification so you can view the email in browser.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleEmailInvoice}
                                disabled={sendingEmail}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60"
                            >
                                {sendingEmail ? '⏳ Sending…' : '📧 Send Invoice'}
                            </button>
                            <button
                                onClick={() => setEmailModal(false)}
                                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
