export default function SpaceBooking({ listing, updateFormData, formData }) {
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
            <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Event Schedule</h3>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase">Event Date</label>
                    <input
                        type="date"
                        min={today}
                        className="w-full text-lg"
                        onChange={(e) => handleChange('eventDate', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase">Start Time</label>
                        <input
                            type="time"
                            className="w-full text-lg"
                            onChange={(e) => handleChange('startTime', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase">End Time</label>
                        <input
                            type="time"
                            className="w-full text-lg"
                            onChange={(e) => handleChange('endTime', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase">Expected Guests</label>
                    <input
                        type="number"
                        placeholder="e.g. 50"
                        className="w-full text-lg"
                        onChange={(e) => handleChange('guests', e.target.value)}
                    />
                    <p className="text-xs text-slate-400">Maximum capacity: {listing.area / 10} guests</p>
                </div>
            </div>
        </div>
    );
}
