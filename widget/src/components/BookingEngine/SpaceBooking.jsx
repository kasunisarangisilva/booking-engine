export default function SpaceBooking({ listing, updateFormData, formData }) {
    const today = new Date().toISOString().split('T')[0];

    const handleChange = (field, value) => {
        updateFormData({ bookingDetails: { ...formData.bookingDetails, [field]: value } });
    };

    const label = {
        display: 'block', fontSize: 11, fontWeight: 800,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--w-text-muted)', marginBottom: 8,
    };

    const maxGuests = listing.area ? Math.floor(listing.area / 10) : 100;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{
                fontWeight: 800, fontSize: 15,
                color: 'var(--w-text)',
                paddingBottom: 12,
                borderBottom: '1px solid var(--w-border)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
                🏢 Event Schedule
            </h3>

            <div>
                <label style={label}>Event Date</label>
                <input type="date" min={today} className="w-input"
                    onChange={e => handleChange('eventDate', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                    <label style={label}>Start Time</label>
                    <input type="time" className="w-input"
                        onChange={e => handleChange('startTime', e.target.value)} />
                </div>
                <div>
                    <label style={label}>End Time</label>
                    <input type="time" className="w-input"
                        onChange={e => handleChange('endTime', e.target.value)} />
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ ...label, marginBottom: 0 }}>Expected Guests</label>
                    <span style={{ fontSize: 11, color: 'var(--w-text-muted)', fontWeight: 500 }}>
                        Max {maxGuests}
                    </span>
                </div>
                <input type="number" min="1" max={maxGuests} className="w-input"
                    placeholder={`e.g. ${Math.round(maxGuests / 2)}`}
                    onChange={e => handleChange('guests', e.target.value)} />
            </div>

            <div>
                <label style={label}>Event Type</label>
                <select className="w-input" style={{ cursor: 'pointer', appearance: 'none' }}
                    onChange={e => handleChange('eventType', e.target.value)}>
                    <option value="">Select type...</option>
                    <option value="conference">🏛️ Conference</option>
                    <option value="wedding">💒 Wedding</option>
                    <option value="workshop">🔧 Workshop</option>
                    <option value="birthday">🎂 Birthday</option>
                    <option value="corporate">💼 Corporate</option>
                </select>
            </div>
        </div>
    );
}
