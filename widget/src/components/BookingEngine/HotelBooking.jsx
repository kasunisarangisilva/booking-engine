import { useState } from 'react';

export default function HotelBooking({ listing, updateFormData, formData, availability }) {
    const today = new Date().toISOString().split('T')[0];
    const [selectedRoom, setSelectedRoom] = useState(formData.bookingDetails?.roomNumber || null);

    const label = {
        display: 'block', fontSize: 11, fontWeight: 800,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--w-text-muted)', marginBottom: 8,
    };

    const handleDateChange = (field, value) => {
        // Clear room selection when dates change
        setSelectedRoom(null);
        updateFormData({ bookingDetails: { ...formData.bookingDetails, [field]: value, roomNumber: null } });
    };

    const handleRoomSelect = (roomNum) => {
        const bookedRooms = availability?.bookedRooms || [];
        if (bookedRooms.includes(roomNum)) return; // can't select a booked room
        setSelectedRoom(roomNum);
        updateFormData({ bookingDetails: { ...formData.bookingDetails, roomNumber: roomNum } });
    };

    const checkIn = formData.bookingDetails?.checkIn;
    const checkOut = formData.bookingDetails?.checkOut;
    const datesSelected = checkIn && checkOut;
    const bookedRooms = availability?.bookedRooms || [];
    const totalRooms = availability?.totalRooms || listing.totalRooms || 5;

    const roomTypeIcons = { single: '🛏️', double: '🛏🛏', king: '👑', default: '🏨' };
    const roomIcon = roomTypeIcons[listing.roomType] || roomTypeIcons.default;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Date Selection */}
            <h3 style={{
                fontWeight: 800, fontSize: 15, color: 'var(--w-text)',
                paddingBottom: 12, borderBottom: '1px solid var(--w-border)',
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
                        value={checkIn || ''}
                        onChange={e => handleDateChange('checkIn', e.target.value)}
                    />
                </div>
                <div>
                    <label style={label}>Check-out</label>
                    <input
                        type="date"
                        min={checkIn || today}
                        className="w-input"
                        value={checkOut || ''}
                        onChange={e => handleDateChange('checkOut', e.target.value)}
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

            {/* Room Grid — only show after dates are selected */}
            {!datesSelected ? (
                <div style={{
                    padding: '28px 16px', textAlign: 'center',
                    background: 'var(--w-input-bg)',
                    borderRadius: 'var(--w-radius-sm)',
                    border: '1px dashed var(--w-border)',
                }}>
                    <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>🏨</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--w-text-muted)' }}>
                        Please select check-in & check-out dates to view available rooms
                    </span>
                </div>
            ) : (
                <>
                    <div>
                        <h3 style={{
                            fontWeight: 800, fontSize: 14, color: 'var(--w-text)',
                            paddingBottom: 10, borderBottom: '1px solid var(--w-border)',
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                            marginBottom: 14,
                        }}>
                            {roomIcon} Select a Room ({listing.roomType || 'Standard'})
                        </h3>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                            {[
                                { bg: 'var(--w-input-bg)', border: 'var(--w-border)', label: 'Available' },
                                { bg: 'var(--w-accent)', border: 'var(--w-accent)', label: 'Selected' },
                                { bg: '#ef444422', border: '#ef444455', label: 'Booked' },
                            ].map(l => (
                                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 16, height: 16, borderRadius: 4, background: l.bg, border: `2px solid ${l.border}` }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--w-text-muted)', letterSpacing: '0.1em' }}>
                                        {l.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Room Tiles Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                            gap: 10,
                        }}>
                            {Array.from({ length: totalRooms }, (_, i) => i + 1).map(roomNum => {
                                const isBooked = bookedRooms.includes(roomNum);
                                const isSelected = selectedRoom === roomNum;

                                return (
                                    <div
                                        key={roomNum}
                                        onClick={() => handleRoomSelect(roomNum)}
                                        title={isBooked ? `Room ${roomNum} — Booked` : `Room ${roomNum} — Available`}
                                        style={{
                                            padding: '12px 8px',
                                            borderRadius: 'var(--w-radius-sm)',
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
                                            {isBooked ? '🔒' : isSelected ? '✅' : roomIcon}
                                        </div>
                                        <div style={{
                                            fontSize: 11, fontWeight: 800,
                                            color: isSelected ? '#fff' : isBooked ? '#ef4444' : 'var(--w-text)',
                                            letterSpacing: '0.05em',
                                        }}>
                                            #{roomNum}
                                        </div>
                                        <div style={{
                                            fontSize: 9, fontWeight: 600,
                                            color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--w-text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                        }}>
                                            {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selection summary */}
                    {selectedRoom && (
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
                                    Room #{selectedRoom} — {listing.roomType || 'Standard'}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--w-text-muted)', fontWeight: 500 }}>
                                    {checkIn} → {checkOut}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
