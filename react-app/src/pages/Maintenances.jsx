import { useState, useEffect } from 'react';
import { getEngins, api } from '../services/api';
import { Printer, Edit2, Save, X } from 'lucide-react';

const Maintenances = () => {
    const [engins, setEngins] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [noteContent, setNoteContent] = useState('');
    const [selectedIds, setSelectedIds] = useState([]); // Pour la sélection d'impression

    useEffect(() => {
        loadEngins();
    }, []);

    const loadEngins = async () => {
        try {
            const data = await getEngins();
            // Trier par Due Date pour le rapport
            const sorted = data.sort((a, b) => new Date(a['Due Date'] || '9999-12-31') - new Date(b['Due Date'] || '9999-12-31'));
            setEngins(sorted);
        } catch (e) {
            console.error(e);
        }
    };

    // Filtrage : afficher uniquement les engins avec notes significatives (> 2 caractères)
    const displayedEngins = engins.filter(engin => {
        const note = engin.Note || engin.Notes || "";
        return note.trim().length > 2;
    });

    // Mettre à jour la sélection par défaut : seulement les engins AVEC notes
    useEffect(() => {
        if (engins.length > 0) {
            const enginsWithNotes = engins.filter(e => {
                const note = e.Note || e.Notes || "";
                return note.trim().length > 2;
            });
            setSelectedIds(enginsWithNotes.map(e => e.id));
        }
    }, [engins]);

    const handlePrint = () => {
        window.print();
    };

    const startEdit = (engin) => {
        setEditingId(engin.id);
        setNoteContent(engin.Notes || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNoteContent('');
    };

    const saveNote = async (id) => {
        try {
            await api.patch(`/engins/${id}`, { Note: noteContent });
            setEngins(prev => prev.map(e => e.id === id ? { ...e, Note: noteContent } : e));
            setEditingId(null);
        } catch (e) {
            console.error("Erreur save note", e);
            alert("Erreur lors de la sauvegarde de la note.");
        }
    };

    // Gestion de la sélection
    const toggleSelectAll = () => {
        if (selectedIds.length === displayedEngins.length) {
            setSelectedIds([]); // Tout désélectionner
        } else {
            setSelectedIds(displayedEngins.map(e => e.id)); // Tout sélectionner
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
                <h1 className="text-3xl font-bold text-gray-900">Suivi Maintenances VGP</h1>

                <button
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition w-fit shadow-md"
                >
                    <Printer className="w-5 h-5 mr-2" />
                    Imprimer Rapport ({selectedIds.length} sélectionnés)
                </button>
            </div>

            {/* --- SECTION IMPRESSION SPECIFIQUE --- */}
            <div className="hidden print:block print:w-full print:p-8 print:bg-white">
                <div className="mb-8 border-b border-gray-900 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">Rapport de Maintenance Corrective</h1>
                    <div className="flex justify-between items-end mt-4">
                        <p className="text-lg text-gray-600">Suivi VGP - Actions à réaliser</p>
                        <p className="text-sm font-medium text-gray-500">Généré le {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {displayedEngins.filter(e => selectedIds.includes(e.id)).length > 0 ? (
                        displayedEngins
                            .filter(e => selectedIds.includes(e.id))
                            .map(engin => (
                                <div key={engin.id} className="border border-gray-300 rounded-lg p-6 break-inside-avoid shadow-sm bg-white">
                                    <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-2">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800">{engin.Name}</h2>
                                            <p className="text-sm text-gray-500 mt-1">Due Date: {engin['Due Date'] ? new Date(engin['Due Date']).toLocaleDateString('fr-FR') : 'Non définie'}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${(engin.Statut?.value || engin.Statut) === 'Validité VGP en cours' ? 'bg-green-50 text-green-700 border-green-200' :
                                            (engin.Statut?.value || engin.Statut) === 'Prévoir le renouvellement' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {engin.Statut?.value || engin.Statut}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Actions Correctives / Observations :</h3>
                                        <div className="p-4 bg-gray-50 rounded-md border-l-4 border-blue-500 text-gray-800 whitespace-pre-wrap text-base leading-relaxed">
                                            {engin.Note || engin.Notes}
                                        </div>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p className="text-center text-gray-500 italic py-10">Aucun engin sélectionné pour l'impression.</p>
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
                    <p>Document généré automatiquement via la plateforme Suivi VGP.</p>
                </div>
            </div>

            {/* --- SECTION ECRAN (Tableau) --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:hidden min-h-[50vh]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left w-10">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                    checked={displayedEngins.length > 0 && selectedIds.length === displayedEngins.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Échéance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">À Corriger (Note)</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {displayedEngins.length > 0 ? (
                            displayedEngins.map(engin => {
                                const isSelected = selectedIds.includes(engin.id);
                                return (
                                    <tr key={engin.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(engin.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{engin.Name}</div>
                                            <div className="text-sm text-gray-500">{engin.Statut?.value || engin.Statut}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${new Date(engin['Due Date']) < new Date() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {engin['Due Date'] ? new Date(engin['Due Date']).toLocaleDateString() : 'Non définie'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 align-top">
                                            {editingId === engin.id ? (
                                                <textarea
                                                    className="w-full h-24 p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-200 outline-none text-gray-900"
                                                    value={noteContent}
                                                    onChange={(e) => setNoteContent(e.target.value)}
                                                    placeholder="Saisir les observations..."
                                                />
                                            ) : (
                                                <div className="whitespace-pre-wrap">{engin.Note || engin.Notes || '-'}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                                            {editingId === engin.id ? (
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => saveNote(engin.id)} className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-full">
                                                        <Save className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={cancelEdit} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => startEdit(engin)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-gray-500 italic">
                                    Aucune maintenance corrective trouvée avec ces critères.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


        </div>
    );
};

export default Maintenances;
