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
            <div className="text-center lg:text-left py-4 lg:py-0 self-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 lg:mb-6 flex flex-col lg:flex-row items-center gap-3 lg:gap-6 text-slate-900 tracking-tight leading-tight">
                    Book <span className="text-blue-500 uppercase">{selectedListing.title}</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-500 font-semibold leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Finalize your details and confirm the availability for your selection.
                </p>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 min-h-[300px] md:min-h-[400px] w-full max-w-lg mx-auto lg:ml-auto">
                {renderSpecializedUI()}
            </div>
        </div>
    );
}
