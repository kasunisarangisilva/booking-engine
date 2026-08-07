import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const validateEmail = (val) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!val.trim()) return 'Email address is required';
        if (!emailRegex.test(val.trim())) return 'Please enter a valid email address';
        if (val.length > 100) return 'Email cannot exceed 100 characters';
        return '';
    };

    const validatePassword = (val) => {
        if (!val) return 'Password is required';
        if (val.length < 6) return 'Password must be at least 6 characters';
        if (val.length > 50) return 'Password cannot exceed 50 characters';
        return '';
    };

    const handleEmailChange = (e) => {
        const val = e.target.value;
        setEmail(val);
        setFieldErrors(prev => ({ ...prev, email: validateEmail(val) }));
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        setFieldErrors(prev => ({ ...prev, password: validatePassword(val) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const emailErr = validateEmail(email);
        const passErr = validatePassword(password);
        if (emailErr || passErr) {
            setFieldErrors({ email: emailErr, password: passErr });
            setError('Please fix input errors before logging in.');
            return;
        }

        const res = await login(email.trim(), password);
        if (res.success) {
            router.push('/');
        } else {
            setError(res.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-slate-800 p-10 rounded-xl shadow-2xl border border-slate-700">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
                        Admin<span className="text-blue-500">Panel</span>
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400 font-medium uppercase tracking-widest">
                        Administrative Access Only
                    </p>
                </div>
                {error && (
                    <div className="bg-red-900/30 border-l-4 border-red-500 p-4 text-red-200 text-sm rounded flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-300">Email Address</label>
                                <span className="text-xs text-slate-500">{email.length}/100</span>
                            </div>
                            <input
                                type="email"
                                required
                                maxLength={100}
                                className={`appearance-none relative block w-full px-4 py-3 border ${
                                    fieldErrors.email ? 'border-red-500' : 'border-slate-600'
                                } bg-slate-700 placeholder-slate-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all`}
                                placeholder="admin@example.com"
                                value={email}
                                onChange={handleEmailChange}
                            />
                            {fieldErrors.email && (
                                <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-300">Password</label>
                                <span className="text-xs text-slate-500">{password.length}/50</span>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    maxLength={50}
                                    className={`appearance-none relative block w-full pl-4 pr-10 py-3 border ${
                                        fieldErrors.password ? 'border-red-500' : 'border-slate-600'
                                    } bg-slate-700 placeholder-slate-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all`}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={handlePasswordChange}
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
                            {fieldErrors.password && (
                                <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.password}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            Sign In to Dashboard
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-slate-400 font-medium">
                            Need to create an admin account?{' '}
                            <Link href="/auth/admin/signup" className="text-blue-400 font-bold hover:underline">
                                Register Admin
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
