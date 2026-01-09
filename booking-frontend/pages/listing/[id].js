import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';

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

    if (loading) return (
        <>
            <Navbar />
            <div className="container py-24 text-center">
                <p className="text-xl animate-pulse text-secondary">Loading listing details...</p>
            </div>
        </>
    );

    if (!listing) return (
        <>
            <Navbar />
            <div className="container py-24 text-center">
                <h2 className="text-2xl font-bold">Listing not found</h2>
                <button onClick={() => router.push('/')} className="btn btn-primary mt-4">Return Home</button>
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <main className="container py-8 md:py-12">
                <div className="card overflow-hidden !p-0">
                    <div className="flex flex-col lg:flex-row min-h-[500px]">
                        {/* Image Placeholder */}
                        <div className="lg:w-1/2 bg-slate-100 flex items-center justify-center min-h-[300px] lg:min-h-full text-slate-400 font-bold text-2xl uppercase">
                            {listing.type} Image
                        </div>

                        {/* Content */}
                        <div className="lg:w-1/2 p-6 md:p-10 flex flex-col justify-between bg-white">
                            <div>
                                <span className="text-xs md:text-sm font-bold text-primary uppercase tracking-widest">{listing.type}</span>
                                <h1 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4 text-text">{listing.title}</h1>
                                <p className="text-lg text-text-light flex items-center gap-2 mb-8">
                                    <span className="text-gray-400">📍</span> {listing.location}
                                </p>

                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-3">About this service</h3>
                                        <p className="text-base text-text leading-relaxed">
                                            {listing.description || 'Experience the best of our services with high-quality standards and professional staff dedicated to making your stay or event memorable.'}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200/60">
                                            {listing.type === 'hotel' && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 uppercase">Room Type</span>
                                                    <span className="font-semibold capitalize">{listing.roomType}</span>
                                                </div>
                                            )}
                                            {listing.type === 'cinema' && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 uppercase">Show Time</span>
                                                    <span className="font-semibold">{listing.showTime || '7:00 PM'}</span>
                                                </div>
                                            )}
                                            {listing.type === 'space' && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 uppercase">Capacity</span>
                                                    <span className="font-semibold">{listing.area} sq ft</span>
                                                </div>
                                            )}
                                            {listing.type === 'vehicle' && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 uppercase">Fuel Type</span>
                                                    <span className="font-semibold capitalize">{listing.vehicleType || 'Petrol'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase">Price per unit</span>
                                    <span className="text-3xl md:text-4xl font-black text-primary">${listing.price}</span>
                                </div>
                                <button
                                    onClick={handleBook}
                                    className="btn btn-primary w-full sm:w-auto px-10 py-4 text-lg font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
