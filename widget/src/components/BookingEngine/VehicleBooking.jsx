import { useState } from 'react';

export default function VehicleBooking({ listing, updateFormData, formData, availability }) {
    const today = new Date().toISOString().split('T')[0];
    const [selectedUnit, setSelectedUnit] = useState(formData.bookingDetails?.unitNumber || null);

    const label = {
        display: 'block', fontSize: 11, fontWeight: 800,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--w-text-muted)', marginBottom: 8,
    };

    const handleDateChange = (field, value) => {
        setSelectedUnit(null);
        updateFormData({ bookingDetails: { ...formData.bookingDetails, [field]: value, unitNumber: null } });
    };

    const handleUnitSelect = (unitNum) => {
        const bookedUnits = availability?.bookedUnits || [];
        if (bookedUnits.includes(unitNum)) return;
        setSelectedUnit(unitNum);
        updateFormData({ bookingDetails: { ...formData.bookingDetails, unitNumber: unitNum } });
    };

    const pickupDate = formData.bookingDetails?.pickupDate;
    const returnDate = formData.bookingDetails?.returnDate;
    const bookedUnits = availability?.bookedUnits || [];
    const totalUnits = availability?.totalUnits || listing.totalUnits || 1;

    // Dates taken overall (for calendar hint)
    const takenDates = (availability?.takenDates || []).map(d => d.start).filter(Boolean);

    const vehicleIcons = { car: '🚗', van: '🚐', bus: '🚌' };
    const vehicleIcon = vehicleIcons[listing.vehicleType] || '🚗';
    const vehicleLabels = { car: 'Car', van: 'Van', bus: 'Bus' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{
                fontWeight: 800, fontSize: 15, color: 'var(--w-text)',
                paddingBottom: 12, borderBottom: '1px solid var(--w-border)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
                🚗 Rental Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                    <label style={label}>Pickup Date</label>
                    <input type="date" min={today} className="w-input"
                        value={pickupDate || ''}
                        onChange={e => handleDateChange('pickupDate', e.target.value)} />
                </div>
                <div>
                    <label style={label}>Pickup Time</label>
                    <input type="time" className="w-input"
                        onChange={e => updateFormData({ bookingDetails: { ...formData.bookingDetails, pickupTime: e.target.value } })} />
                </div>
                <div>
                    <label style={label}>Return Date</label>
                    <input type="date" min={pickupDate || today} className="w-input"
                        value={returnDate || ''}
                        onChange={e => updateFormData({ bookingDetails: { ...formData.bookingDetails, returnDate: e.target.value } })} />
                </div>
                <div>
                    <label style={label}>Return Time</label>
                    <input type="time" className="w-input"
                        onChange={e => updateFormData({ bookingDetails: { ...formData.bookingDetails, returnTime: e.target.value } })} />
                </div>
            </div>

            <div>
                <label style={label}>Driver License Number</label>
                <input type="text" className="w-input" placeholder="e.g. DL-123456"
                    onChange={e => updateFormData({ bookingDetails: { ...formData.bookingDetails, licenseNumber: e.target.value } })} />
            </div>

            {/* Unit Grid */}
            {!pickupDate ? (
                <div style={{
                    padding: '28px 16px', textAlign: 'center',
                    background: 'var(--w-input-bg)',
                    borderRadius: 'var(--w-radius-sm)',
                    border: '1px dashed var(--w-border)',
                }}>
                    <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{vehicleIcon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--w-text-muted)' }}>
                        Select a pickup date to view available {vehicleLabels[listing.vehicleType] || 'vehicle'}s
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
                            {vehicleIcon} Select a {vehicleLabels[listing.vehicleType] || 'Vehicle'} Unit
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
                                        title={isBooked ? `Unit #${unitNum} — Booked` : `Unit #${unitNum} — Available`}
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
                                            {isBooked ? '🔒' : isSelected ? '✅' : vehicleIcon}
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
                                    {vehicleIcon} Unit #{selectedUnit} — {listing.vehicleType || 'Vehicle'}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--w-text-muted)', fontWeight: 500 }}>
                                    Pickup: {pickupDate}{returnDate ? ` → ${returnDate}` : ''}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
