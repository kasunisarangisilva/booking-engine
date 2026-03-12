import { useState } from 'react';

export default function CinemaBooking({ listing, updateFormData, formData, availability }) {
    const [selectedSeats, setSelectedSeats] = useState(formData.bookingDetails?.seats || []);

    const rows = listing.seatLayout?.rows || 7;
    const cols = listing.seatLayout?.cols || 10;
    const today = new Date().toISOString().split('T')[0];

    const toggleSeat = (row, col) => {
        const seatId = `${String.fromCharCode(65 + row)}${col + 1}`;
        const newSeats = selectedSeats.includes(seatId)
            ? selectedSeats.filter(s => s !== seatId)
            : [...selectedSeats, seatId];
        setSelectedSeats(newSeats);
        updateFormData({ bookingDetails: { ...formData.bookingDetails, seats: newSeats } });
    };

    const handleDateChange = (date) => {
        setSelectedSeats([]);
        updateFormData({ 
            bookingDetails: { 
                ...formData.bookingDetails, 
                date,
                seats: [] 
            } 
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Date Selection */}
            <div>
                <label style={{
                    display: 'block', fontSize: 11, fontWeight: 800,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--w-text-muted)', marginBottom: 8,
                }}>
                    Select Show Date
                </label>
                <input
                    type="date"
                    min={today}
                    className="w-input"
                    value={formData.bookingDetails?.date || ''}
                    onChange={(e) => handleDateChange(e.target.value)}
                />
            </div>

            {!formData.bookingDetails?.date ? (
                <div style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    background: 'var(--w-input-bg)',
                    borderRadius: 'var(--w-radius-sm)',
                    border: '1px dashed var(--w-border)',
                }}>
                    <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>📅</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--w-text-muted)' }}>
                        Please select a date to view available seats
                    </span>
                </div>
            ) : (
                <>
                    {/* Screen indicator */}
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <div style={{
                    height: 4, borderRadius: 999,
                    background: 'var(--w-accent)',
                    opacity: 0.4, marginBottom: 8,
                    boxShadow: '0 4px 24px var(--w-accent)',
                }} />
                <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: 'var(--w-text-muted)',
                }}>
                    Screen
                </span>
            </div>

            {/* Seat grid */}
            <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
                <div style={{
                    display: 'inline-grid',
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: 6,
                    margin: '0 auto',
                    minWidth: 'max-content',
                }}>
                    {Array.from({ length: rows }).map((_, r) =>
                        Array.from({ length: cols }).map((_, c) => {
                            const seatId = `${String.fromCharCode(65 + r)}${c + 1}`;
                            const isSelected = selectedSeats.includes(seatId);
                            const isTaken = availability?.takenSeats?.includes(seatId);
                            
                            return (
                                <div
                                    key={seatId}
                                    title={isTaken ? `${seatId} (Taken)` : seatId}
                                    onClick={() => !isTaken && toggleSeat(r, c)}
                                    style={{
                                        width: 30, height: 28,
                                        borderRadius: '6px 6px 0 0',
                                        border: `2px solid ${isTaken ? 'var(--w-border)' : isSelected ? 'var(--w-accent)' : 'var(--w-border)'}`,
                                        background: isTaken ? 'var(--w-border)' : isSelected ? 'var(--w-accent)' : 'var(--w-input-bg)',
                                        cursor: isTaken ? 'not-allowed' : 'pointer',
                                        opacity: isTaken ? 0.3 : 1,
                                        transition: 'all var(--w-transition)',
                                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                                        boxShadow: isSelected ? 'var(--w-shadow-accent)' : 'none',
                                    }}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, paddingTop: 12, borderTop: '1px solid var(--w-border)' }}>
                {[
                    { color: 'var(--w-input-bg)', border: 'var(--w-border)', label: 'Available' },
                    { color: 'var(--w-accent)', border: 'var(--w-accent)', label: 'Selected' },
                    { color: 'var(--w-border)', border: 'var(--w-border)', label: 'Taken' },
                ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                            width: 14, height: 12, borderRadius: '3px 3px 0 0',
                            background: l.color, border: `2px solid ${l.border}`,
                        }} />
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--w-text-muted)', letterSpacing: '0.1em' }}>
                            {l.label}
                        </span>
                    </div>
                ))}
            </div>

            {selectedSeats.length > 0 && (
                <div style={{
                    padding: '12px 16px',
                    background: 'color-mix(in srgb, var(--w-accent) 8%, transparent)',
                    borderRadius: 'var(--w-radius-sm)',
                    border: '1px solid color-mix(in srgb, var(--w-accent) 20%, transparent)',
                }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--w-accent)' }}>
                        🎟️ {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected: {selectedSeats.join(', ')}
                    </span>
                </div>
            )}
                </>
            )}
        </div>
    );
}
