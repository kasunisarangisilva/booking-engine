import { useState, useEffect } from 'react';
import axios from 'axios';
import SearchFilters from '../components/SearchFilters';
import ListingCard from '../components/ListingCard';

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
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Find Your Perfect Booking</h1>
        <p style={{ color: 'var(--text-light)' }}>Explore hotels, movies, events, and vehicles.</p>
      </header>

      <SearchFilters onSearch={handleSearch} />

      {loading ? (
        <p>Loading listings...</p>
      ) : (
        <div className="grid grid-cols-3">
          {filteredListings.length > 0 ? (
            filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <p>No listings found matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
}
