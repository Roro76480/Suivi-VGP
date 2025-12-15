import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Settings, FileText, X } from 'lucide-react';

const Sidebar = ({ isOpen, closeMenu }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/engins', icon: Truck, label: 'Engins' },
        { path: '/gestion', icon: Settings, label: 'Gestion VGP' },
        { path: '/maintenances', icon: FileText, label: 'Suivi Maintenances' },
    ];

    return (
        <>
            {/* Overlay Mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={closeMenu}
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600">Suivi VGP</h1>
                    <button
                        className="md:hidden text-gray-500 hover:text-red-500"
                        onClick={closeMenu}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="mt-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => closeMenu()} // Fermer le menu au clic sur mobile
                                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                                    }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
