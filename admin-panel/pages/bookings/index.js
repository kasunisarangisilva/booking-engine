import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Eye,
    Edit2,
    Trash2,
    XCircle,
    Search,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Building2
} from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export default function ViewBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [cancelModalId, setCancelModalId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deleteModalId, setDeleteModalId] = useState(null);

    const { user, token } = useAuth();

    useEffect(() => {
        if (user?._id) {
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            if (user.role !== 'vendor') {
                setLoading(false);
                return;
            }

            const res = await axios.get(`${API_BASE}/bookings/vendor?page=1&limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data.bookings || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            console.error(err);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelModalId || !cancelReason.trim()) {
            toast.error('Cancellation reason is required');
            return;
        }
        try {
            await axios.put(`${API_BASE}/bookings/${cancelModalId}/cancel`, { reason: cancelReason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Booking cancelled successfully");
            setCancelModalId(null);
            setCancelReason('');
            fetchBookings();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to cancel booking");
        }
    };

    const confirmDelete = async () => {
        if (!deleteModalId) return;
        try {
            await axios.delete(`${API_BASE}/bookings/${deleteModalId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Booking deleted successfully");
            setDeleteModalId(null);
            fetchBookings();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to delete booking");
        }
    };

    const filteredBookings = Array.isArray(bookings)
        ? bookings.filter(b => {
            // Search term check
            const matchesSearch =
                (b.userId?.name && b.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (b.userId?.email && b.userId.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (b.details?.customerEmail && b.details.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (b.listingId?.title && b.listingId.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (b.paymentMethod && b.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (b.status && b.status.toLowerCase().includes(searchTerm.toLowerCase()));

            // Status filter check
            const matchesStatus = statusFilter === 'all' ||
                (b.status && b.status.toLowerCase() === statusFilter.toLowerCase());

            // Type filter check
            const matchesType = typeFilter === 'all' ||
                (b.listingId?.type && b.listingId.type.toLowerCase() === typeFilter.toLowerCase());

            // Payment method filter check
            const matchesPayment = paymentFilter === 'all' ||
                (b.paymentMethod && b.paymentMethod.toLowerCase() === paymentFilter.toLowerCase()) ||
                (paymentFilter === 'bank_transfer' && (b.paymentMethod === 'bank_transfer' || b.paymentMethod === 'cash'));

            // Date range check
            let matchesDate = true;
            if (b.createdAt) {
                const createdDate = new Date(b.createdAt);
                createdDate.setHours(0, 0, 0, 0);
                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (createdDate < start) matchesDate = false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (createdDate > end) matchesDate = false;
                }
            }

            return matchesSearch && matchesStatus && matchesType && matchesPayment && matchesDate;
        })
        : [];

    const ITEMS_PER_PAGE = 8;
    const localTotalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE) || 1;
    
    // Ensure current page doesn't exceed total pages
    const currentPage = page > localTotalPages ? 1 : page;
    const paginatedBookings = filteredBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Detect synthetic/internal guest emails (old and new format)
    const isGuestEmail = (email) => {
        if (!email) return false;
        return email.endsWith('@guest.internal') ||
            /^guest_\d+@example\.com$/.test(email) ||
            email.startsWith('widget_');
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 capitalize">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 capitalize">
                        <XCircle className="w-3.5 h-3.5" /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 capitalize">
                        <Clock className="w-3.5 h-3.5" /> {status || 'Pending'}
                    </span>
                );
        }
    };

    const getPaymentBadge = (method) => {
        switch (method?.toLowerCase()) {
            case 'bank_transfer':
            case 'cash':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700/60 shadow-2xs">
                        🏦 Bank Transfer
                    </span>
                );
            case 'card':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 shadow-2xs">
                        💳 Card
                    </span>
                );
            case 'koko':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800 shadow-2xs">
                        🛍️ Koko Pay
                    </span>
                );
            case 'mintpay':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800 shadow-2xs">
                        🍃 Mint Pay
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 capitalize">
                        💳 {method || 'Card'}
                    </span>
                );
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6 mb-8 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                            Bookings Management
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            View, manage, and track all guest reservations.
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search guest or listing..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60 items-end">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Types</option>
                            <option value="hotel">🏨 Hotel</option>
                            <option value="hostel">🏕️ Hostel</option>
                            <option value="cinema">🎬 Cinema</option>
                            <option value="space">🏢 Space</option>
                            <option value="vehicle">🚗 Vehicle</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Payment Method</label>
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Payments</option>
                            <option value="bank_transfer">🏦 Bank Transfer</option>
                            <option value="card">💳 Card (Stripe)</option>
                            <option value="koko">🛍️ Koko Pay</option>
                            <option value="mintpay">🍃 Mint Pay</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter('all');
                                setTypeFilter('all');
                                setPaymentFilter('all');
                                setStartDate('');
                                setEndDate('');
                                setSearchTerm('');
                            }}
                            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-200">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-left bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-4 pl-6">Guest Details</th>
                                <th className="p-4">Listing</th>
                                <th className="p-4">Payment Method</th>
                                <th className="p-4">Total Price</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date Created</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {loading
                                ? [...Array(6)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4 pl-6">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-36 mb-1"></div>
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                                        </td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></td>
                                        <td className="p-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></td>
                                        <td className="p-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                                        <td className="p-4 pr-6"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-40 ml-auto"></div></td>
                                    </tr>
                                ))
                                : paginatedBookings.map(b => (
                                    <tr key={b._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-xs uppercase">
                                                    {b.userId?.name ? b.userId.name.charAt(0) : "G"}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-slate-900 dark:text-white">
                                                        {b.userId?.name || b.details?.customerName || 'Guest User'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {isGuestEmail(b.userId?.email)
                                                            ? (b.details?.customerEmail
                                                                ? <span title="Widget booking contact email">{b.details.customerEmail}</span>
                                                                : <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300">Widget Guest</span>
                                                            )
                                                            : (b.userId?.email || 'N/A')
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                                                {b.listingId?.title || 'Unknown Listing'}
                                            </div>
                                            <div className="text-xs text-slate-400 capitalize">
                                                {b.listingId?.type || 'Service'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getPaymentBadge(b.paymentMethod)}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                                            ${b.totalPrice}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(b.status)}
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-4 pr-6 text-right whitespace-nowrap">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Link
                                                    href={`/bookings/view/${b._id}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-all no-underline shadow-2xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View
                                                </Link>
                                                {b.status !== 'cancelled' && (
                                                    <>
                                                        <Link
                                                            href={`/bookings/edit/${b._id}`}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-all no-underline shadow-2xs"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => setCancelModalId(b._id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer shadow-2xs"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> Cancel
                                                        </button>
                                                    </>
                                                )}
                                                {b.status === 'cancelled' && (
                                                    <button
                                                        onClick={() => setDeleteModalId(b._id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shadow-2xs"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredBookings.length === 0 && (
                    <div className="text-center py-16 px-4 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-semibold">No bookings found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {localTotalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-8">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
                    >
                        Previous
                    </button>

                    <div className="flex gap-1.5">
                        {[...Array(localTotalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer ${page === i + 1
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setPage((p) => Math.min(localTotalPages, p + 1))}
                        disabled={page === localTotalPages || loading}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
                    >
                        Next
                    </button>
                </div>
            )}


            {/* CANCEL BOOKING MODAL */}
            {cancelModalId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 transform transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                            Cancel Booking
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-center leading-relaxed">
                            Please state a reason for cancelling this reservation.
                        </p>

                        <textarea
                            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium transition-all mb-6"
                            rows="3"
                            placeholder="Reason for cancellation..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        ></textarea>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setCancelModalId(null);
                                    setCancelReason('');
                                }}
                                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCancel}
                                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 cursor-pointer transition-colors shadow-xs"
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE BOOKING MODAL */}
            {deleteModalId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-center transform transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Delete Cancelled Booking
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            Are you sure you want to permanently delete this cancelled booking record?
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteModalId(null)}
                                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer transition-colors shadow-xs"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
