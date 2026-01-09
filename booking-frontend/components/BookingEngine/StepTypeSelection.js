export default function StepTypeSelection({ formData, updateFormData }) {
    const options = [
        { id: 'hotel', label: 'Hotel', icon: '🏨' },
        { id: 'hostel', label: 'Hostel', icon: '🏠' },
        { id: 'cinema', label: 'Cinema', icon: '🎬' },
        { id: 'vehicle', label: 'Vehicle', icon: '🚗' },
        { id: 'space', label: 'Space', icon: '🏢' },
        { id: 'other', label: 'Other', icon: '⛺' }
    ];

    return (
        <div className="booking-step-content">
            <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 flex flex-col lg:flex-row items-center gap-2 lg:gap-4">
                    Get a demo <span className="text-3xl lg:text-5xl text-blue-500 animate-pulse">→</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Which best describes your business? Select one to proceed.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 w-full">
                {options.map(opt => (
                    <div
                        key={opt.id}
                        onClick={() => updateFormData({ businessType: opt.id })}
                        className={`booking-option-card ${formData.businessType === opt.id ? 'selected bg-blue-50' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-lg border ${formData.businessType === opt.id ? 'bg-green-100 border-green-200' : 'bg-white border-slate-100'}`}>
                                {formData.businessType === opt.id ? '✅' : opt.icon}
                            </div>
                            <span className="font-bold text-slate-700">{opt.label}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.businessType === opt.id ? 'border-blue-500' : 'border-slate-200'}`}>
                            {formData.businessType === opt.id && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
