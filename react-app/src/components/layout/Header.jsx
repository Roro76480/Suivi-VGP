import { Bell, User, Menu } from 'lucide-react';

const Header = ({ toggleMenu }) => {
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
            <div className="flex items-center">
                <button
                    className="mr-4 md:hidden text-gray-500 hover:text-blue-600 focus:outline-none"
                    onClick={toggleMenu}
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold text-gray-800">
                    Tableau de bord
                </h2>
            </div>
            <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                    <Bell className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Utilisateur</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
