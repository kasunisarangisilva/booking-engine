import Link from 'next/link';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
            }`}>
            <div className="container flex justify-between items-center">
                <Link href="/" className={`text-2xl font-black tracking-tighter transition-colors no-underline ${scrolled ? 'text-primary' : 'text-white'
                    }`}>
                    BOOK<span className="text-accent">IFY</span>
                </Link>
                <div className="flex gap-8 items-center">
                    <Link href="/" className={`text-sm font-semibold transition-colors no-underline ${scrolled ? 'text-text' : 'text-white/90 hover:text-white'
                        }`}>Home</Link>
                    <Link href="/my-bookings" className={`text-sm font-semibold transition-colors no-underline ${scrolled ? 'text-text' : 'text-white/90 hover:text-white'
                        }`}>My Bookings</Link>
                    <Link href="/login" className={`px-5 py-2 rounded-full text-sm font-bold transition-all no-underline ${scrolled
                        ? 'bg-primary text-white hover:opacity-90 shadow-lg shadow-blue-500/10'
                        : 'bg-white text-primary hover:bg-white/90'
                        }`}>Login</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
