import { useState } from 'react';

const SearchFilters = ({ onSearch, isHero }) => {
    const [type, setType] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({ type, location });
    };

    return (
        <div className={`transition-all duration-300 ${isHero
            ? 'bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl md:rounded-4xl shadow-2xl'
            : 'card mb-8'
            }`}>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end">
                <div className="flex flex-col gap-2 text-left">
                    <label className={`text-sm font-bold uppercase tracking-wider ${isHero ? 'text-white/80' : 'text-text'}`}>
                        Category
                    </label>
                    <div className="relative">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className={`w-full p-4 rounded-xl border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent transition-all ${isHero
                                ? 'bg-white/10 border-white/20 text-white placeholder-white/60 hover:bg-white/20'
                                : 'bg-white border-border text-text'
                                }`}
                        >
                            <option value="" className="text-black">All Categories</option>
                            <option value="hotel" className="text-black">Hotels</option>
                            <option value="cinema" className="text-black">Cinema</option>
                            <option value="space" className="text-black">Space</option>
                            <option value="vehicle" className="text-black">Vehicles</option>
                        </select>
                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isHero ? 'text-white/60' : 'text-slate-400'}`}>
                            ▼
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 text-left">
                    <label className={`text-sm font-bold uppercase tracking-wider ${isHero ? 'text-white/80' : 'text-text'}`}>
                        Location
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="e.g. New York, Tokyo..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-accent transition-all ${isHero
                                ? 'bg-white/10 border-white/20 text-white placeholder-white/50 hover:bg-white/20'
                                : 'bg-white border-border text-text'
                                }`}
                        />
                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${isHero ? 'text-white/60' : 'text-slate-400'}`}>
                            📍
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="btn btn-primary h-[58px] text-lg font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-transform"
                >
                    Search Now
                </button>
            </form>
        </div>
    );
};

export default SearchFilters;
