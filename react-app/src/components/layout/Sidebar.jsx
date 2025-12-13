import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Settings, FileText } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/engins', icon: Truck, label: 'Engins' },
        { path: '/gestion', icon: Settings, label: 'Gestion VGP' },
        { path: '/maintenances', icon: FileText, label: 'Suivi Maintenances' },
    ];

    return (
        <aside className="w-64 bg-white shadow-md hidden md:block">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-blue-600">Suivi VGP</h1>
            </div>
            <nav className="mt-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
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
    );
};

export default Sidebar;
