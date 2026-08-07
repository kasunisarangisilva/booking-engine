import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'vendor',
        phone: ''
    });
    
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { signup } = useAuth();
    const router = useRouter();

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
        } else if (name === 'phone') {
            const phoneRegex = /^\+?[0-9]{9,15}$/;
            if (!value.trim()) err = 'Phone number is required';
            else if (!phoneRegex.test(value.trim())) err = 'Enter a valid phone number (9-15 digits, e.g. +94771234567)';
            else if (value.length > 15) err = 'Phone number cannot exceed 15 characters';
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
        setSuccessMessage('');
        
        if (!validateForm()) {
            setError('Please correct the errors in the form before submitting.');
            return;
        }

        const res = await signup({
            ...formData,
            email: formData.email.trim(),
            name: formData.name.trim(),
            phone: formData.phone.trim()
        });

        if (res.success) {
            if (res.pendingApproval) {
                setSuccessMessage(res.message);
            } else {
                router.push('/');
            }
        } else {
            setError(res.message);
        }
    };

    const getPasswordStrength = (pass) => {
        if (!pass) return null;
        if (pass.length < 6) return { label: 'Too short', color: 'text-red-500' };
        if (pass.length >= 10 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
            return { label: 'Strong', color: 'text-emerald-600' };
        }
        if (pass.length >= 6) return { label: 'Fair', color: 'text-amber-600' };
        return { label: 'Weak', color: 'text-red-500' };
    };

    const passStrength = getPasswordStrength(formData.password);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                        Vendor<span className="text-blue-600">Signup</span>
                    </h2>
                    <p className="mt-2 text-center text-sm text-secondary font-medium uppercase tracking-widest">
                        Join our multi-vendor platform
                    </p>
                </div>
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm rounded flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 text-emerald-800 text-sm rounded">
                        <p className="font-bold text-base mb-1">Registration Successful!</p>
                        <p className="mb-3">{successMessage}</p>
                        <Link href="/auth/login" className="font-bold text-emerald-700 underline hover:text-emerald-900">
                            Go to Sign In →
                        </Link>
                    </div>
                )}
                <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                                <span className="text-xs text-slate-400">{formData.name.length}/50</span>
                            </div>
                            <input
                                type="text"
                                name="name"
                                required
                                minLength={2}
                                maxLength={50}
                                className={`appearance-none relative block w-full px-4 py-3 border ${
                                    fieldErrors.name ? 'border-red-500' : 'border-border'
                                } placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all`}
                                placeholder="Full Name (2-50 characters)"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {fieldErrors.name && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.name}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                                <span className="text-xs text-slate-400">{formData.email.length}/100</span>
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                maxLength={100}
                                className={`appearance-none relative block w-full px-4 py-3 border ${
                                    fieldErrors.email ? 'border-red-500' : 'border-border'
                                } placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all`}
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {fieldErrors.email && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                <span className="text-xs text-slate-400">{formData.password.length}/50</span>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    minLength={6}
                                    maxLength={50}
                                    className={`appearance-none relative block w-full pl-4 pr-10 py-3 border ${
                                        fieldErrors.password ? 'border-red-500' : 'border-border'
                                    } placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all`}
                                    placeholder="Password (6-50 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
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
                                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.password}</p>
                            ) : passStrength ? (
                                <p className={`mt-1 text-xs font-semibold ${passStrength.color}`}>
                                    Strength: {passStrength.label}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                                <span className="text-xs text-slate-400">{formData.phone.length}/15</span>
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                required
                                minLength={9}
                                maxLength={15}
                                className={`appearance-none relative block w-full px-4 py-3 border ${
                                    fieldErrors.phone ? 'border-red-500' : 'border-border'
                                } placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all`}
                                placeholder="e.g. +94771234567"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            {fieldErrors.phone && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.phone}</p>
                            )}
                        </div>

                        <div>
                            <input type="hidden" name="role" value="vendor" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            Register
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-600 font-medium">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-blue-600 font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
