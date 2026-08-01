import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Search,
    Eye,
    Edit2,
    Trash2,
    MapPin,
    Building2,
    AlertTriangle,
    Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export default function ManageListings() {
    const [listings, setListings] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deleteModalId, setDeleteModalId] = useState(null);

    const { user, token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchListings();
    }, [user]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            let endpoint = `${API_BASE}/listings`;
            if (user?.role === 'vendor') {
                endpoint = `${API_BASE}/listings/my`;
            }

            const res = await axios.get(`${endpoint}?page=1&limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setListings(res.data.listings || []);
            setPagination(res.data.pagination || null);
        } catch (err) {
            console.error(err);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteModalId) return;
        try {
            await axios.delete(`${API_BASE}/listings/${deleteModalId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Listing deleted successfully");
            setDeleteModalId(null);
            fetchListings();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to delete listing");
        }
    };

    const filteredListings = Array.isArray(listings)
        ? listings.filter(l => {
            // Search term check
            const matchesSearch = 
                (l.title && l.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (l.location && l.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (l.type && l.type.toLowerCase().includes(searchTerm.toLowerCase()));

            // Category/Type filter check
            const matchesType = typeFilter === 'all' || 
                (l.type && l.type.toLowerCase() === typeFilter.toLowerCase());

            // Price range check
            let matchesPrice = true;
            if (minPrice && l.price < Number(minPrice)) matchesPrice = false;
            if (maxPrice && l.price > Number(maxPrice)) matchesPrice = false;

            // Date created check
            let matchesDate = true;
            if (l.createdAt) {
                const createdDate = new Date(l.createdAt);
                createdDate.setHours(0,0,0,0);
                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0,0,0,0);
                    if (createdDate < start) matchesDate = false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23,59,59,999);
                    if (createdDate > end) matchesDate = false;
                }
            }

            return matchesSearch && matchesType && matchesPrice && matchesDate;
        })
        : [];

    const ITEMS_PER_PAGE = 8;
    const localTotalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE) || 1;
    const currentPage = page > localTotalPages ? 1 : page;
    const paginatedListings = filteredListings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'hotel': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
            case 'cinema': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800';
            case 'vehicle': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
            case 'space': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
            default: return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800';
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6 mb-8 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                            {user?.role === 'vendor' ? 'My Listings' : 'All Listings'}
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            View, edit, and manage all property & service listings.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="Search listings..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>

                        <Link
                            href="/listings/create"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 no-underline cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Add Listing
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 items-end">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            <option value="hotel">🏨 Hotel</option>
                            <option value="hostel">🏕️ Hostel</option>
                            <option value="cinema">🎬 Cinema</option>
                            <option value="space">🏢 Space</option>
                            <option value="vehicle">🚗 Vehicle</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Min Price ($)</label>
                        <input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Max Price ($)</label>
                        <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
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
                                setTypeFilter('all');
                                setMinPrice('');
                                setMaxPrice('');
                                setStartDate('');
                                setEndDate('');
                                setSearchTerm('');
                            }}
                            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-955/40 cursor-pointer transition-colors"
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
                                <th className="p-4 pl-6">Listing Details</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Location</th>
                                {user?.role === 'admin' && <th className="p-4">Vendor</th>}
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {loading
                                ? [...Array(6)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4 pl-6">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-1"></div>
                                        </td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28"></div></td>
                                        {user?.role === 'admin' && <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>}
                                        <td className="p-4 pr-6"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-36 ml-auto"></div></td>
                                    </tr>
                                ))
                                : paginatedListings.map(l => (
                                    <tr key={l._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-slate-900 dark:text-white">
                                                        {l.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${getTypeColor(l.type)}`}>
                                                <Tag className="w-3 h-3" />
                                                {l.type || 'General'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                            ${l.price}
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                {l.location || 'N/A'}
                                            </span>
                                        </td>
                                        {user?.role === 'admin' && (
                                            <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {l.vendorId?.name || 'N/A'}
                                            </td>
                                        )}
                                        <td className="p-4 pr-6 text-right whitespace-nowrap">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Link
                                                    href={`/listings/view/${l._id}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-all no-underline shadow-2xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View
                                                </Link>
                                                <Link
                                                    href={`/listings/edit/${l._id}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-all no-underline shadow-2xs"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModalId(l._id)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shadow-2xs"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredListings.length === 0 && (
                    <div className="text-center py-16 px-4 text-slate-500 dark:text-slate-400">
                        <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-semibold">No listings found matching your criteria.</p>
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
                        onClick={() =>
                            setPage((p) => Math.min(localTotalPages, p + 1))
                        }
                        disabled={page === localTotalPages || loading}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
                    >
                        Next
                    </button>
                </div>
            )}


            {/* DELETE LISTING MODAL */}
            {deleteModalId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-center transform transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Confirm Listing Deletion
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            Are you sure you want to delete this listing? This action cannot be undone.
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
