import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const AdminLayout = ({ children }) => {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/' },
        { name: 'Vendors (Admin)', href: '/vendors' },
        { name: 'My Listings (Vendor)', href: '/listings' },
        { name: 'Reports', href: '/reports' },
        { name: 'Settings', href: '/settings' },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen relative overflow-x-hidden">
            {/* Mobile Header */}
            <header className="lg:hidden w-full bg-primary text-white p-4 flex justify-between items-center fixed top-0 left-0 z-50">
                <h2 className="text-xl font-bold">Admin Panel</h2>
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-2xl focus:outline-none"
                    aria-label="Toggle Menu"
                >
                    {isSidebarOpen ? '✕' : '☰'}
                </button>
            </header>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-[250px] bg-primary text-white p-8 flex flex-col transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:block
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <h2 className="text-2xl font-bold mb-8 hidden lg:block">Admin Panel</h2>
                <nav className="flex flex-col gap-4 mt-16 lg:mt-0">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`no-underline transition-colors hover:text-blue-400 ${router.pathname === item.href ? 'text-blue-400 font-semibold' : 'text-gray-300'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 bg-background mt-16 lg:mt-0 min-w-0">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
