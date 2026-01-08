import { useState } from 'react';
import styles from './SearchFilters.module.css';

const SearchFilters = ({ onSearch }) => {
    const [type, setType] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({ type, location });
    };

    return (
        <div className={`card ${styles.filters}`}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.group}>
                    <label>Category</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="hotel">Hotels</option>
                        <option value="cinema">Cinema</option>
                        <option value="space">Space</option>
                        <option value="vehicle">Vehicles</option>
                    </select>
                </div>
                <div className={styles.group}>
                    <label>Location</label>
                    <input
                        type="text"
                        placeholder="e.g. New York"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Search</button>
            </form>
        </div>
    );
};

export default SearchFilters;
