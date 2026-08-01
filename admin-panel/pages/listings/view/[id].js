import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../components/AdminLayout';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export default function ViewListing() {
    const router = useRouter();
    const { id } = router.query;
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [listing, setListing] = useState(null);

    useEffect(() => {
        if (id) {
            fetchListingDetails();
        }
    }, [id]);

    const fetchListingDetails = async () => {
        try {
            const res = await axios.get(`${API_BASE}/listings/${id}`);
            setListing(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching listing:', err);
            toast.error('Failed to load listing details');
            router.push('/listings');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="card p-8 shadow-xl border border-border text-center">Loading...</div>
            </AdminLayout>
        );
    }

    if (!listing) return null;

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">View Listing</h1>
                        <p className="text-secondary mt-2 text-lg font-medium">Details for {listing.title}</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href={`/listings/edit/${listing._id}`} className="px-6 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded-xl transition-colors">
                            Edit
                        </Link>
                        <button onClick={() => router.back()} className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl transition-colors">
                            Back
                        </button>
                    </div>
                </header>

                <div className="card p-8 shadow-xl border border-border space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Service Title</h3>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{listing.title}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Service Category</h3>
                            <p className="text-xl font-bold text-slate-900 dark:text-white capitalize px-3 py-1 text-blue-600 rounded inline-block">
                                {listing.type}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Description</h3>
                            <p className="text-lg text-slate-700 dark:text-slate-300">{listing.description}</p>
                        </div>
                    </div>

                    {/* Category Specific Details */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6 underline underline-offset-8">Category Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                            {listing.details?.roomType && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Room Type</h4>
                                    <p className="font-bold text-slate-900 dark:text-white capitalize">{listing.details.roomType}</p>
                                </div>
                            )}
                            {listing.details?.totalRooms && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Total Rooms</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{listing.details.totalRooms}</p>
                                </div>
                            )}
                            {listing.details?.amenities?.length > 0 && (
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Amenities</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{listing.details.amenities.join(', ')}</p>
                                </div>
                            )}
                            {listing.details?.movieTitle && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Movie Title</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{listing.details.movieTitle}</p>
                                </div>
                            )}
                            {listing.details?.showTime && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Show Time</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{new Date(listing.details.showTime).toLocaleString()}</p>
                                </div>
                            )}
                            {listing.details?.seatLayout && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Seating</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{listing.details.seatLayout.rows} Rows x {listing.details.seatLayout.cols} Cols</p>
                                </div>
                            )}
                            {listing.details?.area && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Area</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{listing.details.area} sq ft</p>
                                </div>
                            )}
                            {listing.details?.usageType && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Usage Type</h4>
                                    <p className="font-bold text-slate-900 dark:text-white capitalize">{listing.details.usageType}</p>
                                </div>
                            )}
                            {listing.details?.vehicleType && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Vehicle Type</h4>
                                    <p className="font-bold text-slate-900 dark:text-white capitalize">{listing.details.vehicleType}</p>
                                </div>
                            )}
                            {listing.details?.capacity && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Capacity</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{listing.details.capacity} Persons</p>
                                </div>
                            )}
                            {listing.details?.totalUnits && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Total Units</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{listing.details.totalUnits}</p>
                                </div>
                            )}
                            {listing.details?.features?.length > 0 && (
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Features</h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{listing.details.features.join(', ')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Price and Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Price</h3>
                            <p className="text-2xl font-black text-green-600">${listing.price}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Location</h3>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{listing.location}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .card {
                    border-radius: 2rem;
                }
                .text-secondary {
                    color: #64748b;
                }
                :global(.dark) .text-secondary {
                    color: #94a3b8;
                }
            `}</style>
        </AdminLayout>
    );
}
