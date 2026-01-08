import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function ListingDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchListing();
    }, [id]);

    const fetchListing = async () => {
        try {
            const res = await axios.get(`${API_BASE}/listings/${id}`);
            setListing(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        try {
            // Mock booking
            await axios.post(`${API_BASE}/bookings`, {
                listingId: id,
                details: { date: new Date().toISOString() },
                totalPrice: listing.price
            });
            alert('Booking Successful!');
            router.push('/my-bookings');
        } catch (err) {
            alert('Booking failed');
        }
    };

    if (loading) return <div className="container">Loading...</div>;
    if (!listing) return <div className="container">Listing not found</div>;

    return (
        <div className="container">
            <div className="card">
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px', height: '300px', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        IMAGE PLACEHOLDER
                    </div>
                    <div style={{ flex: 1.5, minWidth: '300px' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>{listing.type}</span>
                        <h1 style={{ marginTop: '0.5rem' }}>{listing.title}</h1>
                        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>{listing.location}</p>

                        <div style={{ margin: '2rem 0', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius)' }}>
                            <h3>Details</h3>
                            <p>{listing.description}</p>
                            {listing.type === 'hotel' && <p>Room Type: {listing.roomType}</p>}
                            {listing.type === 'cinema' && <p>Show Time: {listing.showTime}</p>}
                            {listing.type === 'space' && <p>Area: {listing.area} sq ft</p>}
                            {listing.type === 'vehicle' && <p>Capacity: {listing.capacity} persons</p>}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>${listing.price}</span>
                            <button onClick={handleBook} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
