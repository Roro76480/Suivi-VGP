import { useState, useEffect } from 'react';
import { getSectionData, updateRow, uploadFile, createItem } from '../../../services/baserowService';
import { validerSection } from '../../../services/n8nService';
import ApparauxTable from './ApparauxTable';
import ApparauxModal from './ApparauxModal';
import ApparauxItemModal from './ApparauxItemModal';
import { Upload, Edit2, CheckCircle2, Plus } from 'lucide-react';

const ApparauxSection = ({ section }) => {
    const [ligne00, setLigne00] = useState(null);
    const [inventaire, setInventaire] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [itemModal, setItemModal] = useState({ open: false, data: null });
    const [validating, setValidating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInventaire = inventaire.filter(item => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const typeStr = item.Type ? (typeof item.Type === 'object' ? item.Type.value : item.Type) : '';
        const statusStr = item['Statut VGP'] ? (typeof item['Statut VGP'] === 'object' ? item['Statut VGP'].value : item['Statut VGP']) : '';

        return (
            (item.Name && item.Name.toLowerCase().includes(searchLower)) ||
            typeStr.toLowerCase().includes(searchLower) ||
            (item.Notes && item.Notes.toLowerCase().includes(searchLower)) ||
            statusStr.toLowerCase().includes(searchLower)
        );
    });

    useEffect(() => {
        loadData();
    }, [section]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getSectionData(section.id);
            setLigne00(data.ligne00);
            setInventaire(data.inventaire);
        } catch (error) {
            console.error(`Erreur chargement ${section.nom}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleValiderSection = async () => {
        if (!window.confirm(`Valider la section ${section.nom} ?`)) return;

        setValidating(true);
        try {
            await validerSection(section.id);
            alert(`✅ Section ${section.nom} validée !`);
            await loadData();
        } catch (error) {
            alert(`❌ Erreur validation: ${error.message}`);
        } finally {
            setValidating(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        try {
            const fileData = await uploadFile(section.id, file);
            if (ligne00) {
                await updateRow(section.id, ligne00.id, {
                    'Rapport VGP': [fileData]
                });
            }
            alert('✅ Rapport PDF uploadé avec succès');
            await loadData();
        } catch (error) {
            console.error(error);
            alert(`❌ Erreur upload: ${error.message}`);
        }
    };

    const handleFileDelete = async (e) => {
        if (e) e.preventDefault();

        if (!window.confirm("Voulez-vous vraiment supprimer le rapport PDF ?")) return;

        try {
            await updateRow(section.id, ligne00.id, {
                'Rapport VGP': []
            });
            alert('🗑️ Rapport supprimé');
            await loadData();
        } catch (error) {
            console.error("Delete error:", error);
            alert(`❌ Erreur suppression: ${error.message}`);
        }
    };

    const handleReportSave = async (updatedData) => {
        try {
            await updateRow(section.id, ligne00.id, updatedData);
            setShowReportModal(false);
            await loadData();
        } catch (error) {
            alert(`❌ Erreur sauvegarde: ${error.message}`);
        }
    };

    const handleItemSave = async (formData) => {
        try {
            if (itemModal.data) {
                // Modification
                // Note: On suppose que createRow et updateRow prennent les mêmes paramètres grosso modo
                // ATTENTION: Il faut s'assurer que updateRow gère bien les champs d'un item vs ligne 00
                // Ici on appelle updateRow sur un item de l'inventaire
                await updateRow(section.id, itemModal.data.id, formData);
            } else {
                // Création
                await createItem(section.id, formData);
            }
            setItemModal({ open: false, data: null });
            await loadData();
        } catch (error) {
            alert(`❌ Erreur sauvegarde item: ${error.message}`);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow animate-pulse">Chargement {section.nom}...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Header Ligne 00 (Résolu / Compact) */}
            <div className="bg-gray-50 border-b border-gray-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            📄 Rapport Global VGP
                            {ligne00?.['VGP faite'] ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Fait</span>
                            ) : (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Non fait</span>
                            )}
                        </h3>
                        {ligne00 && (
                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                                <span>📅 Échéance: {ligne00['Due Date'] ? new Date(ligne00['Due Date']).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                {ligne00['Rapport VGP']?.length > 0 && (
                                    <a href={ligne00['Rapport VGP'][0].url} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                                        📎 {ligne00['Rapport VGP'][0].visible_name}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="p-2 text-gray-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-300 transition-all"
                            title="Modifier le rapport"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>

                        {!ligne00?.['Rapport VGP']?.length && (
                            <div className="relative">
                                <input type="file" onChange={(e) => handleFileUpload(e.target.files?.[0])} className="hidden" id={`upload-${section.id}`} accept=".pdf" />
                                <label htmlFor={`upload-${section.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center">
                                    <Upload className="w-4 h-4" />
                                </label>
                            </div>
                        )}

                        <button
                            onClick={handleValiderSection}
                            disabled={validating || !ligne00?.['VGP faite']}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${validating || !ligne00?.['VGP faite']
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                                }`}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {validating ? '...' : 'Valider Section'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventaire */}
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold text-gray-900">📦 Inventaire</h3>

                    <div className="flex flex-1 w-full md:w-auto gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="🔍 Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                            />
                        </div>

                        <button
                            onClick={() => setItemModal({ open: true, data: null })}
                            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter
                        </button>
                    </div>
                </div>

                <ApparauxTable
                    data={filteredInventaire}
                    onEdit={(item) => setItemModal({ open: true, data: item })}
                />
            </div>

            {/* Modals */}
            {showReportModal && ligne00 && (
                <ApparauxModal
                    row={ligne00}
                    onClose={() => setShowReportModal(false)}
                    onSave={handleReportSave}
                    onUpload={handleFileUpload}
                    onDeleteFile={handleFileDelete}
                />
            )}

            <ApparauxItemModal
                isOpen={itemModal.open}
                onClose={() => setItemModal({ open: false, data: null })}
                onSave={handleItemSave}
                initialData={itemModal.data}
                sectionName={section.nom}
            />
        </div>
    );
};

export default ApparauxSection;
