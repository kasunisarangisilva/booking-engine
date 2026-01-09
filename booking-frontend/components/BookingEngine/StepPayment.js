import { useState } from 'react';

export default function StepPayment({ formData, updateFormData }) {
    const [selectedMethod, setSelectedMethod] = useState(formData.paymentMethod || 'card');

    const paymentMethods = [
        { id: 'card', name: 'Credit / Debit Card', icon: '💳', desc: 'Secure payment via Stripe' },
        { id: 'paypal', name: 'PayPal', icon: '🅿️', desc: 'Fast and safe electronic payments' },
        { id: 'crypto', name: 'Cryptocurrency', icon: '₿', desc: 'Pay with BTC, ETH or USDC' }
    ];

    const handleSelect = (id) => {
        setSelectedMethod(id);
        updateFormData({ paymentMethod: id });
    };

    return (
        <div className="booking-step-content">
            <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
                    Secure <span className="text-blue-500 uppercase">Payment</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Finalize your booking by completing the payment. Your security is our priority.
                </p>

                <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hidden lg:block">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Order Summary</h3>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-600">{formData.selectedListing?.title}</span>
                        <span className="font-bold">${formData.selectedListing?.price}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-black text-blue-600">${formData.selectedListing?.price}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 w-full">
                {paymentMethods.map(method => (
                    <div
                        key={method.id}
                        onClick={() => handleSelect(method.id)}
                        className={`payment-card ${selectedMethod === method.id ? 'selected' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-3xl">{method.icon}</div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800">{method.name}</h4>
                                <p className="text-sm text-slate-500">{method.desc}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-blue-500' : 'border-slate-200'}`}>
                                {selectedMethod === method.id && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                            </div>
                        </div>

                        {selectedMethod === 'card' && method.id === 'card' && (
                            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-1 gap-4">
                                    <input type="text" placeholder="Card Number" className="w-full text-base" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="MM/YY" className="w-full text-base" />
                                    <input type="text" placeholder="CVC" className="w-full text-base" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <div className="lg:hidden p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-900">Total Price</span>
                        <span className="text-2xl font-black text-blue-600">${formData.selectedListing?.price}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
