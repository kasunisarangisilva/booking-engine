export default function VehicleBooking({ listing, updateFormData, formData }) {
    const today = new Date().toISOString().split('T')[0];

    const handleChange = (field, value) => {
        updateFormData({ bookingDetails: { ...formData.bookingDetails, [field]: value } });
    };

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
                🚗 Rental Timing
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                    <label style={label}>Pickup Date</label>
                    <input type="date" min={today} className="w-input"
                        onChange={e => handleChange('pickupDate', e.target.value)} />
                </div>
                <div>
                    <label style={label}>Pickup Time</label>
                    <input type="time" className="w-input"
                        onChange={e => handleChange('pickupTime', e.target.value)} />
                </div>
                <div>
                    <label style={label}>Return Date</label>
                    <input type="date" min={formData.bookingDetails?.pickupDate || today} className="w-input"
                        onChange={e => handleChange('returnDate', e.target.value)} />
                </div>
                <div>
                    <label style={label}>Return Time</label>
                    <input type="time" className="w-input"
                        onChange={e => handleChange('returnTime', e.target.value)} />
                </div>
            </div>

            <div>
                <label style={label}>Driver License Number</label>
                <input type="text" className="w-input" placeholder="e.g. DL-123456"
                    onChange={e => handleChange('licenseNumber', e.target.value)} />
            </div>

            <div style={{
                padding: '12px 16px',
                background: 'color-mix(in srgb, #f59e0b 10%, transparent)',
                borderRadius: 'var(--w-radius-sm)',
                border: '1px solid color-mix(in srgb, #f59e0b 25%, transparent)',
                display: 'flex', alignItems: 'center', gap: 10,
            }}>
                <span style={{ fontSize: 18 }}>ℹ️</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--w-text)', margin: 0 }}>
                    Minimum rental 24 hours. Insurance included in base price.
                </p>
            </div>
        </div>
    );
}
