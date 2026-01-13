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
            <div className="text-center lg:text-left py-4 lg:py-0 self-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 lg:mb-6 flex flex-col lg:flex-row items-center gap-3 lg:gap-6 text-slate-900 tracking-tight leading-tight">
                    Secure <span className="text-blue-500 uppercase">Payment</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-500 font-semibold leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Finalize your booking by completing the payment. Your security is our priority.
                </p>

                <div className="mt-8 lg:mt-12 p-6 md:p-10 bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 max-w-lg">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6">Order Summary</h3>
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                        <span className="text-slate-600 font-semibold text-lg md:text-xl line-clamp-1">{formData.selectedListing?.title}</span>
                        <span className="font-black text-lg md:text-xl">${formData.selectedListing?.price}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 md:pt-6 border-t border-slate-100">
                        <span className="text-xl md:text-2xl font-black text-slate-900">Total</span>
                        <span className="text-3xl md:text-4xl font-black text-blue-600">${formData.selectedListing?.price}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 w-full max-w-lg mx-auto lg:ml-auto">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1 lg:hidden">Select Payment Method</h3>
                {paymentMethods.map(method => (
                    <div
                        key={method.id}
                        onClick={() => handleSelect(method.id)}
                        className={`payment-card transform transition-all duration-300 p-4 md:p-6 ${selectedMethod === method.id ? 'selected scale-[1.02] bg-blue-50/50' : 'hover:scale-[1.01] hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="text-3xl md:text-4xl">{method.icon}</div>
                            <div className="flex-1">
                                <h4 className={`text-lg md:text-xl font-bold ${selectedMethod === method.id ? 'text-blue-900' : 'text-slate-800'}`}>{method.name}</h4>
                                <p className="text-xs md:text-sm text-slate-500 font-medium">{method.desc}</p>
                            </div>
                            <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${selectedMethod === method.id ? 'border-blue-600 border-[6px]' : 'border-slate-200'}`}>
                            </div>
                        </div>

                        {selectedMethod === 'card' && method.id === 'card' && (
                            <div className="mt-6 md:mt-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-1 gap-4">
                                    <input type="text" placeholder="Card Number" className="w-full text-base md:text-lg p-4 md:p-5 bg-white shadow-inner border-slate-100 rounded-2xl" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="MM/YY" className="w-full text-base md:text-lg p-4 md:p-5 bg-white shadow-inner border-slate-100 rounded-2xl" />
                                    <input type="text" placeholder="CVC" className="w-full text-base md:text-lg p-4 md:p-5 bg-white shadow-inner border-slate-100 rounded-2xl" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
