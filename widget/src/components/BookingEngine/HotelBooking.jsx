export default function HotelBooking({ listing, updateFormData, formData }) {
    const today = new Date().toISOString().split('T')[0];

    const label = {
        display: 'block', fontSize: 11, fontWeight: 800,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--w-text-muted)', marginBottom: 8,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{
                fontWeight: 800, fontSize: 15,
                color: 'var(--w-text)',
                paddingBottom: 12,
                borderBottom: '1px solid var(--w-border)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
                📅 Select Dates
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                    <label style={label}>Check-in</label>
                    <input
                        type="date"
                        min={today}
                        className="w-input"
                        onChange={e => updateFormData({ bookingDetails: { ...formData.bookingDetails, checkIn: e.target.value } })}
                    />
                </div>
                <div>
                    <label style={label}>Check-out</label>
                    <input
                        type="date"
                        min={formData.bookingDetails?.checkIn || today}
                        className="w-input"
                        onChange={e => updateFormData({ bookingDetails: { ...formData.bookingDetails, checkOut: e.target.value } })}
                    />
                </div>
            </div>

            <div>
                <label style={label}>Guests</label>
                <select
                    className="w-input"
                    style={{ cursor: 'pointer', appearance: 'none' }}
                    value={formData.bookingDetails?.guests || '2'}
                    onChange={e => updateFormData({ bookingDetails: { ...formData.bookingDetails, guests: e.target.value } })}
                >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                    ))}
                </select>
            </div>

            {formData.bookingDetails?.checkIn && formData.bookingDetails?.checkOut && (
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
                            {listing.roomType || 'Standard'} room available
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--w-text-muted)', fontWeight: 500 }}>
                            {formData.bookingDetails.checkIn} → {formData.bookingDetails.checkOut}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
