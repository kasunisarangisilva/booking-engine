import HotelBooking from './HotelBooking';
import CinemaBooking from './CinemaBooking';
import VehicleBooking from './VehicleBooking';
import SpaceBooking from './SpaceBooking';

export default function StepBookingUI({ formData, updateFormData }) {
    const { businessType, selectedListing } = formData;

    if (!selectedListing) {
        return (
            <div className="text-center p-12">
                <h2 className="text-2xl font-bold text-red-500">Please go back and select a listing first!</h2>
            </div>
        );
    }

    const renderSpecializedUI = () => {
        switch (businessType) {
            case 'hotel':
                return <HotelBooking listing={selectedListing} updateFormData={updateFormData} formData={formData} />;
            case 'cinema':
                return <CinemaBooking listing={selectedListing} updateFormData={updateFormData} formData={formData} />;
            case 'vehicle':
                return <VehicleBooking listing={selectedListing} updateFormData={updateFormData} formData={formData} />;
            case 'space':
                return <SpaceBooking listing={selectedListing} updateFormData={updateFormData} formData={formData} />;
            default:
                return <div className="p-8 text-center text-xl">Standard booking UI for {businessType}</div>;
        }
    };

    return (
        <div className="booking-step-content">
            <div>
                <h1 className="text-5xl font-extrabold mb-4 flex items-center gap-4">
                    Book <span className="text-4xl text-blue-500 uppercase">{selectedListing.title}</span>
                </h1>
                <p className="text-2xl text-slate-600 font-medium leading-relaxed">
                    Finalize your details and confirm the availability.
                </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
                {renderSpecializedUI()}
            </div>
        </div>
    );
}
