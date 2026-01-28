import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">

            <Header toggleSidebar={toggleSidebar} />

            <div className="flex pt-16 min-h-screen">
                <Sidebar
                    isOpen={isSidebarOpen}
                    closeSidebar={() => setIsSidebarOpen(false)}
                />

                <main className="flex-1 w-full lg:ml-0 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
