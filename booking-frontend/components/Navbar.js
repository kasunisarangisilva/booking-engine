import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = () => {
    return (
        <nav className={styles.nav}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    BookingEngine
                </Link>
                <div className={styles.links}>
                    <Link href="/">Home</Link>
                    <Link href="/my-bookings">My Bookings</Link>
                    <Link href="/login" className="btn btn-primary">Login</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
