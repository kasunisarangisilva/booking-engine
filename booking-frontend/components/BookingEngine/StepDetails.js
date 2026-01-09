export default function StepDetails({ formData, updateFormData }) {
    const typeLabel = formData.businessType === 'hotel' ? 'hotel' : formData.businessType;

    return (
        <div className="booking-step-content">
            <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 flex flex-col lg:flex-row items-center gap-2 lg:gap-4">
                    The Details <span className="text-3xl lg:text-5xl text-blue-500 animate-pulse">→</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Let's get some basic information about your property.
                </p>
            </div>

            <div className="space-y-6 w-full max-w-md mx-auto lg:mx-0">
                <div className="space-y-2">
                    <label className="text-lg font-bold text-slate-700">Enter your {typeLabel} name</label>
                    <input
                        type="text"
                        placeholder={`Enter your ${typeLabel} name`}
                        className="w-full text-lg p-4"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-lg font-bold text-slate-700">Your property is...</label>
                    <select
                        className="w-full text-lg p-4"
                        value={formData.propertyType}
                        onChange={(e) => updateFormData({ propertyType: e.target.value })}
                    >
                        <option value="">Select an option</option>
                        <option value="luxury">Luxury</option>
                        <option value="budget">Budget</option>
                        <option value="boutique">Boutique</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-lg font-bold text-slate-700">How many units do you have?</label>
                    <input
                        type="number"
                        placeholder="Quantity"
                        className="w-full text-lg p-4"
                        value={formData.rooms}
                        onChange={(e) => updateFormData({ rooms: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-lg font-bold text-slate-700">Property Country</label>
                    <input
                        type="text"
                        className="w-full text-lg p-4"
                        value={formData.country}
                        onChange={(e) => updateFormData({ country: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
}
