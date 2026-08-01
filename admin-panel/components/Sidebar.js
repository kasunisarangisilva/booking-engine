import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Store, List, BarChart, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, closeSidebar }) {
    const router = useRouter();
    const { user } = useAuth();


    const allNavItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'vendor'] },
        { name: 'Vendors (Admin)', href: '/vendors', icon: Store, roles: ['admin'] },
        { name: 'My Listings', href: '/listings', icon: List, roles: ['vendor'] },
        { name: 'All Listings', href: '/listings', icon: List, roles: ['admin'] },
        { name: 'Bookings', href: '/bookings', icon: List, roles: ['vendor'] },
        { name: 'Customers', href: '/customers', icon: Users, roles: ['vendor'] },
        { name: 'Reports', href: '/reports', icon: BarChart, roles: ['admin', 'vendor'] },
        { name: 'Settings', href: '/profile', icon: Settings, roles: ['admin', 'vendor'] },
    ];

    const userRole = user?.role || 'user';
    const navItems = allNavItems.filter(item => item.roles.includes(userRole));


    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-16 left-0 bottom-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out overflow-y-auto
                lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* User Profile Card — always visible */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-200/60 dark:border-slate-600/40">
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate leading-tight">
                                {user?.name || 'User'}
                            </p>
                            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                user?.role === 'admin'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                            }`}>
                                {user?.role || 'user'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = router.pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeSidebar}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </aside>
        </>
    );
}
