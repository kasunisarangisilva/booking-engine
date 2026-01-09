import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_BASE = 'http://localhost:5000/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.push('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-slate-50">
                <div className="card w-full max-w-[400px] p-8 shadow-lg">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-primary">Login</h2>
                        <p className="text-secondary mt-2">Welcome back! Please enter your details.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-text">Email</label>
                            <input
                                type="email"
                                className="w-full p-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-text">Password</label>
                                <a href="#" className="text-xs text-accent hover:underline">Forgot?</a>
                            </div>
                            <input
                                type="password"
                                className="w-full p-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full py-3 mt-4 text-base font-bold">
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border text-center">
                        <p className="text-sm text-secondary">
                            Don't have an account? <a href="#" className="text-accent font-semibold hover:underline">Sign up</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
