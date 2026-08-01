import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import {
    User, Lock, Save, Code, Copy, Check, ShieldCheck, KeyRound,
    Settings, Globe, DollarSign, Percent, Mail, AlertTriangle,
    Eye, EyeOff, Users, Store, Wrench
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export default function Profile() {
    const { user, token, updateUser } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('details'); // details | password | widget | settings

    // Profile State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Password State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPw, setShowOldPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    // Widget Embed State
    const [themeKey, setThemeKey] = useState('ocean');
    const [fontId, setFontId] = useState('inter');
    const [radiusId, setRadiusId] = useState('round');
    const [copied, setCopied] = useState(false);

    // Platform Settings State
    const [platformName, setPlatformName] = useState('Multi-Vendor Booking Platform');
    const [supportEmail, setSupportEmail] = useState('');
    const [defaultCurrency, setDefaultCurrency] = useState('USD');
    const [commissionRate, setCommissionRate] = useState('10');
    const [allowNewVendors, setAllowNewVendors] = useState(true);
    const [requireVendorApproval, setRequireVendorApproval] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(false);

    const [loading, setLoading] = useState(false);

    const vendorId = user?._id || user?.id || 'YOUR_VENDOR_ID';
    const embedCode = `<!-- BookEngine Widget -->
<script src="https://booking-engine-widget.vercel.app/loader.js"></script>
<booking-engine
    data-account-id="${vendorId}"
    data-theme="${themeKey}"
    data-font="${fontId}"
    data-radius="${radiusId}"
></booking-engine>`;

    const copyEmbedCode = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        toast.success('Embed code copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
    };

    // Sync tab from URL query
    useEffect(() => {
        if (router.query.tab === 'settings' && user?.role === 'admin') {
            setActiveTab('settings');
        }
    }, [router.query, user]);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    // Load platform settings if admin
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.settings) {
                const s = data.settings;
                setPlatformName(s.platformName || 'Multi-Vendor Booking Platform');
                setSupportEmail(s.supportEmail || '');
                setDefaultCurrency(s.defaultCurrency || 'USD');
                setCommissionRate(String(s.commissionRate ?? 10));
                setAllowNewVendors(s.allowNewVendors ?? true);
                setRequireVendorApproval(s.requireVendorApproval ?? true);
                setMaintenanceMode(s.maintenanceMode ?? false);
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, phone })
            });
            const data = await res.json();
            if (res.ok) {
                // Update user in context and localStorage so UI reflects new name/email
                updateUser(
                    {
                        ...user,
                        name: data.name || name,
                        email: data.email || email,
                        phone: data.phone || phone,
                    },
                    data.token || token
                );
                toast.success('Profile updated successfully!');
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Password changed successfully!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSettingsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    platformName,
                    supportEmail,
                    defaultCurrency,
                    commissionRate: Number(commissionRate),
                    allowNewVendors,
                    requireVendorApproval,
                    maintenanceMode,
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Platform settings saved successfully!');
            } else {
                toast.error(data.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setSettingsLoading(false);
        }
    };

    const tabClass = (tab) =>
        `px-5 py-3.5 text-xs font-bold rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 ${activeTab === tab
            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 dark:border-indigo-400 shadow-2xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`;

    // Beautiful toggle component
    const Toggle = ({ value, onChange, label, description, icon: Icon }) => (
        <div
            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                value
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-700'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
            }`}
            onClick={() => onChange(!value)}
        >
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className={`p-2 rounded-xl ${value ? 'bg-indigo-100 dark:bg-indigo-900/60' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <Icon className={`w-4 h-4 ${value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                    </div>
                )}
                <div>
                    <p className={`text-sm font-bold ${value ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300'}`}>
                        {label}
                    </p>
                    {description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                    )}
                </div>
            </div>
            {/* Toggle switch */}
            <div
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ml-4 ${value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
        </div>
    );

    // Password field with eye toggle
    const PasswordField = ({ label, value, onChange, showPw, setShowPw, required = true, placeholder, hint }) => (
        <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                {label} {required && '*'}
            </label>
            <div className="relative">
                <input
                    type={showPw ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-3.5 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required={required}
                />
                <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                >
                    {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
            </div>
            {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
        </div>
    );

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        Account Settings &amp; Profile
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage your profile details, security, and platform configuration.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 pt-2 overflow-x-auto">
                        <nav className="flex space-x-2 min-w-max">
                            <button onClick={() => setActiveTab('details')} className={tabClass('details')}>
                                <User className="w-4 h-4" />
                                Personal Details
                            </button>

                            <button onClick={() => setActiveTab('password')} className={tabClass('password')}>
                                <Lock className="w-4 h-4" />
                                Security &amp; Password
                            </button>

                            {/* Widget tab — vendor only */}
                            {user?.role === 'vendor' && (
                                <button onClick={() => setActiveTab('widget')} className={tabClass('widget')}>
                                    <Code className="w-4 h-4" />
                                    Widget Embed
                                </button>
                            )}

                            {/* Platform Settings tab — admin only */}
                            {user?.role === 'admin' && (
                                <button onClick={() => setActiveTab('settings')} className={tabClass('settings')}>
                                    <Settings className="w-4 h-4" />
                                    Platform Settings
                                </button>
                            )}
                        </nav>
                    </div>

                    <div className="p-6 md:p-8">

                        {/* ── PERSONAL DETAILS ── */}
                        {activeTab === 'details' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="+94..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                        Account Role
                                    </label>
                                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase border border-slate-200 dark:border-slate-700">
                                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                        {user?.role || 'User'}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer transition-all transform active:scale-95 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? 'Saving...' : 'Save Profile Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── SECURITY & PASSWORD ── */}
                        {activeTab === 'password' && (
                            <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
                                <PasswordField
                                    label="Current Password"
                                    value={oldPassword}
                                    onChange={setOldPassword}
                                    showPw={showOldPw}
                                    setShowPw={setShowOldPw}
                                />

                                <PasswordField
                                    label="New Password"
                                    value={newPassword}
                                    onChange={setNewPassword}
                                    showPw={showNewPw}
                                    setShowPw={setShowNewPw}
                                    hint="Minimum 6 characters"
                                />

                                <PasswordField
                                    label="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    showPw={showConfirmPw}
                                    setShowPw={setShowConfirmPw}
                                />

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer transition-all transform active:scale-95 disabled:opacity-50"
                                    >
                                        <KeyRound className="w-4 h-4" />
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── WIDGET EMBED (vendor only) ── */}
                        {activeTab === 'widget' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Widget Integration Code
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Customize your booking widget theme and copy the HTML snippet to embed on your website.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Theme</label>
                                        <select
                                            value={themeKey}
                                            onChange={(e) => setThemeKey(e.target.value)}
                                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                                        >
                                            <option value="ocean">Ocean Blue</option>
                                            <option value="emerald">Emerald Green</option>
                                            <option value="sunset">Sunset Amber</option>
                                            <option value="midnight">Midnight Dark</option>
                                            <option value="rose">Rose Pink</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Font</label>
                                        <select
                                            value={fontId}
                                            onChange={(e) => setFontId(e.target.value)}
                                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                                        >
                                            <option value="inter">Inter (Modern)</option>
                                            <option value="roboto">Roboto (Clean)</option>
                                            <option value="outfit">Outfit (Stylish)</option>
                                            <option value="serif">Playfair (Serif)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Border Radius</label>
                                        <select
                                            value={radiusId}
                                            onChange={(e) => setRadiusId(e.target.value)}
                                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                                        >
                                            <option value="round">Rounded (16px)</option>
                                            <option value="soft">Soft (8px)</option>
                                            <option value="sharp">Sharp (2px)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="relative bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-xs border border-slate-800 shadow-inner">
                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                                        <span className="text-xs font-sans text-slate-400 font-semibold">HTML Embed Code</span>
                                        <button
                                            onClick={copyEmbedCode}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-sans font-bold cursor-pointer transition-colors"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied ? 'Copied!' : 'Copy Code'}
                                        </button>
                                    </div>
                                    <pre className="overflow-x-auto text-xs text-indigo-300 whitespace-pre-wrap break-all leading-relaxed">
                                        {embedCode}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* ── PLATFORM SETTINGS (admin only) ── */}
                        {activeTab === 'settings' && user?.role === 'admin' && (
                            <form onSubmit={handleSaveSettings} className="space-y-8 max-w-2xl">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Platform Settings</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Configure global platform behaviour. Changes are saved to the database.
                                    </p>
                                </div>

                                {/* General */}
                                <div className="space-y-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">General</p>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                            <Globe className="w-3.5 h-3.5 text-indigo-500" /> Platform Name
                                        </label>
                                        <input
                                            type="text"
                                            value={platformName}
                                            onChange={(e) => setPlatformName(e.target.value)}
                                            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                            <Mail className="w-3.5 h-3.5 text-indigo-500" /> Support Email
                                        </label>
                                        <input
                                            type="email"
                                            value={supportEmail}
                                            onChange={(e) => setSupportEmail(e.target.value)}
                                            placeholder="support@yourdomain.com"
                                            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Finance */}
                                <div className="space-y-5 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Finance</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                                <DollarSign className="w-3.5 h-3.5 text-indigo-500" /> Default Currency
                                            </label>
                                            <select
                                                value={defaultCurrency}
                                                onChange={(e) => setDefaultCurrency(e.target.value)}
                                                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            >
                                                <option value="USD">USD — US Dollar</option>
                                                <option value="EUR">EUR — Euro</option>
                                                <option value="GBP">GBP — British Pound</option>
                                                <option value="LKR">LKR — Sri Lankan Rupee</option>
                                                <option value="INR">INR — Indian Rupee</option>
                                                <option value="AUD">AUD — Australian Dollar</option>
                                                <option value="CAD">CAD — Canadian Dollar</option>
                                                <option value="SGD">SGD — Singapore Dollar</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                                <Percent className="w-3.5 h-3.5 text-indigo-500" /> Commission Rate (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={commissionRate}
                                                onChange={(e) => setCommissionRate(e.target.value)}
                                                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                required
                                            />
                                            <p className="mt-1.5 text-xs text-slate-400">Platform fee deducted per booking (0–100%)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Vendor Controls */}
                                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Vendor Controls</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Control how vendors can register and go live on the platform.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Toggle
                                            value={allowNewVendors}
                                            onChange={setAllowNewVendors}
                                            icon={Store}
                                            label="Allow new vendor registrations"
                                            description="When disabled, the vendor sign-up page will be closed to new applicants."
                                        />
                                        <Toggle
                                            value={requireVendorApproval}
                                            onChange={setRequireVendorApproval}
                                            icon={ShieldCheck}
                                            label="Require admin approval before vendor goes live"
                                            description="When enabled, new vendors must be manually approved before accessing the platform."
                                        />
                                    </div>
                                </div>

                                {/* Widget Integration Code — visible to admin */}
                                <div className="space-y-5 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Widget Integration</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Share this embed code snippet with vendors or embed on your platform&apos;s demo page.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Theme</label>
                                            <select
                                                value={themeKey}
                                                onChange={(e) => setThemeKey(e.target.value)}
                                                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                                            >
                                                <option value="ocean">Ocean Blue</option>
                                                <option value="emerald">Emerald Green</option>
                                                <option value="sunset">Sunset Amber</option>
                                                <option value="midnight">Midnight Dark</option>
                                                <option value="rose">Rose Pink</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Font</label>
                                            <select
                                                value={fontId}
                                                onChange={(e) => setFontId(e.target.value)}
                                                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                                            >
                                                <option value="inter">Inter (Modern)</option>
                                                <option value="roboto">Roboto (Clean)</option>
                                                <option value="outfit">Outfit (Stylish)</option>
                                                <option value="serif">Playfair (Serif)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Border Radius</label>
                                            <select
                                                value={radiusId}
                                                onChange={(e) => setRadiusId(e.target.value)}
                                                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                                            >
                                                <option value="round">Rounded (16px)</option>
                                                <option value="soft">Soft (8px)</option>
                                                <option value="sharp">Sharp (2px)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="relative bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-xs border border-slate-800 shadow-inner">
                                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                                            <span className="text-xs font-sans text-slate-400 font-semibold">HTML Embed Code</span>
                                            <button
                                                type="button"
                                                onClick={copyEmbedCode}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-sans font-bold cursor-pointer transition-colors"
                                            >
                                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                                                {copied ? 'Copied!' : 'Copy Code'}
                                            </button>
                                        </div>
                                        <pre className="overflow-x-auto text-xs text-indigo-300 whitespace-pre-wrap break-all leading-relaxed">
                                            {embedCode}
                                        </pre>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="space-y-4 pt-6 border-t border-rose-100 dark:border-rose-900/40">
                                    <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Danger Zone</p>
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50">
                                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">Maintenance Mode</p>
                                            <p className="text-xs text-rose-500 dark:text-rose-500 mt-1">
                                                When enabled, the widget will be temporarily disabled for visitors. Use during updates.
                                            </p>
                                            <div className="mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                                                        maintenanceMode
                                                            ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700'
                                                            : 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-700 text-rose-600 hover:bg-rose-50'
                                                    }`}
                                                >
                                                    <Wrench className="w-3.5 h-3.5" />
                                                    {maintenanceMode ? 'Maintenance Mode: ON — Click to disable' : 'Maintenance Mode: OFF — Click to enable'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        type="submit"
                                        disabled={settingsLoading}
                                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer transition-all transform active:scale-95 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {settingsLoading ? 'Saving...' : 'Save Platform Settings'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
