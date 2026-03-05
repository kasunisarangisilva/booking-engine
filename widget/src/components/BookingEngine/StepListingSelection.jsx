import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from './ThemeContext';

const API_BASE = 'http://localhost:5000/api';

const TYPE_CONFIG = {
    hotel: { icon: '🏨', unit: 'Night' },
    hostel: { icon: '🏠', unit: 'Night' },
    cinema: { icon: '🎬', unit: 'Ticket' },
    vehicle: { icon: '🚗', unit: 'Day' },
    space: { icon: '🏢', unit: 'Hour' },
};

export default function StepListingSelection({ formData, updateFormData }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { isDark } = useTheme();

    const config = TYPE_CONFIG[formData.businessType] || { icon: '📋', unit: 'Session' };

    useEffect(() => {
        fetchListings();
    }, [formData.businessType]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/listings`);
            // Filter by selected business type
            const filtered = res.data.filter(l => l.type === formData.businessType);
            setListings(filtered);

            // Fetch with backend filtering by type and a high limit to ensure all listings are returned
            const res = await axios.get(`${API_BASE}/listings?type=${formData.businessType}&limit=100`);
            const allListings = res.data.listings || [];
            setListings(allListings);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = listings.filter(l =>
        l.title?.toLowerCase().includes(search.toLowerCase()) ||
        l.location?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            alignItems: 'start',
            width: '100%',
        }}>
            {/* Left */}
            <div>
                <div className="w-badge" style={{ marginBottom: 20 }}>Step 3 of 5</div>
                <h1 style={{
                    fontSize: 'clamp(32px, 4.5vw, 60px)',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.05,
                    color: 'var(--w-text)',
                    marginBottom: 16,
                }}>
                    Choose your<br />
                    <span style={{ color: 'var(--w-accent)' }}>
                        {config.icon} {formData.businessType}
                    </span>
                </h1>
                <p style={{
                    fontSize: 'clamp(14px, 1.5vw, 18px)',
                    color: 'var(--w-text-muted)',
                    fontWeight: 500,
                    lineHeight: 1.7,
                }}>
                    Browse our premium selection and pick the perfect option for your stay.
                </p>

                {/* Stats bar */}
                {!loading && (
                    <div className="w-glass-card" style={{ padding: '16px 20px', marginTop: 32, display: 'flex', gap: 24 }}>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--w-accent)' }}>{listings.length}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--w-text-muted)' }}>Available</div>
                        </div>
                        <div style={{ width: 1, background: 'var(--w-border)' }} />
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--w-text)' }}>
                                {listings.length > 0
                                    ? `$${Math.min(...listings.map(l => l.price || 0))}`
                                    : '—'}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--w-text-muted)' }}>From</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2 md:pr-4 custom-scrollbar w-full max-w-lg mx-auto lg:ml-auto">
                {listings.length === 0 ? (
                    <div className="p-10 md:p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="text-4xl md:text-5xl mb-4 text-slate-300">🔍</div>
                        <p className="text-lg md:text-xl font-bold text-slate-400">No {formData.businessType}s found matching your criteria.</p>
                    </div>
                ) : (
                    listings.map(l => {
                        const listingId = l._id || l.id;
                        const selectedId = formData.selectedListing?._id || formData.selectedListing?.id;
                        const isSelected = selectedId && listingId && selectedId === listingId;

                        return (
                            <div
                                key={listingId}
                                onClick={() => updateFormData({ selectedListing: l })}
                                className={`booking-option-card transform transition-all duration-300 p-5 md:p-6 ${isSelected ? 'selected scale-[1.02] bg-blue-50/50' : 'hover:scale-[1.01] hover:bg-slate-50'}`}
                            >
                                <div className="flex flex-col gap-1 md:gap-2">
                                    <span className={`text-xl md:text-2xl font-black ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{l.title}</span>
                                    <span className="text-sm md:text-base text-slate-500 flex items-center gap-1 font-semibold">📍 {l.location}</span>
                                </div>


                                <div className="text-right">
                                    <span className="block font-black text-2xl md:text-3xl text-blue-600">${l.price}</span>
                                    <span className="text-[10px] md:text-sm text-slate-400 uppercase font-black tracking-tighter">Per {formData.businessType === 'hotel' || formData.businessType === 'hostel' ? 'Night' : 'Session'}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
