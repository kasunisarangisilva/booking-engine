import Link from 'next/link';

const ListingCard = ({ listing }) => {
    return (
        <div className="group card !p-0 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-slate-100 bg-white shadow-lg shadow-slate-200/50">
            {/* Image Section */}
            <div className="h-56 bg-slate-100 relative overflow-hidden flex items-center justify-center text-slate-300 font-extrabold text-2xl uppercase tracking-widest">
                {listing.type}
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-primary text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-sm">
                        {listing.type}
                    </span>
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content Section */}
            <div className="p-8">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-text group-hover:text-accent transition-colors line-clamp-1">{listing.title}</h3>
                </div>

                <p className="text-sm text-text-light mb-6 flex items-center gap-2">
                    <span className="text-blue-500 bg-blue-50 w-7 h-7 flex items-center justify-center rounded-full text-xs">📍</span>
                    {listing.location}
                </p>

                <div className="flex justify-between items-center transition-all">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Starting from</span>
                        <span className="text-2xl font-black text-primary">${listing.price}</span>
                    </div>
                    <Link href={`/listing/${listing.id}`} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-accent transition-all shadow-lg shadow-blue-500/10 active:scale-95 no-underline">
                        Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;
