import Link from 'next/link';
import styles from './ListingCard.module.css';

const ListingCard = ({ listing }) => {
    return (
        <div className={`card ${styles.card}`}>
            <div className={styles.imagePlaceholder}>
                {listing.type.toUpperCase()}
            </div>
            <div className={styles.content}>
                <div className={styles.type}>{listing.type}</div>
                <h3 className={styles.title}>{listing.title}</h3>
                <p className={styles.location}>{listing.location}</p>
                <div className={styles.footer}>
                    <span className={styles.price}>${listing.price}</span>
                    <Link href={`/listing/${listing.id}`} className="btn btn-primary">
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;
