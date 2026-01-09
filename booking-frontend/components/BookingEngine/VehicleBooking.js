export default function VehicleBooking({ listing, updateFormData, formData }) {
    const today = new Date().toISOString().split('T')[0];

    const handleChange = (field, value) => {
        updateFormData({
            bookingDetails: {
                ...formData.bookingDetails,
                [field]: value
            }
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Rental Timing</h3>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase">Pickup Date</label>
                        <input
                            type="date"
                            min={today}
                            className="w-full text-lg"
                            onChange={(e) => handleChange('pickupDate', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase">Time</label>
                        <input
                            type="time"
                            className="w-full text-lg"
                            onChange={(e) => handleChange('pickupTime', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase">Return Date</label>
                        <input
                            type="date"
                            min={formData.bookingDetails.pickupDate || today}
                            className="w-full text-lg"
                            onChange={(e) => handleChange('returnDate', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase">Time</label>
                        <input
                            type="time"
                            className="w-full text-lg"
                            onChange={(e) => handleChange('returnTime', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-6">
                <p className="text-amber-800 text-sm font-medium">
                    Note: Minimum rental duration is 24 hours. Insurance included in base price.
                </p>
            </div>
        </div>
    );
}
