import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSignup() {
    const defaultSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin_secret_key_123';
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        adminSecret: defaultSecret
    });
    
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!formData.adminSecret) {
            setFormData(prev => ({ ...prev, adminSecret: defaultSecret }));
        }
    }, []);

    const validateField = (name, value) => {
        let err = '';
        if (name === 'name') {
            if (!value.trim()) err = 'Full name is required';
            else if (value.trim().length < 2) err = 'Name must be at least 2 characters';
            else if (value.length > 50) err = 'Name cannot exceed 50 characters';
        } else if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value.trim()) err = 'Email address is required';
            else if (!emailRegex.test(value.trim())) err = 'Please enter a valid email address';
            else if (value.length > 100) err = 'Email cannot exceed 100 characters';
        } else if (name === 'password') {
            if (!value) err = 'Password is required';
            else if (value.length < 6) err = 'Password must be at least 6 characters';
            else if (value.length > 50) err = 'Password cannot exceed 50 characters';
        } else if (name === 'adminSecret') {
            if (!value) err = 'Admin setup key is required';
            else if (value.length > 100) err = 'Key cannot exceed 100 characters';
        }
        return err;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        const err = validateField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: err }));
    };

    const validateForm = () => {
        const errors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'role') {
                const err = validateField(key, formData[key]);
                if (err) errors[key] = err;
            }
        });
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            setError('Please correct the validation errors before submitting');
            return;
        }

        const res = await signup({
            ...formData,
            email: formData.email.trim(),
            name: formData.name.trim()
        });
        if (res.success) {
            router.push('/');
        } else {
            setError(res.message);
        }
    };

    const getPasswordStrength = (pass) => {
        if (!pass) return null;
        if (pass.length < 6) return { label: 'Too short', color: 'text-red-400' };
        if (pass.length >= 10 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
            return { label: 'Strong', color: 'text-emerald-400' };
        }
        if (pass.length >= 6) return { label: 'Fair', color: 'text-amber-400' };
        return { label: 'Weak', color: 'text-red-400' };
    };

    const passStrength = getPasswordStrength(formData.password);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-slate-800 p-10 rounded-xl shadow-2xl border border-slate-700">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
                        Admin<span className="text-blue-500">Access</span>
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400 font-medium uppercase tracking-widest">
                        System Administrator Registration
                    </p>
                </div>
                {error && (
                    <div className="bg-red-900/30 border-l-4 border-red-500 p-4 text-red-200 text-sm rounded flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-300">Full Name</label>
                                <span className="text-xs text-slate-500">{formData.name.length}/50</span>
                            </div>
                            <input
                                type="text"
                                name="name"
                                required
                                minLength={2}
                                maxLength={50}
                                className={`appearance-none relative block w-full px-4 py-3 border ${
                                    fieldErrors.name ? 'border-red-500' : 'border-slate-600'
                                } bg-slate-700 placeholder-slate-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all`}
                                placeholder="e.g. John Doe (2-50 chars)"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {fieldErrors.name && (
                                <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.name}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-300">Email Address</label>
                                <span className="text-xs text-slate-500">{formData.email.length}/100</span>
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                maxLength={100}
                                className={`appearance-none relative block w-full px-4 py-3 border ${
                                    fieldErrors.email ? 'border-red-500' : 'border-slate-600'
                                } bg-slate-700 placeholder-slate-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all`}
                                placeholder="admin@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {fieldErrors.email && (
                                <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-300">Password</label>
                                <span className="text-xs text-slate-500">{formData.password.length}/50</span>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    minLength={6}
                                    maxLength={50}
                                    className={`appearance-none relative block w-full pl-4 pr-10 py-3 border ${
                                        fieldErrors.password ? 'border-red-500' : 'border-slate-600'
                                    } bg-slate-700 placeholder-slate-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all`}
                                    placeholder="Password (6-50 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-5 w-5" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password ? (
                                <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.password}</p>
                            ) : passStrength ? (
                                <p className={`mt-1 text-xs font-semibold ${passStrength.color}`}>
                                    Password Strength: {passStrength.label}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-blue-400">Admin Setup Key</label>
                                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                                    <CheckCircle className="w-3 h-3" /> Auto-loaded from .env
                                </span>
                            </div>
                            <input
                                type="password"
                                name="adminSecret"
                                required
                                maxLength={100}
                                className={`appearance-none relative block w-full px-4 py-3 border ${
                                    fieldErrors.adminSecret ? 'border-red-500' : 'border-blue-500/50'
                                } bg-slate-900 placeholder-slate-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all`}
                                placeholder="Enter secret key to create admin"
                                value={formData.adminSecret}
                                onChange={handleChange}
                            />
                            {fieldErrors.adminSecret && (
                                <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.adminSecret}</p>
                            )}
                            <p className="mt-1 text-xs text-slate-400">
                                Pre-filled from environment config. You can change it if using a different setup key.
                            </p>
                        </div>

                        <div>
                            <input type="hidden" name="role" value="admin" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            Register Admin
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-400 font-medium">
                            Already have an account?{' '}
                            <Link href="/auth/admin/login" className="text-blue-400 font-bold hover:underline">
                                Admin Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
