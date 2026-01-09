import { useState, useEffect } from 'react';
import StepTypeSelection from './StepTypeSelection';
import StepDetails from './StepDetails';
import StepListingSelection from './StepListingSelection';
import StepBookingUI from './StepBookingUI';
import StepPayment from './StepPayment';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function BookingEngine() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        businessType: '',
        name: '',
        propertyType: '',
        rooms: '',
        country: 'Singapore',
        selectedListing: null,
        bookingDetails: {},
        paymentMethod: 'card'
    });
    const [showEmbed, setShowEmbed] = useState(false);
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <StepTypeSelection formData={formData} updateFormData={updateFormData} />;
            case 2:
                return <StepDetails formData={formData} updateFormData={updateFormData} />;
            case 3:
                return <StepListingSelection formData={formData} updateFormData={updateFormData} />;
            case 4:
                return <StepBookingUI formData={formData} updateFormData={updateFormData} />;
            case 5:
                return <StepPayment formData={formData} updateFormData={updateFormData} />;
            case 6:
                return (
                    <div className="text-center space-y-6 max-w-2xl px-4">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl md:text-6xl mx-auto mb-8 animate-bounce shadow-lg shadow-green-200">
                            ✓
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight">Booking Confirmed!</h1>
                        <p className="text-lg md:text-2xl text-slate-600 font-medium">Your stay at <span className="text-blue-600 font-black">{formData.selectedListing?.title}</span> has been successfully processed.</p>

                        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => setStep(1)} className="btn btn-primary bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                                Make Another Booking
                            </button>
                            <button onClick={() => setShowEmbed(!showEmbed)} className="btn bg-slate-100 px-10 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-200 transition-all">
                                {showEmbed ? 'Hide Embed Code' : 'Get Embed Code'}
                            </button>
                        </div>

                        {showEmbed && (
                            <div className="mt-8 text-left animate-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Add this to your website</h3>
                                <div className="embed-code-card">
                                    <code>{`<iframe src="${window.location.origin}/booking-engine" width="100%" height="800px" frameborder="0"></iframe>`}</code>
                                    <div className="copy-badge" onClick={() => {
                                        navigator.clipboard.writeText(`<iframe src="${window.location.origin}/booking-engine" width="100%" height="800px" frameborder="0"></iframe>`);
                                        alert('Copied to clipboard!');
                                    }}>Copy</div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return <StepTypeSelection formData={formData} updateFormData={updateFormData} />;
        }
    };

    const handleConfirm = async () => {
        if (step === 5) {
            try {
                // In a real app, this would initiate the payment gateway
                await axios.post(`${API_BASE}/bookings`, {
                    listingId: formData.selectedListing.id,
                    details: {
                        ...formData.bookingDetails,
                        paymentMethod: formData.paymentMethod || 'card'
                    },
                    totalPrice: formData.selectedListing.price
                });
                nextStep();
            } catch (err) {
                alert('Payment/Booking failed. Please try again.');
                console.error(err);
            }
        } else {
            nextStep();
        }
    };

    return (
        <div className="booking-engine-container">
            <header className="fixed top-0 left-0 right-0 p-6 flex justify-end z-[60]">
                <button
                    onClick={() => setShowConfirmClose(true)}
                    className="text-4xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                    ×
                </button>
            </header>

            {showConfirmClose && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirmClose(false)} />
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="text-4xl mb-4 text-center">⚠️</div>
                        <h3 className="text-2xl font-black text-slate-800 text-center mb-2">Are you sure?</h3>
                        <p className="text-slate-600 text-center mb-8 leading-relaxed">
                            Closing the booking engine will lose all your progress. Are you sure you want to exit?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                            >
                                Yes, close
                            </button>
                            <button
                                onClick={() => setShowConfirmClose(false)}
                                className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                            >
                                No, stay here
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="booking-wizard-card">
                <div key={step} className="step-transition w-full flex justify-center">
                    {renderStep()}
                </div>
            </main>

            <footer className="booking-footer">
                <div className="flex items-center gap-4">
                    {step > 1 && (
                        <button onClick={prevStep} className="flex items-center gap-2 font-bold text-slate-600 hover:text-slate-900">
                            ← Back
                        </button>
                    )}
                </div>

                <div className="step-indicator">
                    {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`step-dot ${step === s ? 'active' : ''}`} />
                    ))}
                </div>

                <button onClick={handleConfirm} className="btn-next" disabled={step === 6}>
                    {step === 5 ? 'Purchase Now' : step === 6 ? 'Completed' : 'Next'}
                    {step < 6 && <span className="text-xl">→</span>}
                </button>
            </footer>
        </div>
    );
}
