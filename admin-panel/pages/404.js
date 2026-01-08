import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';

export default function Custom404() {
    return (
        <AdminLayout>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '8rem',
                    fontWeight: '900',
                    margin: '0',
                    color: 'var(--primary)',
                    letterSpacing: '-0.05em'
                }}>
                    404
                </h1>
                <div style={{
                    width: '60px',
                    height: '4px',
                    background: 'var(--accent)',
                    margin: '1.5rem 0',
                    borderRadius: '2px'
                }}></div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                    Lost in the Cloud?
                </h2>
                <p style={{ color: 'var(--secondary)', maxWidth: '400px', marginBottom: '2rem' }}>
                    The page you are looking for doesn't exist or has been moved.
                    Let's get you back to the command center.
                </p>
                <Link href="/" className="btn btn-accent" style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    textDecoration: 'none',
                    display: 'inline-block'
                }}>
                    Back to Dashboard
                </Link>
            </div>
        </AdminLayout>
    );
}
