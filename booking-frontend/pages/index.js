import { useState, useEffect } from 'react';
import axios from 'axios';
import SearchFilters from '../components/SearchFilters';
import ListingCard from '../components/ListingCard';
import Navbar from '../components/Navbar';

const API_BASE = 'http://localhost:5000/api';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/listings`);
      setListings(res.data);
      setFilteredListings(res.data);
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = ({ type, location }) => {
    let filtered = listings;
    if (type) {
      filtered = filtered.filter(l => l.type === type);
    }
    if (location) {
      filtered = filtered.filter(l =>
        l.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    setFilteredListings(filtered);
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-[10s] ease-linear hover:scale-110"
          style={{ backgroundImage: 'url("/hero-banner.png")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background z-10" />
        </div>

        <div className="container relative z-20 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter drop-shadow-2xl">
            Book Your Next <span className="text-accent">Adventure</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto font-medium drop-shadow-lg">
            Find and book the best hotels, movies, events, and luxury transport in one place.
          </p>

          <div className="max-w-4xl mx-auto">
            <SearchFilters onSearch={handleSearch} isHero />
          </div>
        </div>
      </section>

      <main className="container py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Featured Listings</h2>
            <p className="text-text-light">Hand-picked experiences just for you.</p>
          </div>
          <div className="flex gap-2">
            <span className="text-sm font-bold text-primary bg-blue-50 px-4 py-2 rounded-full">
              {filteredListings.length} results found
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filteredListings.length > 0 ? (
              filteredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="col-span-full text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">No listings found</h3>
                <p className="text-text-light">Try adjusting your search criteria or explore other categories.</p>
                <button
                  onClick={() => handleSearch({ type: '', location: '' })}
                  className="mt-6 text-accent font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
