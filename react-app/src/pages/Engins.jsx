import { useState, useEffect, useMemo } from 'react';
import { getEngins, triggerWebhook, updateEngin } from '../services/api';
import FlipCard from '../components/features/FlipCard';
import { Search, ArrowUpDown, Calendar } from 'lucide-react';

export default function Engins() {
    // 1. Déclaration de TOUS les Hooks au début (règle React)
    const [engins, setEngins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null);

    // Nouveaux états pour Recherche et Tri
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

    // Chargement des données
    useEffect(() => {
        const fetchEngins = async () => {
            try {
                const data = await getEngins();
                setEngins(data);
            } catch (err) {
                console.error("Erreur chargement engins:", err);
                setError("Impossible de charger les engins.");
            } finally {
                setLoading(false);
            }
        };

        fetchEngins();
    }, []);

    // Calcul des statistiques
    const stats = useMemo(() => ({
        valid: engins.filter(e => (e.Statut?.value || e.Statut) === "Validité VGP en cours").length,
        renew: engins.filter(e => (e.Statut?.value || e.Statut) === "Prévoir le renouvellement").length,
        ecart: engins.filter(e => (e.Statut?.value || e.Statut) === "Avec écarts").length
    }), [engins]);

    // Filtrage et Tri pour l'affichage
    const filteredEngins = useMemo(() => {
        let result = engins;

        // 1. Filtre par Statut (ActiveFilter)
        if (activeFilter) {
            result = result.filter(e => (e.Statut?.value || e.Statut) === activeFilter);
        }

        // 2. Filtre par Recherche (SearchTerm)
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(e =>
                e.Name.toLowerCase().includes(lowerTerm)
            );
        }

        // 3. Tri par Date (SortOrder)
        result.sort((a, b) => {
            const dateA = new Date(a['Due Date'] || '9999-12-31').getTime();
            const dateB = new Date(b['Due Date'] || '9999-12-31').getTime();

            if (sortOrder === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });

        return result;
    }, [engins, activeFilter, searchTerm, sortOrder]);

    // Toggle Sort Order
    const toggleSort = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    // Handlers
    const handleToggleVGP = async (engin, isChecked) => {
        try {
            console.log(`[UI] Toggle VGP pour ${engin.Name} -> ${isChecked}`);

            // 1. Mise à jour Optimiste UI
            setEngins(prev => prev.map(e => e.id === engin.id ? { ...e, 'VGP faite': isChecked } : e));

            // 2. Appel API Backend (Update Baserow)
            await updateEngin(engin.id, { 'VGP faite': isChecked });

        } catch (e) {
            console.error(e);
            // Revert UI si erreur
            setEngins(prev => prev.map(e => e.id === engin.id ? { ...e, 'VGP faite': !isChecked } : e));

            // Affichage erreur détaillée
            const errorMsg = e.response?.data?.error || e.message || "Erreur inconnue";
            alert(`Erreur lors de la mise à jour: ${errorMsg}`);
        }
    };

    const handleStartValidation = async (engin) => {
        const WEBHOOK_URL = "https://n8n.evolia-digital.fr/webhook/93e40ba6-18e9-4abd-a2f0-3cb629f3bff5";

        if (window.confirm(`Lancer la procédure complète de validation pour ${engin.Name} ?`)) {
            try {
                await triggerWebhook(WEBHOOK_URL);
                alert('Procédure lancée !');
            } catch (e) {
                console.error(e);
                alert("Erreur lors du lancement du webhook n8n.");
            }
        }
    };

    // Helper pour les classes de filtre
    const getFilterClass = (status, baseColor) => {
        const isActive = activeFilter === status;
        const baseClasses = `cursor-pointer text-sm font-medium px-3 py-1 rounded-full flex items-center transition-all duration-200 border`;

        switch (baseColor) {
            case 'green':
                return `${baseClasses} ${isActive ? 'bg-green-200 border-green-400 ring-2 ring-green-400' : 'bg-green-100 text-green-800 border-transparent hover:bg-green-200'}`;
            case 'orange':
                return `${baseClasses} ${isActive ? 'bg-orange-200 border-orange-400 ring-2 ring-orange-400' : 'bg-orange-100 text-orange-800 border-transparent hover:bg-orange-200'}`;
            case 'red':
                return `${baseClasses} ${isActive ? 'bg-red-200 border-red-400 ring-2 ring-red-400' : 'bg-red-100 text-red-800 border-transparent hover:bg-red-200'}`;
            default:
                return baseClasses;
        }
    };

    // 2. Conditions de retour (Affichage Loading/Error) APRES les Hooks
    if (loading) return (
        <div className="flex items-center justify-center h-full pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mt-10">
            {error}
        </div>
    );

    // 3. Rendu Principal
    return (
        <div>
            {/* Header / Titre / Contrôles */}
            <div className="flex flex-col gap-6 mb-8">

                {/* Ligne Supérieure: Titre + Recherche + Tri */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">Parc Matériel</h1>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {filteredEngins.length} engins
                        </span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Barre de Recherche */}
                        <div className="relative flex-1 md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="Rechercher un engin..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Bouton de Tri */}
                        <button
                            onClick={toggleSort}
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            title="Trier par date VGP"
                        >
                            <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                            Date
                            <span className="ml-1 text-xs text-gray-400">({sortOrder === 'asc' ? '-/+' : '+/-'})</span>
                        </button>
                    </div>
                </div>

                {/* Ligne Inférieure: Filtres Statistiques */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium text-gray-500 mr-2">Filtrer par statut :</span>

                    <button
                        onClick={() => setActiveFilter(activeFilter === "Validité VGP en cours" ? null : "Validité VGP en cours")}
                        className={getFilterClass("Validité VGP en cours", 'green')}
                    >
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {stats.valid} Valides
                    </button>

                    <button
                        onClick={() => setActiveFilter(activeFilter === "Prévoir le renouvellement" ? null : "Prévoir le renouvellement")}
                        className={getFilterClass("Prévoir le renouvellement", 'orange')}
                    >
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        {stats.renew} À renouveler
                    </button>

                    <button
                        onClick={() => setActiveFilter(activeFilter === "Avec écarts" ? null : "Avec écarts")}
                        className={getFilterClass("Avec écarts", 'red')}
                    >
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {stats.ecart} Avec écarts
                    </button>

                    {activeFilter && (
                        <button
                            onClick={() => setActiveFilter(null)}
                            className="ml-auto text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Effacer filtre
                        </button>
                    )}
                </div>
            </div>

            {filteredEngins.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Aucun engin trouvé.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredEngins.map(engin => (
                        <FlipCard
                            key={engin.id}
                            engin={engin}
                            onValidate={handleStartValidation}
                            onToggleVGP={handleToggleVGP}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
