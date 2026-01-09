import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function StepListingSelection({ formData, updateFormData }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, [formData.businessType]);

    const fetchListings = async () => {
        try {
            const res = await axios.get(`${API_BASE}/listings`);
            // Filter by selected business type
            const filtered = res.data.filter(l => l.type === formData.businessType);
            setListings(filtered);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-12 text-2xl animate-pulse">Finding available {formData.businessType}s...</div>;

    return (
        <div className="booking-step-content">
            <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
                    Select <span className="text-blue-500 uppercase">{formData.businessType}</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Choose one of our premium options to experience top-tier service.
                </p>
            </div>

            <div className="space-y-4 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar w-full">
                {listings.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-lg text-slate-500">No {formData.businessType}s found matching your criteria.</p>
                    </div>
                ) : (
                    listings.map(l => (
                        <div
                            key={l.id}
                            onClick={() => updateFormData({ selectedListing: l })}
                            className={`booking-option-card ${formData.selectedListing?.id === l.id ? 'selected bg-blue-50' : ''}`}
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-lg text-slate-700">{l.title}</span>
                                <span className="text-sm text-slate-500 flex items-center gap-1">📍 {l.location}</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-xl text-blue-600">${l.price}</span>
                                <span className="text-xs text-slate-400 uppercase font-bold">per night/unit</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
