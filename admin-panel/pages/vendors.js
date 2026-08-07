import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import { useNotification } from "../context/NotificationContext";
import {
    Eye,
    CheckCircle2,
    Ban,
    PlayCircle,
    XCircle,
    Search,
    X,
    UserCheck,
    UserX,
    Building2,
    Mail,
    Calendar,
    Hash,
    AlertTriangle,
    ShieldCheck
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export default function Vendors() {
    const [vendors, setVendors] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal States
    const [viewVendor, setViewVendor] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null); // { vendor, action }
    const [actionLoading, setActionLoading] = useState(false);

    const { notifications } = useNotification();

    useEffect(() => {
        fetchVendors();
    }, []);

    useEffect(() => {
        if (notifications && notifications.length > 0) {
            fetchVendors();
        }
    }, [notifications]);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `${API_BASE}/admin/vendors?page=1&limit=100`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            if (res.data && Array.isArray(res.data.vendors)) {
                setVendors(res.data.vendors);
            } else {
                console.error("Unexpected response structure:", res.data);
                setVendors([]);
            }

            setPagination(res.data.pagination || null);
        } catch (err) {
            console.error("Error fetching vendors", err);
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    const triggerActionPrompt = (vendor, action) => {
        setConfirmModal({ vendor, action });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal) return;
        const { vendor, action } = confirmModal;
        setActionLoading(true);

        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (action === "approve") {
                await axios.post(
                    `${API_BASE}/admin/vendors/approve`,
                    { vendorId: vendor._id },
                    config,
                );
                toast.success(`Vendor "${vendor.name}" approved successfully!`);
            } else if (action === "suspend") {
                await axios.post(
                    `${API_BASE}/admin/vendors/suspend`,
                    { vendorId: vendor._id },
                    config,
                );
                toast.success(`Vendor "${vendor.name}" suspended!`);
            } else if (action === "activate") {
                await axios.post(
                    `${API_BASE}/admin/vendors/activate`,
                    { vendorId: vendor._id },
                    config,
                );
                toast.success(`Vendor "${vendor.name}" activated!`);
            } else if (action === "inactivate") {
                await axios.post(
                    `${API_BASE}/admin/vendors/inactivate`,
                    { vendorId: vendor._id },
                    config,
                );
                toast.success(`Vendor "${vendor.name}" marked as inactive!`);
            }
            fetchVendors();
            setConfirmModal(null);
            if (viewVendor && viewVendor._id === vendor._id) {
                setViewVendor(null);
            }
        } catch (err) {
            toast.error(
                "Action failed: " + (err.response?.data?.message || err.message)
            );
        } finally {
            setActionLoading(false);
        }
    };

    const filteredVendors = Array.isArray(vendors)
        ? vendors.filter((v) => {
            // Search term check
            const matchesSearch = 
                v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.email.toLowerCase().includes(searchTerm.toLowerCase());

            // Status filter check
            const matchesStatus = statusFilter === 'all' || 
                (v.status && v.status.toLowerCase() === statusFilter.toLowerCase());

            // Date joined check
            let matchesDate = true;
            if (v.createdAt) {
                const createdDate = new Date(v.createdAt);
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

            return matchesSearch && matchesStatus && matchesDate;
        })
        : [];

    const ITEMS_PER_PAGE = 8;
    const localTotalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE) || 1;
    const currentPage = page > localTotalPages ? 1 : page;
    const paginatedVendors = filteredVendors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getActionDetails = (action) => {
        switch (action) {
            case "approve":
                return {
                    title: "Approve Vendor",
                    description: "Are you sure you want to approve this vendor? Their account will be activated and given access to listing tools.",
                    confirmBtnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
                    icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                };
            case "activate":
                return {
                    title: "Activate Vendor",
                    description: "Are you sure you want to reactivate this vendor account?",
                    confirmBtnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
                    icon: <UserCheck className="w-8 h-8 text-emerald-500" />
                };
            case "suspend":
                return {
                    title: "Suspend Vendor",
                    description: "Are you sure you want to suspend this vendor? They will not be able to log in or process bookings until reactivated.",
                    confirmBtnClass: "bg-amber-600 hover:bg-amber-700 text-white",
                    icon: <Ban className="w-8 h-8 text-amber-500" />
                };
            case "inactivate":
                return {
                    title: "Mark Vendor Inactive",
                    description: "Are you sure you want to mark this vendor as inactive?",
                    confirmBtnClass: "bg-rose-600 hover:bg-rose-700 text-white",
                    icon: <UserX className="w-8 h-8 text-rose-500" />
                };
            default:
                return {
                    title: "Confirm Action",
                    description: "Are you sure you want to proceed with this action?",
                    confirmBtnClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
                    icon: <AlertTriangle className="w-8 h-8 text-indigo-500" />
                };
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6 mb-8 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                            Vendor Management
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            View, approve, suspend, and manage all registered vendor accounts.
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search vendors by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 items-end">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active / Approved</option>
                            <option value="pending">Pending Approval</option>
                            <option value="suspended">Suspended</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Joined From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Joined To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="col-span-1">
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter('all');
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
                            {/* ============================================================================
                             * 🎓 VIVA CODE MODIFICATION TASK 3: ADD VENDOR PHONE COLUMN & STATUS FILTER
                             * ----------------------------------------------------------------------------
                             * If examiner asks to add Vendor Phone Column or extra Vendor Type Filter:
                             * 1. Add <th className="p-4">Phone Number</th> to <thead> below.
                             * 2. Add <td className="p-4 text-xs font-semibold text-slate-700">{vendor.phone || 'N/A'}</td> to <tbody>.
                             * 3. In filteredVendors logic:
                             *    const matchesPhone = !phoneSearch || (vendor.phone && vendor.phone.includes(phoneSearch));
                             * ============================================================================
                             */}
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-left bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-4 pl-6">Vendor Details</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Member Since</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                    <tr
                                        key={i}
                                        className="animate-pulse"
                                    >
                                        <td className="p-4 pl-6">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                        </td>
                                        <td className="p-4">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                                        </td>
                                        <td className="p-4">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                                        </td>
                                        <td className="p-4">
                                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
                                        </td>
                                        <td className="p-4 pr-6">
                                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-48 ml-auto"></div>
                                        </td>
                                    </tr>
                                ))
                                : paginatedVendors.map((vendor) => (
                                    <tr
                                        key={vendor._id}
                                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors ${vendor.status === 'pending' ? 'bg-amber-50/60 dark:bg-amber-950/25 border-l-4 border-amber-500' : ''}`}
                                    >
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-sm shadow-xs uppercase shrink-0">
                                                    {vendor.name ? vendor.name.charAt(0) : "V"}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>{vendor.name}</span>
                                                        {vendor.status === 'pending' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs animate-pulse">
                                                                ✨ NEW VENDOR
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {vendor.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300 capitalize">
                                            {vendor.type || "General"}
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                                            {vendor.createdAt
                                                ? new Date(vendor.createdAt).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${vendor.status === "active"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                                                    : vendor.status === "inactive"
                                                        ? "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                                        : vendor.status === "suspended"
                                                            ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                                                            : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${vendor.status === "active" ? "bg-emerald-500" : vendor.status === "suspended" ? "bg-amber-500" : vendor.status === "inactive" ? "bg-slate-400" : "bg-blue-500"}`}></span>
                                                {vendor.status || "pending"}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                {/* View Button */}
                                                <button
                                                    onClick={() => setViewVendor(vendor)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-2xs"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>

                                                {/* Approve Button */}
                                                {vendor.status === "pending" && (
                                                    <button
                                                        onClick={() => triggerActionPrompt(vendor, "approve")}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Approve
                                                    </button>
                                                )}

                                                {/* Suspend Button */}
                                                {(vendor.status === "active" || !vendor.status) && (
                                                    <button
                                                        onClick={() => triggerActionPrompt(vendor, "suspend")}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer shadow-2xs"
                                                    >
                                                        <Ban className="w-3.5 h-3.5" />
                                                        Suspend
                                                    </button>
                                                )}

                                                {/* Activate Button */}
                                                {(vendor.status === "suspended" || vendor.status === "inactive") && (
                                                    <button
                                                        onClick={() => triggerActionPrompt(vendor, "activate")}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer shadow-2xs"
                                                    >
                                                        <PlayCircle className="w-3.5 h-3.5" />
                                                        Activate
                                                    </button>
                                                )}

                                                {/* Inactive Button */}
                                                {vendor.status !== "inactive" && (
                                                    <button
                                                        onClick={() => triggerActionPrompt(vendor, "inactivate")}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Inactive
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredVendors.length === 0 && (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        No vendors found matching your search.
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


            {/* VIEW VENDOR DETAILS MODAL */}
            {viewVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden transform transition-all">
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white relative">
                            <button
                                onClick={() => setViewVendor(null)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black mb-3 border border-white/30 uppercase">
                                {viewVendor.name ? viewVendor.name.charAt(0) : "V"}
                            </div>
                            <h3 className="text-xl font-bold">{viewVendor.name}</h3>
                            <p className="text-xs text-indigo-100 mt-1">{viewVendor.email}</p>
                        </div>

                        {/* Body Details */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                                <Building2 className="w-5 h-5 text-indigo-500" />
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Business Type</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">
                                        {viewVendor.type || "General Vendor"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Current Status</p>
                                    <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                                        {viewVendor.status || "pending"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Member Since</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {viewVendor.createdAt
                                            ? new Date(viewVendor.createdAt).toLocaleString()
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                                <Hash className="w-5 h-5 text-slate-400" />
                                <div className="overflow-hidden">
                                    <p className="text-xs text-slate-400 font-medium">Vendor ID</p>
                                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                                        {viewVendor._id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-700/50 flex justify-between gap-2">
                            <button
                                onClick={() => setViewVendor(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            >
                                Close
                            </button>

                            <div className="flex gap-2">
                                {(viewVendor.status === "active" || !viewVendor.status) && (
                                    <button
                                        onClick={() => triggerActionPrompt(viewVendor, "suspend")}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 cursor-pointer"
                                    >
                                        <Ban className="w-3.5 h-3.5" /> Suspend
                                    </button>
                                )}
                                {(viewVendor.status === "suspended" || viewVendor.status === "inactive") && (
                                    <button
                                        onClick={() => triggerActionPrompt(viewVendor, "activate")}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                                    >
                                        <PlayCircle className="w-3.5 h-3.5" /> Activate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTION CONFIRMATION POPUP MODAL */}
            {confirmModal && (() => {
                const details = getActionDetails(confirmModal.action);
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-center transform transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                                {details.icon}
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {details.title}
                            </h3>

                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 font-medium">
                                Vendor: <span className="font-bold text-slate-900 dark:text-white">{confirmModal.vendor.name}</span>
                            </p>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                {details.description}
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    disabled={actionLoading}
                                    className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    disabled={actionLoading}
                                    className={`w-1/2 py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors shadow-sm ${details.confirmBtnClass}`}
                                >
                                    {actionLoading ? "Processing..." : "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </AdminLayout>
    );
}
