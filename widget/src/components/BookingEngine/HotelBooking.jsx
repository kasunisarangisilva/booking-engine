export default function HotelBooking({ listing, updateFormData, formData }) {
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-black text-slate-800 border-b pb-3 uppercase tracking-tight">Select Dates</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Check-in</label>
                    <input
                        type="date"
                        min={today}
                        className="w-full text-base md:text-lg p-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all rounded-2xl"
                        onChange={(e) => updateFormData({ bookingDetails: { ...formData.bookingDetails, checkIn: e.target.value } })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Check-out</label>
                    <input
                        type="date"
                        min={formData.bookingDetails.checkIn || today}
                        className="w-full text-base md:text-lg p-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all rounded-2xl"
                        onChange={(e) => updateFormData({ bookingDetails: { ...formData.bookingDetails, checkOut: e.target.value } })}
                    />
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-blue-800 font-bold text-sm md:text-base flex items-center gap-3">
                    <span className="text-xl">ℹ️</span> {listing.roomType} room available for selected dates.
                </p>
            </div>
        </div>
    );
}
