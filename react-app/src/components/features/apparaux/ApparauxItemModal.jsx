import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const ApparauxItemModal = ({ isOpen, onClose, onSave, initialData, sectionName }) => {
    const [formData, setFormData] = useState({
        Name: '',
        Type: '',
        'C.M.U. (T)': '',
        'Longueur (m)': '',
        'Statut VGP': 'Valide',
        Notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                Name: initialData.Name || '',
                Type: initialData.Type?.value || initialData.Type || '',
                'C.M.U. (T)': initialData['C.M.U. (T)'] || '',
                'Longueur (m)': initialData['Longueur (m)'] || '',
                'Statut VGP': initialData['Statut VGP']?.value || initialData['Statut VGP'] || 'Valide',
                Notes: initialData.Notes || ''
            });
        } else {
            // Reset form for new item
            setFormData({
                Name: '',
                Type: '',
                'C.M.U. (T)': '',
                'Longueur (m)': '',
                'Statut VGP': 'Valide',
                Notes: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {initialData ? '✏️ Modifier' : '➕ Ajouter'} un élément
                        <span className="text-sm font-normal opacity-80 bg-white/20 px-2 py-0.5 rounded-full">
                            {sectionName}
                        </span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Nom / Identifiant */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Identifiant / Nom *
                        </label>
                        <input
                            type="text"
                            name="Name"
                            required
                            value={formData.Name}
                            onChange={handleChange}
                            placeholder="Ex: EL-001"
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <input
                                type="text"
                                name="Type"
                                value={formData.Type}
                                onChange={handleChange}
                                placeholder="Ex: Câble, Chaine..."
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            />
                        </div>

                        {/* CMU */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                C.M.U. (T)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name="C.M.U. (T)"
                                value={formData['C.M.U. (T)']}
                                onChange={handleChange}
                                placeholder="Ex: 5"
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Longueur */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Longueur (m)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name="Longueur (m)"
                                value={formData['Longueur (m)']}
                                onChange={handleChange}
                                placeholder="Optionnel"
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            />
                        </div>

                        {/* Statut VGP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Statut VGP
                            </label>
                            <select
                                name="Statut VGP"
                                value={formData['Statut VGP']}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            >
                                <option value="A remettre en état">A remettre en état</option>
                                <option value="Valide">Valide</option>
                                <option value="Non valide">Non valide</option>
                                <option value="Archivée">Archivée</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes / Observations
                        </label>
                        <textarea
                            name="Notes"
                            rows="3"
                            value={formData.Notes}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? 'Enregistrer' : 'Créer'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ApparauxItemModal;
