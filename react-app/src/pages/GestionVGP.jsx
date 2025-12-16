import { useState, useEffect } from 'react';
import { getEngins, api } from '../services/api'; // Assurez-vous d'exporter api ou d'avoir updateEngin/uploadFile
import { Save, Upload, Plus, AlertCircle, Check, Trash } from 'lucide-react';

const GestionVGP = () => {
    const [engins, setEngins] = useState([]);
    const [selectedEngin, setSelectedEngin] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }
    const [searchTerm, setSearchTerm] = useState(''); // Pour la barre de recherche

    // États du formulaire
    const [formData, setFormData] = useState({
        Name: '',
        Statut: '',
        'Due Date': '',
        'Rapport VGP': null, // URL ou Array
        Photo: null, // URL ou Array
        Document: null, // URL ou Array
        Note: '' // Champ A corriger
    });

    useEffect(() => {
        loadEngins();
    }, []);

    const loadEngins = async () => {
        try {
            const data = await getEngins();
            setEngins(data);
        } catch (e) {
            console.error("Erreur chargement engins", e);
        }
    };

    const handleSelectEngin = (enginId) => {
        if (enginId === 'new') {
            setIsCreating(true);
            setSelectedEngin(null);
            setFormData({ Name: '', Statut: '', 'Due Date': '', 'Rapport VGP': [], Photo: [], Document: [], Note: '' });
            return;
        }

        const engin = engins.find(e => e.id.toString() === enginId);
        if (engin) {
            setIsCreating(false);
            setSelectedEngin(engin);
            // Map data to form
            setFormData({
                Name: engin.Name,
                Statut: typeof engin.Statut === 'object' ? engin.Statut?.value : engin.Statut,
                'Due Date': engin['Due Date'] || '',
                'Rapport VGP': engin['Rapport VGP'] || [],
                Photo: engin.Photo || [],
                Document: engin.Document || [],
                Note: engin.Note || engin.Notes || ''
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setMessage({ type: 'info', text: 'Upload en cours...' });
            const res = await api.post('/files/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Baserow attend un tableau de fichiers [{name: "...", url: "..."}] pour les updates
            // Mais notre API upload retourne un objet file (url, name, etc.)
            // On l'ajoute à la liste existante
            const newFile = res.data;

            setFormData(prev => ({
                ...prev,
                [fieldName]: [...(prev[fieldName] || []), newFile] // Ajoute le nouveau fichier
            }));
            setMessage({ type: 'success', text: 'Fichier uploadé ! Pensez à sauvegarder.' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Erreur lors de l'upload." });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: 'info', text: 'Sauvegarde en cours...' });

        try {
            // Préparer payload pour Baserow
            // Attention: les champs Select attendent souvent ID ou Value selon config API
            // Ici on envoie la Value, si ça plante faudra check user_field_names
            const payload = {
                Name: formData.Name,
                Statut: formData.Statut,
                'Due Date': formData['Due Date'],
                'Rapport VGP': formData['Rapport VGP'],
                Photo: formData.Photo,
                // Correction : Baserow utilise souvent 'Notes' au pluriel. On envoie les deux par sécurité ou on cible Notes.
                Notes: formData.Note,
                Note: formData.Note
                // 'Document': formData.Document // Ajouter si colonne existe
            };

            if (isCreating) {
                // Create
                // Besoin endpoint POST /api/engins (pas encore créé, on va l'ajouter ou mock)
                await api.post('/engins', payload);
            } else if (selectedEngin) {
                // Update
                await api.patch(`/engins/${selectedEngin.id}`, payload);
            }

            setMessage({ type: 'success', text: 'Enregistré avec succès !' });
            loadEngins(); // Reload list
            if (isCreating) {
                setIsCreating(false);
                setFormData({ Name: '', Statut: '', 'Due Date': '', 'Rapport VGP': [], Photo: [], Note: '' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
        }
    };

    // Helper pour la couleur du statut
    const getStatusColor = (status) => {
        if (!status) return 'text-gray-500';
        const s = status.toLowerCase();
        if (s.includes('renouvellement')) return 'text-orange-600';
        if (s.includes('écart')) return 'text-red-600';
        if (s.includes('validité') || s.includes('cours')) return 'text-green-600';
        return 'text-gray-500';
    };

    const handleDelete = async () => {
        if (!selectedEngin) return;

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'engin "${selectedEngin.Name}" ? Cette action est irréversible.`)) {
            try {
                setMessage({ type: 'info', text: 'Suppression en cours...' });
                await api.delete(`/engins/${selectedEngin.id}`);

                setMessage({ type: 'success', text: 'Engin supprimé avec succès.' });
                setSelectedEngin(null);
                setFormData({ Name: '', Statut: '', 'Due Date': '', 'Rapport VGP': [], Photo: [], Note: '' });
                loadEngins(); // Recharger la liste
            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Gestion / Suivi VGP</h1>

            {/* Sélection avec Recherche */}
            <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher un engin à modifier</label>
                <div className="relative">
                    <div className="flex gap-4">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Tapez pour rechercher un engin..."
                                className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3 pl-10 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all outline-none"
                                value={isCreating ? "" : (selectedEngin ? selectedEngin.Name : searchTerm)}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (selectedEngin) {
                                        setSelectedEngin(null); // Reset selection if typing
                                    }
                                    if (isCreating) setIsCreating(false);
                                }}
                                onClick={() => {
                                    // Quand on clique sur l'input, si un engin est sélectionné, on efface pour permettre une nouvelle recherche
                                    if (selectedEngin) {
                                        setSearchTerm('');
                                        setSelectedEngin(null);
                                    }
                                }}
                            />
                            {/* Search Icon */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsCreating(true);
                                setSelectedEngin(null);
                                setSearchTerm('');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg whitespace-nowrap flex items-center shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nouvel Engin
                        </button>
                    </div>

                    {/* Liste des résultats filtrée */}
                    {!selectedEngin && !isCreating && (
                        <div className="mt-2 absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                            {engins.filter(e => {
                                const status = typeof e.Statut === 'object' ? e.Statut?.value : e.Statut;
                                const statusStr = String(status || "");
                                const matchName = e.Name.toLowerCase().includes(searchTerm.toLowerCase());

                                // Filtre élargi : Renouvellement, Écarts, Validité
                                const allowedStatuses = ["Prévoir le renouvellement", "Avec écarts", "Validité VGP en cours"];
                                const matchStatus = allowedStatuses.includes(statusStr);

                                return matchName && matchStatus;
                            }).length > 0 ? (
                                engins
                                    .filter(e => {
                                        const status = typeof e.Statut === 'object' ? e.Statut?.value : e.Statut;
                                        const statusStr = String(status || "");
                                        const matchName = e.Name.toLowerCase().includes(searchTerm.toLowerCase());
                                        const allowedStatuses = ["Prévoir le renouvellement", "Avec écarts", "Validité VGP en cours"];
                                        const matchStatus = allowedStatuses.includes(statusStr);
                                        return matchName && matchStatus;
                                    })
                                    .map(e => {
                                        const status = typeof e.Statut === 'object' ? e.Statut?.value : e.Statut;
                                        return (
                                            <div
                                                key={e.id}
                                                className="cursor-pointer select-none relative py-3 pl-3 pr-9 hover:bg-blue-50 text-gray-900 border-b border-gray-50 last:border-0"
                                                onClick={() => {
                                                    handleSelectEngin(e.id.toString());
                                                    setSearchTerm('');
                                                }}
                                            >
                                                <span className="block truncate font-medium">{e.Name}</span>
                                                <span className={`block truncate text-xs font-medium ${getStatusColor(status)}`}>
                                                    {status}
                                                </span>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-700">
                                    Aucun engin correspondant trouvé pour "{searchTerm}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Formulaire */}
            {(selectedEngin || isCreating) && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isCreating ? 'Nouvel Engin' : `Modifier: ${selectedEngin.Name}`}
                        </h2>
                        {message && (
                            <div className={`text-sm px-3 py-1 rounded-full flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {message.type === 'success' ? <Check className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                                {message.text}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => { setSelectedEngin(null); setIsCreating(false); }}
                            className="text-gray-400 hover:text-gray-600 ml-4"
                        >
                            Fermer
                        </button>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'engin *</label>
                            <input
                                type="text"
                                name="Name"
                                required
                                value={formData.Name}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none border"
                                placeholder="Ex: Chariot Électrique 3T"
                            />
                        </div>

                        {/* Statut Dynamique */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut (Synchronisé BDD)</label>
                            <select
                                name="Statut"
                                value={formData.Statut}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border-gray-300 p-3 bg-white focus:ring-2 focus:ring-blue-500 border outline-none"
                            >
                                <option value="">Sélectionner...</option>
                                {/* Extraction dynamique des statuts uniques présents dans la liste des engins chargés */}
                                {[...new Set(engins.map(e => typeof e.Statut === 'object' ? e.Statut?.value : e.Statut).filter(Boolean))].sort().map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                                {/* Fallback options si la liste est vide ou incomplète */}
                                {!engins.some(e => (typeof e.Statut === 'object' ? e.Statut?.value : e.Statut) === "Prévoir le renouvellement") && <option value="Prévoir le renouvellement">Prévoir le renouvellement</option>}
                                {!engins.some(e => (typeof e.Statut === 'object' ? e.Statut?.value : e.Statut) === "Validité VGP en cours") && <option value="Validité VGP en cours">Validité VGP en cours</option>}
                                {!engins.some(e => (typeof e.Statut === 'object' ? e.Statut?.value : e.Statut) === "Avec écarts") && <option value="Avec écarts">Avec écarts</option>}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Options récupérées directement de vos engins existants.</p>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prochaine Échéance (Due Date)</label>
                            <input
                                type="date"
                                name="Due Date"
                                value={formData['Due Date']}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 border outline-none"
                            />
                        </div>

                        {/* Rapport VGP */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rapport VGP (PDF)</label>
                            <div className="flex items-center space-x-4">
                                <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                                    <Upload className="w-5 h-5 mr-2" />
                                    <span>Importer PDF</span>
                                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'Rapport VGP')} />
                                </label>
                                <span className="text-xs text-gray-500">
                                    {formData['Rapport VGP']?.length > 0 ? `${formData['Rapport VGP'].length} fichier(s)` : 'Aucun fichier'}
                                </span>
                            </div>
                        </div>

                        {/* Photo */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                            <div className="flex items-center space-x-4">
                                <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                                    <Upload className="w-5 h-5 mr-2" />
                                    <span>Ajouter Photo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'Photo')} />
                                </label>
                                {formData.Photo?.length > 0 && (
                                    <img src={formData.Photo[0].url} alt="Preview" className="h-10 w-10 object-cover rounded shadow" />
                                )}
                            </div>
                        </div>

                        {/* A corriger (Note) */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">A corriger (Note)</label>
                            <textarea
                                name="Note"
                                value={formData.Note}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full rounded-lg border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none border"
                                placeholder="Indiquez ici les éléments à corriger ou les observations..."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">Ce contenu apparaîtra dans le rapport de maintenances correctives.</p>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        {/* Zone suppression (ne s'affiche que si on modifie un engin existant) */}
                        <div>
                            {!isCreating && selectedEngin && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="flex items-center text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                                >
                                    <Trash className="w-4 h-4 mr-2" />
                                    Supprimer cet engin
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Enregistrer
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default GestionVGP;
