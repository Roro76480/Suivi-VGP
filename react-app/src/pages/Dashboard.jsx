import { useState, useEffect } from 'react';
import { getEngins } from '../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        overdue: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const engins = await getEngins();

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let total = 0;
                let upcoming = 0;
                let overdue = 0;

                engins.forEach(engin => {
                    total++;

                    if (engin['Prochaine VGP']) {
                        const nextVGP = new Date(engin['Prochaine VGP']);
                        nextVGP.setHours(0, 0, 0, 0);

                        // Calcul de la différence en jours
                        const diffTime = nextVGP - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays < 0) {
                            overdue++;
                        } else if (diffDays <= 30) {
                            upcoming++; // Considéré "à venir" si dans les 30 prochains jours
                        }
                    }
                });

                setStats({ total, upcoming, overdue });
            } catch (error) {
                console.error("Erreur chargement dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">Chargement des données...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Vue d'ensemble</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Engins Total</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">VGP à venir (30j)</h3>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{stats.upcoming}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">VGP en retard</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue}</p>
                </div>
            </div>
        </div>
    );
}
