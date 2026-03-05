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
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'cancel'

    useEffect(() => {
        // Check for Stripe success/cancel parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (sessionId) {
            console.log('[Widget] Payment success detected. Verifying Session:', sessionId);
            const savedToken = localStorage.getItem('booking_token');
            // Manually verify session status since webhooks might be slow/fail in dev
            const verifySession = async () => {
                try {
                    await axios.post(`${API_BASE}/payments/verify-session`, { sessionId }, {
                        headers: { 'Authorization': `Bearer ${savedToken}` }
                    });
                    console.log('[Widget] Session verification successful');
                } catch (err) {
                    console.error('[Widget] Session verification failed:', err);
                }
            };
            verifySession();
            setPaymentStatus('success');
            setStep(6); // Confirmation step
        } else if (window.location.pathname.includes('payment-cancel')) {
            console.log('[Widget] Payment cancellation detected.');
            setPaymentStatus('cancel');
            setStep(5); // Stay on payment step
        }
    }, []);

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
                                    <code>{`<!-- 1. Add this script once to your <head> or before </body> -->
<script src="https://booking-engine-widget.vercel.app/loader.js"></script>

<!-- 2. Place this tag where you want the widget to appear -->
<booking-engine data-account-id="YOUR_ACCOUNT_ID"></booking-engine>`}</code>
                                    <div className="copy-badge" onClick={() => {
                                        const code = `<script src="https://booking-engine-widget.vercel.app/loader.js"></script>\n<booking-engine data-account-id="YOUR_ACCOUNT_ID"></booking-engine>`;
                                        navigator.clipboard.writeText(code);
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
                console.log('[Widget] Starting booking process...');
                console.log('[Widget] Form data:', formData);

                // Ensure we have a user for the booking (simplified for widget)
                // In a real flow, you'd check if customer already exists or create new one
                console.log('[Widget] Creating/logging in user...');
                const customerRes = await axios.post(`${API_BASE}/auth/signup`, {
                    name: formData.name || 'Guest User',
                    email: formData.email || `guest_${Date.now()}@example.com`,
                    password: 'temporaryPassword123!',
                    role: 'user'
                }).catch(err => {
                    console.log('[Widget] Signup failed, trying login...', err.response?.data);
                    // If user exists, try to login or use existing
                    if (err.response?.status === 400) {
                        return axios.post(`${API_BASE}/auth/login`, {
                            email: formData.email,
                            password: 'temporaryPassword123!'
                        });
                    }
                    throw err;
                });

                const userObj = customerRes.data.user;
                const userId = userObj?._id || userObj?.id;
                const token = customerRes.data.token; // Extract token

                // Persist token for redirect fallback
                if (token) {
                    localStorage.setItem('booking_token', token);
                }

                console.log('[Widget] User ID:', userId);
                console.log('[Widget] Token:', token ? 'Received' : 'Missing');

                const selectedListing = formData.selectedListing;
                const listingId = selectedListing?._id || selectedListing?.id;
                console.log('[Widget] Listing ID:', listingId);

                if (!userId || !listingId) {
                    throw new Error(`Missing IDs: User(${userId}), Listing(${listingId})`);
                }

                if (!token) {
                    throw new Error('Authentication token missing');
                }

                console.log('[Widget] Creating booking (pending payment)...');
                const bookingRes = await axios.post(`${API_BASE}/bookings`, {
                    listingId: listingId,
                    userId: userId,
                    details: {
                        ...formData.bookingDetails,
                        paymentMethod: formData.paymentMethod || 'card'
                    },
                    paymentMethod: formData.paymentMethod || 'card',
                    totalPrice: selectedListing.price
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const bookingId = bookingRes.data._id;
                console.log('[Widget] Booking created:', bookingId);

                // Initiate payment redirect
                let paymentRes;
                if (formData.paymentMethod === 'koko') {
                    paymentRes = await axios.post(`${API_BASE}/payments/koko/initiate`, { bookingId }, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } else if (formData.paymentMethod === 'mintpay') {
                    paymentRes = await axios.post(`${API_BASE}/payments/mintpay/initiate`, { bookingId }, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } else {
                    // Default to Stripe
                    paymentRes = await axios.post(`${API_BASE}/payments/create-stripe-session`, { bookingId }, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                }

                if (paymentRes.data.url || paymentRes.data.redirectUrl) {
                    window.location.href = paymentRes.data.url || paymentRes.data.redirectUrl;
                } else {
                    nextStep();
                }
            } catch (err) {
                console.error('[Widget] Booking error:', err);
                console.error('[Widget] Error response:', err.response?.data);

                const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
                alert(`Payment/Booking failed: ${errorMessage}`);
            }
        } else {
            nextStep();
        }
    };


    return (
        <div className="booking-engine-container">
            <header className="absolute top-0 left-0 right-0 p-8 flex justify-end z-[60]">
                <button
                    onClick={() => setShowConfirmClose(true)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/50 backdrop-blur-md text-slate-400 hover:text-slate-900 hover:bg-white transition-all cursor-pointer shadow-sm border border-white/20"
                >
                    <span className="text-3xl">×</span>
                </button>
            </header>

            {showConfirmClose && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirmClose(false)} />
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto">⚠️</div>
                        <h3 className="text-3xl font-black text-slate-800 text-center mb-3 tracking-tight">Are you sure?</h3>
                        <p className="text-slate-500 text-center mb-10 text-lg font-medium leading-relaxed">
                            Closing the booking engine will lose all your progress. Are you sure you want to exit?
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full py-5 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-xl shadow-red-200 active:scale-95 text-lg"
                            >
                                Yes, close
                            </button>
                            <button
                                onClick={() => setShowConfirmClose(false)}
                                className="w-full py-5 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95 text-lg"
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
                <div className="w-1/3 flex items-center">
                    {step > 1 && (
                        <button onClick={prevStep} className="group flex items-center gap-3 font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest text-sm">
                            <span className="text-2xl transition-transform group-hover:-translate-x-1">←</span> Back
                        </button>
                    )}
                </div>

                <div className="w-1/3 flex justify-center">
                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map(s => (
                            <div key={s} className={`step-dot ${step === s ? 'active' : ''}`} />
                        ))}
                    </div>
                </div>

                <div className="w-1/3 flex justify-end">
                    <button
                        onClick={handleConfirm}
                        className="btn-next group"
                        disabled={step === 6}
                    >
                        <span className="uppercase tracking-[0.2em]">{step === 5 ? 'Purchase' : step === 6 ? 'Done' : 'Next'}</span>
                        {step < 6 && <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>}
                    </button>
                </div>
            </footer>
        </div>
    );
}
