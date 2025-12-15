import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar isOpen={isMobileMenuOpen} closeMenu={() => setIsMobileMenuOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <div className="container mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
