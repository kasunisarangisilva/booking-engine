import Link from 'next/link';
import styles from './Layout.module.css';

const AdminLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <h2 style={{ marginBottom: '2rem' }}>Admin Panel</h2>
                <nav className={styles.nav}>
                    <Link href="/">Dashboard</Link>
                    <Link href="/vendors">Vendors (Admin)</Link>
                    <Link href="/listings">My Listings (Vendor)</Link>
                    <Link href="/reports">Reports</Link>
                    <Link href="/settings">Settings</Link>
                </nav>
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
