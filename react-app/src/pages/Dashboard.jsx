export default function Dashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Vue d'ensemble</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Engins Total</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">--</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">VGP à venir</h3>
                    <p className="text-3xl font-bold text-orange-600 mt-2">--</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">VGP en retard</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">--</p>
                </div>
            </div>
        </div>
    );
}
