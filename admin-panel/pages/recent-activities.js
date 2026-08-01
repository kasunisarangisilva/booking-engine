import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import {
    Eye,
    Trash2,
    ArrowLeft,
    Calendar,
    Bell,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Sliders
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
}

export default function RecentActivities() {
    const [activities, setActivities] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Modal state
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [deleteModalId, setDeleteModalId] = useState(null);

    // Track locally hidden/deleted activities
    const [hiddenIds, setHiddenIds] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem(`deleted_activities_${user?._id || 'guest'}`);
        if (stored) {
            try {
                setHiddenIds(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchActivities();
    }, [page]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/admin/recent-activities?page=${page}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActivities(res.data.activities);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('Failed to fetch activities:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteModalId(id);
    };

    const confirmDelete = () => {
        if (deleteModalId === null) return;

        const updated = [...hiddenIds, deleteModalId];
        setHiddenIds(updated);
        localStorage.setItem(`deleted_activities_${user?._id || 'guest'}`, JSON.stringify(updated));

        toast.success('Activity log removed');
        setDeleteModalId(null);
    };

    // Filter out locally deleted activities
    const visibleActivities = activities.filter(act => !hiddenIds.includes(act.id));

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        Recent Activity Log
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Detailed history of platform events, registrations, and transactions.
                    </p>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 p-5 animate-pulse">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))
                    ) : visibleActivities.length === 0 ? (
                        <div className="p-16 text-center">
                            <Sliders className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-semibold">No activity recorded yet.</p>
                        </div>
                    ) : (
                        visibleActivities.map((activity, i) => (
                            <div
                                key={activity.id || i}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-700/25 transition-colors"
                            >
                                <div className="flex items-start gap-4 min-w-0">
                                    <div className="text-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-indigo-900/30">
                                        {activity.icon || '🔔'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-slate-900 dark:text-white font-semibold text-sm leading-snug">
                                            {activity.text}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                {timeAgo(activity.time)}
                                            </span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">
                                                {activity.type?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                    <button
                                        onClick={() => setSelectedActivity(activity)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> View Details
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(activity.id || i)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                        Previous
                    </button>

                    <div className="flex gap-1">
                        {[...Array(pagination.totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${page === i + 1
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages || loading}
                        className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* View Details Modal */}
            {selectedActivity && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] transition-opacity">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 w-12 h-12 rounded-xl flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30">
                                {selectedActivity.icon || '🔔'}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Activity Detail</h3>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider mt-0.5">
                                    {selectedActivity.type?.replace('_', ' ')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 py-2">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                {selectedActivity.text}
                            </div>

                            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                <span>Timestamp:</span>
                                <span className="font-semibold">{new Date(selectedActivity.time).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            {selectedActivity.route && (
                                <Link
                                    href={selectedActivity.route}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                                >
                                    Go to Section
                                </Link>
                            )}
                            <button
                                onClick={() => setSelectedActivity(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalId !== null && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100]">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-sm w-full p-6 shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/30">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Activity Log?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                            Are you sure you want to remove this event from your recent activity view? This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => setDeleteModalId(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
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
