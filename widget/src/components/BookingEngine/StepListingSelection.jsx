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
<<<<<<< Updated upstream
            const res = await axios.get(`${API_BASE}/listings`);
            // Filter by selected business type
            const filtered = res.data.filter(l => l.type === formData.businessType);
            setListings(filtered);
=======
            const res = await axios.get(`${API_BASE}/listings?type=${formData.businessType}&limit=100`);
            setListings(res.data.listings || []);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
            <div className="space-y-4 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2 md:pr-4 custom-scrollbar w-full max-w-lg mx-auto lg:ml-auto">
                {listings.length === 0 ? (
                    <div className="p-10 md:p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="text-4xl md:text-5xl mb-4 text-slate-300">🔍</div>
                        <p className="text-lg md:text-xl font-bold text-slate-400">No {formData.businessType}s found matching your criteria.</p>
                    </div>
                ) : (
                    listings.map(l => (
                        <div
                            key={l.id}
                            onClick={() => updateFormData({ selectedListing: l })}
                            className={`booking-option-card transform transition-all duration-300 p-5 md:p-6 ${formData.selectedListing?.id === l.id ? 'selected scale-[1.02] bg-blue-50/50' : 'hover:scale-[1.01] hover:bg-slate-50'}`}
                        >
                            <div className="flex flex-col gap-1 md:gap-2">
                                <span className={`text-xl md:text-2xl font-black ${formData.selectedListing?.id === l.id ? 'text-blue-900' : 'text-slate-800'}`}>{l.title}</span>
                                <span className="text-sm md:text-base text-slate-500 flex items-center gap-1 font-semibold">📍 {l.location}</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-2xl md:text-3xl text-blue-600">${l.price}</span>
                                <span className="text-[10px] md:text-sm text-slate-400 uppercase font-black tracking-tighter">Per {formData.businessType === 'hotel' || formData.businessType === 'hostel' ? 'Night' : 'Session'}</span>
                            </div>
                        </div>
                    ))
                )}
=======
            {/* Right — listings */}
            <div>
                {/* Search */}
                <div style={{ position: 'relative', marginBottom: 16 }}>
                    <span style={{
                        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 16, color: 'var(--w-text-muted)',
                    }}>🔍</span>
                    <input
                        className="w-input"
                        style={{ paddingLeft: 44 }}
                        placeholder={`Search ${formData.businessType}s…`}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div
                    className="w-scrollbar"
                    style={{ maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                border: '3px solid var(--w-border)',
                                borderTopColor: 'var(--w-accent)',
                                animation: 'w-spin 0.8s linear infinite',
                                margin: '0 auto 16px',
                            }} />
                            <p style={{ color: 'var(--w-text-muted)', fontWeight: 600, fontSize: 15 }}>
                                Finding {formData.businessType}s…
                            </p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '48px 24px',
                            background: 'var(--w-card-bg)',
                            borderRadius: 'var(--w-radius)',
                            border: '2px dashed var(--w-border)',
                        }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                            <p style={{ color: 'var(--w-text-muted)', fontWeight: 600 }}>
                                {search ? 'No results found' : `No ${formData.businessType}s available`}
                            </p>
                        </div>
                    ) : filtered.map(l => {
                        const listingId = l._id || l.id;
                        const selectedId = formData.selectedListing?._id || formData.selectedListing?.id;
                        const isSelected = selectedId && listingId && selectedId === listingId;

                        return (
                            <div
                                key={listingId}
                                className={`w-option-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => updateFormData({ selectedListing: l })}
                                style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px 20px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: 12 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: 800, fontSize: 16,
                                            color: isSelected ? 'var(--w-accent)' : 'var(--w-text)',
                                            marginBottom: 4,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {l.title}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--w-text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            📍 {l.location}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontWeight: 900, fontSize: 20, color: 'var(--w-accent)' }}>
                                            ${l.price}
                                        </div>
                                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--w-text-muted)' }}>
                                            per {config.unit}
                                        </div>
                                    </div>
                                </div>

                                {/* Features row */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                                    {isSelected && (
                                        <span className="w-badge">✓ Selected</span>
                                    )}
                                    {l.rating && (
                                        <span style={{
                                            fontSize: 11, fontWeight: 600,
                                            color: 'var(--w-text-muted)',
                                            display: 'flex', alignItems: 'center', gap: 3,
                                        }}>
                                            ⭐ {l.rating}
                                        </span>
                                    )}
                                    {l.amenities?.slice(0, 2).map(a => (
                                        <span key={a} style={{
                                            fontSize: 10, padding: '2px 8px',
                                            background: 'var(--w-input-bg)',
                                            color: 'var(--w-text-muted)',
                                            borderRadius: 999,
                                            border: '1px solid var(--w-border)',
                                            fontWeight: 600,
                                        }}>{a}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
>>>>>>> Stashed changes
            </div>
        </div>
    );
}
