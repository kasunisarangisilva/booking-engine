export default function HotelBooking({ listing, updateFormData, formData }) {
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Select Dates</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase">Check-in</label>
                    <input
                        type="date"
                        min={today}
                        className="w-full text-lg"
                        onChange={(e) => updateFormData({ bookingDetails: { ...formData.bookingDetails, checkIn: e.target.value } })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase">Check-out</label>
                    <input
                        type="date"
                        min={formData.bookingDetails.checkIn || today}
                        className="w-full text-lg"
                        onChange={(e) => updateFormData({ bookingDetails: { ...formData.bookingDetails, checkOut: e.target.value } })}
                    />
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-blue-800 font-medium flex items-center gap-2">
                    <span>ℹ️</span> {listing.roomType} room available for selected dates.
                </p>
            </div>
        </div>
    );
}
