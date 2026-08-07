import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { FileDown, RefreshCw, BarChart2, Users, Package, BookOpen, TrendingUp, RotateCcw } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

const REPORT_TYPES_ADMIN = [
    { value: 'vendors',   label: 'Vendor Accounts',      icon: Users },
    { value: 'listings',  label: 'Listings Report',      icon: Package },
];

const REPORT_TYPES_VENDOR = [
    { value: 'bookings',  label: 'Bookings Summary',     icon: BookOpen },
    { value: 'listings',  label: 'Listings Report',      icon: Package },
    { value: 'customers', label: 'Customer Accounts',    icon: Users },
];

const DATE_RANGES = [
    { value: 'all',     label: 'All Time' },
    { value: 'today',   label: 'Today' },
    { value: 'last-7',  label: 'Last 7 Days' },
    { value: 'last-30', label: 'Last 30 Days' },
    { value: 'last-90', label: 'Last 90 Days' },
];

export default function Reports() {
    const [reportType, setReportType] = useState('vendors');
    const [dateRange, setDateRange] = useState('all');
    const [exportFormat, setExportFormat] = useState('pdf');
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [stats, setStats] = useState(null);
    const [previewItems, setPreviewItems] = useState([]);
    const [userRole, setUserRole] = useState('admin');
    const [error, setError] = useState('');

    const handleClearFilters = () => {
        const defaultType = userRole === 'vendor' ? 'bookings' : 'vendors';
        setReportType(defaultType);
        setDateRange('all');
        setExportFormat('pdf');
    };

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/admin/reports`, {
                params: { type: reportType, range: dateRange },
                headers: { Authorization: `Bearer ${token}` },
            });
            setStats(res.data);
            setPreviewItems(res.data.previewItems || []);
            const role = res.data.userRole || 'admin';
            setUserRole(role);

            const allowed = role === 'vendor' ? REPORT_TYPES_VENDOR : REPORT_TYPES_ADMIN;
            if (!allowed.some(r => r.value === reportType)) {
                setReportType(allowed[0].value);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load report data.');
        } finally {
            setLoading(false);
        }
    }, [reportType, dateRange]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/admin/export-report`, {
                params: { type: reportType, range: dateRange, format: exportFormat },
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const blob = new Blob([res.data], { type: res.headers['content-type'] });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `${reportType}-report-${dateRange}.${exportFormat}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            setError('Failed to download report file.');
        } finally {
            setTimeout(() => setExporting(false), 1000);
        }
    };

    const reportTypes = userRole === 'vendor' ? REPORT_TYPES_VENDOR : REPORT_TYPES_ADMIN;

    const statCards = stats ? [
        { label: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toFixed(2)}`, sub: `LKR ${((stats.totalRevenue || 0) * 300).toLocaleString()}`, color: 'from-indigo-500 to-purple-600', icon: TrendingUp },
        { label: 'Total Bookings', value: stats.totalBookings ?? 0, sub: 'Across all listings', color: 'from-blue-500 to-cyan-600', icon: BookOpen },
        { label: 'Total Listings', value: stats.totalListings ?? 0, sub: 'Published & drafts', color: 'from-emerald-500 to-teal-600', icon: Package },
        ...(userRole === 'admin' ? [{ label: 'Total Vendors', value: stats.totalVendors ?? 0, sub: 'Registered vendors', color: 'from-amber-500 to-orange-600', icon: Users }] : []),
    ] : [];

    const getStatusColor = (status = '') => {
        const s = status.toUpperCase();
        if (s === 'CONFIRMED' || s === 'ACTIVE' || s === 'APPROVED') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (s === 'PENDING' || s === 'PENDING APPROVAL') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        if (s === 'CANCELLED' || s === 'SUSPENDED') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Analytics &amp; Reports
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {userRole === 'vendor' ? 'Your bookings and listings reports' : 'Platform-wide vendors, listings, and booking reports'}
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting || loading}
                    id="btn-export-report"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all disabled:opacity-60 disabled:scale-100 w-full sm:w-auto justify-center"
                >
                    <FileDown className="w-4 h-4" />
                    {exporting ? 'Preparing...' : `Export ${exportFormat.toUpperCase()}`}
                </button>
            </div>

            {/* Filters */}
            <div className="card p-5 grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Report Type</label>
                    <select
                        id="select-report-type"
                        className="w-full p-2.5 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        {reportTypes.map(rt => (
                            <option key={rt.value} value={rt.value}>{rt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Date Range</label>
                    <select
                        id="select-date-range"
                        className="w-full p-2.5 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        {DATE_RANGES.map(dr => (
                            <option key={dr.value} value={dr.value}>{dr.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Export Format</label>
                    <div className="flex gap-2">
                        {['pdf', 'csv'].map(fmt => (
                            <button
                                key={fmt}
                                id={`btn-format-${fmt}`}
                                onClick={() => setExportFormat(fmt)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${
                                    exportFormat === fmt
                                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-border dark:border-slate-700 hover:border-indigo-400'
                                }`}
                            >
                                {fmt.toUpperCase()}
                            </button>
                        ))}
                        <button
                            id="btn-clear-filters"
                            onClick={handleClearFilters}
                            disabled={loading}
                            className="px-3 py-2.5 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:border-red-400 transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold"
                            title="Clear Filters"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Clear</span>
                        </button>
                        <button
                            id="btn-refresh-report"
                            onClick={fetchReports}
                            disabled={loading}
                            className="p-2.5 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-indigo-500 hover:border-indigo-400 transition-all disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="card p-5 animate-pulse">
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-3" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        </div>
                    ))
                ) : statCards.map((s, i) => (
                    <div key={i} className="card p-5 overflow-hidden relative group hover:scale-[1.02] transition-transform">
                        <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}>
                            <s.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Preview Table */}
            <div className="card p-0 overflow-hidden">
                <div className="p-5 border-b border-border dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            {reportTypes.find(r => r.value === reportType)?.label || 'Report'} Preview
                        </h2>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {loading ? '...' : `${previewItems.length} records`}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-10 text-center">
                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                            <p className="text-sm text-slate-500">Loading report data...</p>
                        </div>
                    ) : previewItems.length === 0 ? (
                        <div className="p-12 text-center">
                            <BarChart2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No records found for the selected filters.</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try changing the date range or report type.</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-border dark:border-slate-700 text-left bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                                    <th className="px-5 py-3">#</th>
                                    <th className="px-5 py-3">{reportType === 'vendors' ? 'Date Joined' : reportType === 'listings' ? 'Date Created' : reportType === 'customers' ? 'Last Booking' : 'Booking Date'}</th>
                                    <th className="px-5 py-3">{reportType === 'vendors' ? 'Vendor Details' : reportType === 'listings' ? 'Listing Details' : reportType === 'customers' ? 'Customer Details' : 'Booking Details'}</th>
                                    <th className="px-5 py-3 text-right">{reportType === 'vendors' ? 'Info' : reportType === 'listings' ? 'Price' : reportType === 'customers' ? 'Total Spent' : 'Amount'}</th>
                                    <th className="px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewItems.map((item, idx) => (
                                    <tr
                                        key={item.id || idx}
                                        className="border-b border-border dark:border-slate-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                                    >
                                        <td className="px-5 py-3 text-xs text-slate-400 dark:text-slate-500 font-mono">{idx + 1}</td>
                                        <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 font-medium">{item.date}</td>
                                        <td className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">{item.description}</td>
                                        <td className="px-5 py-3 text-right">
                                            {item.amount > 0 ? (
                                                <div>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">${item.amount.toFixed(2)}</span>
                                                    <br />
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">(LKR {(item.amount * 300).toLocaleString()})</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Export hint footer */}
                {!loading && previewItems.length > 0 && (
                    <div className="px-5 py-4 border-t border-border dark:border-slate-700 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/30">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            💡 Select <strong>PDF</strong> or <strong>CSV</strong> above then click <strong>Export</strong> to download the full report.
                        </p>
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-60"
                        >
                            <FileDown className="w-3.5 h-3.5" />
                            Download {exportFormat.toUpperCase()}
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
