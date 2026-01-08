import { useState, useEffect } from 'react';
import axios from 'axios';

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
        <div className="container">
            <h1>My Bookings</h1>
            {loading ? <p>Loading...</p> : (
                <div style={{ marginTop: '2rem' }}>
                    {bookings.length === 0 ? <p>No bookings yet.</p> : (
                        bookings.map(booking => (
                            <div key={booking.id} className="card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{ marginBottom: '0.25rem' }}>Booking #{booking.id.slice(-6)}</h3>
                                    <p style={{ color: 'var(--text-light)' }}>Status: <strong>{booking.status}</strong></p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${booking.totalPrice}</p>
                                    <p style={{ fontSize: '0.875rem' }}>{new Date(booking.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
