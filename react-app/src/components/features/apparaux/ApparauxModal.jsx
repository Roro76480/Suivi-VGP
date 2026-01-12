import { useState } from 'react';
import { X, Upload, Trash2, FileText } from 'lucide-react';

const ApparauxModal = ({ row, onClose, onSave, onUpload, onDeleteFile }) => {
    const [formData, setFormData] = useState({
        'VGP faite': row?.['VGP faite'] || false,
        'Notes': row?.['Notes'] || ''
    });

    const hasFile = row['Rapport VGP'] && row['Rapport VGP'].length > 0;
    const file = hasFile ? row['Rapport VGP'][0] : null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <h3 className="text-xl font-bold text-gray-900">✏️ Modifier le Rapport</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors bg-white p-1 rounded-full shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* VGP Checkbox */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData['VGP faite']}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    'VGP faite': e.target.checked
                                })}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-900 font-bold">VGP effectuée</span>
                        </label>
                    </div>

                    {/* File Management */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Rapport PDF
                        </label>

                        {hasFile ? (
                            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <FileText className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]" title={file.visible_name}>
                                            {file.visible_name}
                                        </span>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Voir le fichier
                                        </a>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onDeleteFile}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer le fichier"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                    className="hidden"
                                    id="modal-upload"
                                />
                                <label
                                    htmlFor="modal-upload"
                                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">
                                            <span className="font-semibold text-blue-600">Cliquez pour uploader</span>
                                        </p>
                                        <p className="text-xs text-gray-400">PDF uniquement</p>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Notes / Commentaires
                        </label>
                        <textarea
                            value={formData['Notes']}
                            onChange={(e) => setFormData({
                                ...formData,
                                'Notes': e.target.value
                            })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                            placeholder="Ajoutez des notes..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                            Sauvegarder
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApparauxModal;
