import { useState } from 'react';

export default function CinemaBooking({ listing, updateFormData, formData }) {
    const [selectedSeats, setSelectedSeats] = useState(formData.bookingDetails.seats || []);

    const rows = listing.seatLayout?.rows || 8;
    const cols = listing.seatLayout?.cols || 10;

    const toggleSeat = (row, col) => {
        const seatId = `${String.fromCharCode(65 + row)}${col + 1}`;
        let newSeats;
        if (selectedSeats.includes(seatId)) {
            newSeats = selectedSeats.filter(s => s !== seatId);
        } else {
            newSeats = [...selectedSeats, seatId];
        }
        setSelectedSeats(newSeats);
        updateFormData({ bookingDetails: { ...formData.bookingDetails, seats: newSeats } });
    };

    return (
        <div className="space-y-4 md:space-y-6 text-center">
            <div className="w-full h-1.5 md:h-2 bg-slate-200 rounded-full shadow-inner mb-8 md:mb-12 relative">
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Screen Area</span>
            </div>

            <div className="cinema-grid gap-1 md:gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {Array.from({ length: rows }).map((_, r) => (
                    Array.from({ length: cols }).map((_, c) => {
                        const seatId = `${String.fromCharCode(65 + r)}${c + 1}`;
                        const isSelected = selectedSeats.includes(seatId);
                        return (
                            <div
                                key={seatId}
                                onClick={() => toggleSeat(r, c)}
                                className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-2 rounded-t-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-500 border-blue-600 shadow-lg shadow-blue-200 scale-110' : 'border-slate-100 hover:border-blue-300'
                                    }`}
                                title={seatId}
                            />
                        );
                    })
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 md:gap-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm border-2 border-slate-100" />
                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-blue-500" />
                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-slate-200" />
                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Booked</span>
                </div>
            </div>

            {selectedSeats.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-xl inline-block mt-4 border border-blue-100">
                    <p className="text-sm font-bold text-blue-600">Selected: {selectedSeats.join(', ')}</p>
                </div>
            )}
        </div>
    );
}
