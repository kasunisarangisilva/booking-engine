import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_BASE = 'http://localhost:5000/api';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API_BASE}/bookings/my-bookings`);
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="container py-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">My Bookings</h1>
                    <p className="text-secondary mt-2">Manage and view your upcoming and past reservations.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <p className="text-lg animate-pulse">Loading your bookings...</p>
                    </div>
                ) : (
                    <div className="space-y-4 md:space-y-6">
                        {bookings.length === 0 ? (
                            <div className="card text-center py-12 bg-white">
                                <p className="text-secondary">You haven't made any bookings yet.</p>
                                <a href="/" className="btn btn-primary inline-block mt-4 text-sm no-underline">Start Browsing</a>
                            </div>
                        ) : (
                            bookings.map(booking => (
                                <div key={booking.id} className="card p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
                                            📅
                                        </div>
                                        <div>
                                            <h3 className="text-base md:text-lg font-bold">Booking #{booking.id.slice(-6).toUpperCase()}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                                <span className="text-[10px] md:text-xs text-secondary font-medium">
                                                    Reserved on {new Date(booking.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-auto flex justify-between md:flex-col items-center md:items-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                        <p className="text-xl md:text-2xl font-bold text-primary">${booking.totalPrice}</p>
                                        <button className="text-xs md:text-sm text-accent font-semibold hover:underline mt-1">View Details →</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </>
    );
}
