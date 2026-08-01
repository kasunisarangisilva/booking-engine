import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300 flex flex-col">
            <Header toggleSidebar={toggleSidebar} />
            <div className="flex flex-1 overflow-hidden pt-16">
                <Sidebar
                    isOpen={isSidebarOpen}
                    closeSidebar={() => setIsSidebarOpen(false)}
                />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:pl-72">
                    {children}
                </main>
            </div>
        </div>
    );
}

