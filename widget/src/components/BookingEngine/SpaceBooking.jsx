import { useState } from 'react';

export default function SpaceBooking({ listing, updateFormData, formData, availability }) {
    const today = new Date().toISOString().split('T')[0];
    const [selectedUnit, setSelectedUnit] = useState(formData.bookingDetails?.unitNumber || null);

    const label = {
        display: 'block', fontSize: 11, fontWeight: 800,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--w-text-muted)', marginBottom: 8,
    };

    const handleDateChange = (value) => {
        setSelectedUnit(null);
        updateFormData({ bookingDetails: { ...formData.bookingDetails, eventDate: value, unitNumber: null } });
    };

    const handleUnitSelect = (unitNum) => {
        const bookedUnits = availability?.bookedUnits || [];
        if (bookedUnits.includes(unitNum)) return;
        setSelectedUnit(unitNum);
        updateFormData({ bookingDetails: { ...formData.bookingDetails, unitNumber: unitNum } });
    };

    const eventDate = formData.bookingDetails?.eventDate;
    const bookedUnits = availability?.bookedUnits || [];
    const totalUnits = availability?.totalUnits || listing.totalUnits || 1;
    const maxGuests = listing.area ? Math.floor(listing.area / 10) : 100;

    const usageIcons = { event: '🎉', storage: '📦', office: '💼' };
    const unitIcon = usageIcons[listing.usageType] || '🏢';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{
                fontWeight: 800, fontSize: 15, color: 'var(--w-text)',
                paddingBottom: 12, borderBottom: '1px solid var(--w-border)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
                🏢 Event Details
            </h3>

            <div>
                <label style={label}>Event Date</label>
                <input type="date" min={today} className="w-input"
                    value={eventDate || ''}
                    onChange={e => handleDateChange(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                    <label style={label}>Start Time</label>
                    <input type="time" className="w-input"
                        onChange={e => updateFormData({ bookingDetails: { ...formData.bookingDetails, startTime: e.target.value } })} />
                </div>
                <div>
                    <label style={label}>End Time</label>
                    <input type="time" className="w-input"
                        onChange={e => updateFormData({ bookingDetails: { ...formData.bookingDetails, endTime: e.target.value } })} />
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ ...label, marginBottom: 0 }}>Expected Guests</label>
                    <span style={{ fontSize: 11, color: 'var(--w-text-muted)', fontWeight: 500 }}>Max {maxGuests}</span>
                </div>
                <input type="number" min="1" max={maxGuests} className="w-input"
                    placeholder={`e.g. ${Math.round(maxGuests / 2)}`}
                    onChange={e => updateFormData({ bookingDetails: { ...formData.bookingDetails, guests: e.target.value } })} />
            </div>

            <div>
                <label style={label}>Event Type</label>
                <select className="w-input" style={{ cursor: 'pointer', appearance: 'none' }}
                    onChange={e => updateFormData({ bookingDetails: { ...formData.bookingDetails, eventType: e.target.value } })}>
                    <option value="">Select type...</option>
                    <option value="conference">🏛️ Conference</option>
                    <option value="wedding">💒 Wedding</option>
                    <option value="workshop">🔧 Workshop</option>
                    <option value="birthday">🎂 Birthday</option>
                    <option value="corporate">💼 Corporate</option>
                </select>
            </div>

            {/* Unit/Section Grid */}
            {!eventDate ? (
                <div style={{
                    padding: '28px 16px', textAlign: 'center',
                    background: 'var(--w-input-bg)',
                    borderRadius: 'var(--w-radius-sm)',
                    border: '1px dashed var(--w-border)',
                }}>
                    <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>📅</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--w-text-muted)' }}>
                        Select an event date to view available sections
                    </span>
                </div>
            ) : (
                <>
                    <div>
                        <h3 style={{
                            fontWeight: 800, fontSize: 14, color: 'var(--w-text)',
                            paddingBottom: 10, borderBottom: '1px solid var(--w-border)',
                            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
                        }}>
                            {unitIcon} Select a Section / Unit
                        </h3>

                        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                            {[
                                { bg: 'var(--w-input-bg)', border: 'var(--w-border)', label: 'Available' },
                                { bg: 'var(--w-accent)', border: 'var(--w-accent)', label: 'Selected' },
                                { bg: '#ef444422', border: '#ef444455', label: 'Booked' },
                            ].map(l => (
                                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 14, height: 14, borderRadius: 3, background: l.bg, border: `2px solid ${l.border}` }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--w-text-muted)', letterSpacing: '0.08em' }}>
                                        {l.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                            gap: 10,
                        }}>
                            {Array.from({ length: totalUnits }, (_, i) => i + 1).map(unitNum => {
                                const isBooked = bookedUnits.includes(unitNum);
                                const isSelected = selectedUnit === unitNum;

                                return (
                                    <div
                                        key={unitNum}
                                        onClick={() => handleUnitSelect(unitNum)}
                                        title={isBooked ? `Section #${unitNum} — Booked` : `Section #${unitNum} — Available`}
                                        style={{
                                            padding: '12px 8px', borderRadius: 'var(--w-radius-sm)',
                                            border: `2px solid ${isSelected ? 'var(--w-accent)' : isBooked ? '#ef444455' : 'var(--w-border)'}`,
                                            background: isSelected ? 'var(--w-accent)' : isBooked ? '#ef444422' : 'var(--w-input-bg)',
                                            cursor: isBooked ? 'not-allowed' : 'pointer',
                                            opacity: isBooked ? 0.55 : 1,
                                            textAlign: 'center',
                                            transition: 'all var(--w-transition)',
                                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                            boxShadow: isSelected ? 'var(--w-shadow-accent)' : 'none',
                                        }}
                                    >
                                        <div style={{ fontSize: 18, marginBottom: 4 }}>
                                            {isBooked ? '🔒' : isSelected ? '✅' : unitIcon}
                                        </div>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: isSelected ? '#fff' : isBooked ? '#ef4444' : 'var(--w-text)', letterSpacing: '0.05em' }}>
                                            #{unitNum}
                                        </div>
                                        <div style={{ fontSize: 9, fontWeight: 600, color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--w-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Free'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {selectedUnit && (
                        <div style={{
                            padding: '14px 16px',
                            background: 'color-mix(in srgb, var(--w-accent) 8%, transparent)',
                            borderRadius: 'var(--w-radius-sm)',
                            border: '1px solid color-mix(in srgb, var(--w-accent) 20%, transparent)',
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            <span style={{ fontSize: 20 }}>✅</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--w-text)' }}>
                                    {unitIcon} Section #{selectedUnit} — {listing.usageType || 'Event Space'}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--w-text-muted)', fontWeight: 500 }}>
                                    Date: {eventDate}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
