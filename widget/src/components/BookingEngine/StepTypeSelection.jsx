export default function StepTypeSelection({ formData, updateFormData }) {
    const options = [
        { id: 'hotel', label: 'Hotel', icon: '🏨' },
        { id: 'hostel', label: 'Hostel', icon: '🏠' },
        { id: 'cinema', label: 'Cinema', icon: '🎬' },
        { id: 'vehicle', label: 'Vehicle', icon: '🚗' },
        { id: 'space', label: 'Space', icon: '🏢' }
    ];

    return (
        <div className="booking-step-content">
            <div className="text-center lg:text-left py-4 lg:py-0 self-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 lg:mb-6 flex flex-col lg:flex-row items-center gap-3 lg:gap-6 text-slate-900 tracking-tight leading-tight">
                    Get a demo <span className="text-3xl lg:text-6xl text-blue-500 animate-pulse">→</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-500 font-semibold leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Which best describes your business? Select one to proceed.
                </p>
            </div>

            <div className="space-y-3 w-full max-w-lg mx-auto lg:ml-auto">
                {options.map(opt => (
                    <div
                        key={opt.id}
                        onClick={() => updateFormData({ businessType: opt.id })}
                        className={`booking-option-card transform transition-all duration-300 p-4 md:p-5 ${formData.businessType === opt.id ? 'selected scale-[1.02] bg-blue-50/50' : 'hover:scale-[1.01] hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl shadow-sm border transition-colors ${formData.businessType === opt.id ? 'bg-white border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                                <span className="text-2xl md:text-3xl">{opt.icon}</span>
                            </div>
                            <span className={`text-lg md:text-xl font-bold ${formData.businessType === opt.id ? 'text-blue-900' : 'text-slate-700'}`}>
                                {opt.label}
                            </span>
                        </div>
                        <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${formData.businessType === opt.id ? 'border-blue-600 border-[6px]' : 'border-slate-200'}`}>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
