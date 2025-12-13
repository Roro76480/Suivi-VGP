import { useState, useEffect } from 'react';
import { getEngins, api } from '../services/api'; // Assurez-vous d'exporter api ou d'avoir updateEngin/uploadFile
import { Save, Upload, Plus, AlertCircle, Check } from 'lucide-react';

const GestionVGP = () => {
    const [engins, setEngins] = useState([]);
    const [selectedEngin, setSelectedEngin] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }

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
                Note: formData.Note, // Ajout du champ Note
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
                setFormData({ Name: '', Statut: '', 'Due Date': '', 'Rapport VGP': [], Photo: [] });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Gestion / Suivi VGP</h1>

            {/* Sélection */}
            <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un engin à modifier</label>
                <div className="flex gap-4">
                    <select
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all"
                        onChange={(e) => handleSelectEngin(e.target.value)}
                        value={isCreating ? 'new' : (selectedEngin?.id || '')}
                    >
                        <option value="">-- Choisir un engin --</option>
                        <option value="new">+ Ajouter un nouvel engin</option>
                        {engins.map(e => (
                            <option key={e.id} value={e.id}>{e.Name}</option>
                        ))}
                    </select>
                    {isCreating && (
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg whitespace-nowrap"
                        >
                            Annuler création
                        </button>
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

                        {/* Statut */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                            <select
                                name="Statut"
                                value={formData.Statut}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border-gray-300 p-3 bg-white focus:ring-2 focus:ring-blue-500 border outline-none"
                            >
                                <option value="">Sélectionner...</option>
                                <option value="En service">En service</option>
                                <option value="En maintenance">En maintenance</option>
                                <option value="Hors service">Hors service</option>
                                <option value="Archivée">Archivée</option>
                            </select>
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

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
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
