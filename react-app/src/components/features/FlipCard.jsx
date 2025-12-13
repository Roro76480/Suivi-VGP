import { useState } from 'react';
import { ExternalLink, CheckCircle, FileText, Clock } from 'lucide-react';

const FlipCard = ({ engin, onValidate, onToggleVGP }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Gestion des images: si tableau, prendre le premier, sinon string
    const imageUrl = Array.isArray(engin.Photo) && engin.Photo.length > 0 ? engin.Photo[0].url : 'https://placehold.co/400x300?text=No+Available';

    // Formatage de date
    const formatDate = (dateString) => {
        if (!dateString) return 'Non définie';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    // Check logique couleur statut
    const getStatusStyle = (rawStatus) => {
        const status = rawStatus?.value || rawStatus;
        if (status === "Validité VGP en cours") return "bg-green-100 text-green-800";
        if (status === "Prévoir le renouvellement") return "bg-orange-100 text-orange-800";
        if (status === "Avec écarts") return "bg-red-100 text-red-800";
        return "bg-gray-100 text-gray-800";
    };

    const statusValue = engin.Statut?.value || engin.Statut || 'Inconnu';
    const statusStyle = getStatusStyle(engin.Statut);

    return (
        <div
            className="group w-full h-96 perspective-1000 cursor-pointer"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* RECTO */}
                <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                    {/* Image */}
                    <div className="h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img src={imageUrl} alt={engin.Name} className="w-full h-full object-cover" />
                    </div>
                    {/* Contenu Bas Recto */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{engin.Name}</h3>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
                                {statusValue}
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>Échéance: <span className="font-medium text-gray-700">{formatDate(engin['Due Date'])}</span></span>
                        </div>
                    </div>
                </div>

                {/* VERSO */}
                <div className="absolute w-full h-full backface-hidden bg-gray-900 text-white rounded-xl shadow-xl rotate-y-180 p-6 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">{engin.Name}</h3>

                        <div className="space-y-4">
                            {/* Rapport VGP */}
                            <div>
                                <span className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Rapport VGP</span>
                                {(() => {
                                    const rapportList = engin['Rapport VGP'] || engin['rapport_vgp'] || [];

                                    if (Array.isArray(rapportList) && rapportList.length > 0) {
                                        return (
                                            <a href={rapportList[0].url} target="_blank" rel="noopener noreferrer" className="flex items-center mt-1 text-blue-400 hover:text-blue-300 transition-colors">
                                                <FileText className="w-4 h-4 mr-2" />
                                                {rapportList[0].visible_name || "Voir le rapport"}
                                            </a>
                                        );
                                    } else {
                                        return <p className="text-sm text-gray-500 italic mt-1">Aucun rapport</p>;
                                    }
                                })()}
                            </div>

                            {/* Relevé d'Heures (Si non masqué) */}
                            {engin.hoursData !== null && (
                                <div className="mb-3">
                                    <span className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Relevé d'heures</span>

                                    {engin.hoursData && engin.hoursData.length > 0 ? (
                                        <div className="mt-1 space-y-1">
                                            {engin.hoursData.map((h, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-200 font-medium">{h.label}</span>
                                                    <span className="font-bold text-gray-900 bg-white/90 px-2 py-0.5 rounded shadow-sm border border-gray-200">{h.value} h</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <a href="https://docs.google.com/spreadsheets/d/1LVcj2OQh-UrkrdTLyXiYRT-8JCQDe6lSMJp9A7cFZIA/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="flex items-center mt-1 text-green-500 hover:text-green-400 transition-colors text-sm font-medium">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Consulter les heures
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Bas - Validation */}
                    <div className="pt-4 border-t border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded bg-gray-700 border-gray-600"
                                    checked={engin['VGP faite'] || false}
                                    onChange={(e) => onToggleVGP(engin, e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-300">VGP Faite</span>
                            </label>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onValidate(engin); }}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center shadow-lg"
                        >
                            Valider VGP
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FlipCard;
