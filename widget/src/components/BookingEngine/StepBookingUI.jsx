import HotelBooking from './HotelBooking';
import CinemaBooking from './CinemaBooking';
import VehicleBooking from './VehicleBooking';
import SpaceBooking from './SpaceBooking';
import { useTheme } from './ThemeContext';

export default function StepBookingUI({ formData, updateFormData }) {
    const { isDark } = useTheme();
    const { businessType, selectedListing } = formData;

    if (!selectedListing) {
        return (
            <div style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ef4444', marginBottom: 8 }}>
                    No listing selected
                </h2>
                <p style={{ color: 'var(--w-text-muted)', fontWeight: 500 }}>Please go back and choose a listing first.</p>
            </div>
        );
    }

    const renderUI = () => {
        switch (businessType) {
            case 'hotel': return <HotelBooking listing={selectedListing} updateFormData={updateFormData} formData={formData} />;
            case 'hostel': return <HotelBooking listing={selectedListing} updateFormData={updateFormData} formData={formData} />;
            case 'cinema': return <CinemaBooking listing={selectedListing} updateFormData={updateFormData} formData={formData} />;
            case 'vehicle': return <VehicleBooking listing={selectedListing} updateFormData={updateFormData} formData={formData} />;
            case 'space': return <SpaceBooking listing={selectedListing} updateFormData={updateFormData} formData={formData} />;
            default: return (
                <div style={{ padding: '32px 0', color: 'var(--w-text-muted)', fontWeight: 500 }}>
                    Standard booking form for {businessType}.
                </div>
            );
        }
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            alignItems: 'start',
            width: '100%',
        }}>
            {/* Left — listing info + headline */}
            <div>
                <div className="w-badge" style={{ marginBottom: 20 }}>Step 4 of 5</div>
                <h1 style={{
                    fontSize: 'clamp(28px, 4vw, 52px)',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: 'var(--w-text)',
                    lineHeight: 1.1,
                    marginBottom: 16,
                }}>
                    Book <span style={{ color: 'var(--w-accent)' }}>{selectedListing.title}</span>
                </h1>
                <p style={{
                    fontSize: 'clamp(14px, 1.5vw, 18px)',
                    color: 'var(--w-text-muted)',
                    fontWeight: 500,
                    lineHeight: 1.7,
                    marginBottom: 28,
                }}>
                    Finalize your dates and preferences. Check availability before confirming.
                </p>

                {/* Listing summary card */}
                <div className="w-glass-card" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--w-text)', marginBottom: 4 }}>
                                {selectedListing.title}
                            </div>
                            {selectedListing.location && (
                                <div style={{ fontSize: 12, color: 'var(--w-text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    📍 {selectedListing.location}
                                </div>
                            )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, fontSize: 20, color: 'var(--w-accent)' }}>
                                ${selectedListing.price}
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--w-text-muted)' }}>
                                per unit
                            </div>
                        </div>
                    </div>

                    {selectedListing.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <div style={{ display: 'flex', gap: 2 }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} style={{ color: i < Math.round(selectedListing.rating) ? '#f59e0b' : 'var(--w-border)', fontSize: 14 }}>★</span>
                                ))}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--w-text)' }}>{selectedListing.rating}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right — booking form */}
            <div className="w-glass-card" style={{ padding: '28px 24px' }}>
                {renderUI()}
            </div>
        </div>
    );
}
