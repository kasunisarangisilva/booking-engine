import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Phone, Mail, Calendar, DollarSign, ShoppingBag, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

const isSyntheticEmail = (email) => {
    if (!email) return true;
    return email.endsWith('@guest.internal') ||
        email.startsWith('widget_') ||
        email.startsWith('guest_') ||
        /^guest_\d+@example\.com$/.test(email);
};

export default function Customers() {
    const { token, user } = useAuth();
    const router = useRouter();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        if (user?.role === 'admin') {
            router.replace('/');
        } else if (token && user?.role === 'vendor') {
            fetchCustomers();
        }
    }, [token, user, router]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/bookings/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.customers) {
                setCustomers(data.customers);
            } else {
                toast.error(data.message || 'Failed to fetch customers');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    // Filter by search query
    const filteredCustomers = customers.filter(c => {
        const query = searchQuery.toLowerCase();
        return (
            (c.name && c.name.toLowerCase().includes(query)) ||
            (c.email && c.email.toLowerCase().includes(query)) ||
            (c.phone && c.phone.toLowerCase().includes(query))
        );
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

    // Summary Metrics
    const totalCustomersCount = customers.length;
    const totalBookingsCount = customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0);
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const avgBookingsPerCustomer = totalCustomersCount > 0 ? (totalBookingsCount / totalCustomersCount).toFixed(1) : 0;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                            Customer Directory
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Users who have placed bookings on your listings.
                        </p>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Customers</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalCustomersCount}</h3>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Bookings</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalBookingsCount}</h3>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">${totalRevenue.toLocaleString()}</h3>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg. Bookings / User</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{avgBookingsPerCustomer}</h3>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                    <div className="relative max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by customer name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-semibold text-sm">
                            Loading customer records...
                        </div>
                    ) : currentCustomers.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 space-y-2">
                            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                            <p className="font-bold text-slate-600 dark:text-slate-300">No Customers Found</p>
                            <p className="text-xs text-slate-400">When users make bookings on your listings, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        <th className="py-3.5 px-6">Customer</th>
                                        <th className="py-3.5 px-6">Contact Info</th>
                                        <th className="py-3.5 px-6">Listings Booked</th>
                                        <th className="py-3.5 px-6 text-center">Bookings</th>
                                        <th className="py-3.5 px-6 text-right">Total Spent</th>
                                        <th className="py-3.5 px-6 text-right">Last Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {currentCustomers.map((customer, idx) => (
                                        <tr key={customer.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                                        {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{customer.name}</p>
                                                        <p className="text-xs text-slate-400 font-mono">ID: {String(customer.id).slice(-8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-1 text-xs">
                                                    {customer.email && customer.email !== 'N/A' && !isSyntheticEmail(customer.email) ? (
                                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                            <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                            <span className="font-medium">{customer.email}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500">
                                                            Guest (No Email)
                                                        </span>
                                                    )}
                                                    {customer.phone && customer.phone !== 'N/A' && (
                                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            <span>{customer.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {customer.listingsBooked?.slice(0, 3).map((title, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-100 dark:border-indigo-900/40">
                                                            {title}
                                                        </span>
                                                    ))}
                                                    {customer.listingsBooked?.length > 3 && (
                                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs font-bold">
                                                            +{customer.listingsBooked.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200">
                                                    {customer.totalBookings}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                ${customer.totalSpent?.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 text-right text-xs text-slate-400 font-mono">
                                                {customer.lastBookingDate ? new Date(customer.lastBookingDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1.5 text-xs font-bold text-slate-500">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
