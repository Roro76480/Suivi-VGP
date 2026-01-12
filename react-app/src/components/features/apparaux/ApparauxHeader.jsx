import { Edit2, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import { validerToutesSections } from '../../../services/n8nService';

const ApparauxHeader = ({ onValidationComplete }) => {
    const [isValidating, setIsValidating] = useState(false);
    const [progress, setProgress] = useState([]);

    const handleValidationGlobale = async () => {
        const confirmation = window.confirm(
            '⚠️ Confirmez-vous la validation de TOUTES les sections VGP Apparaux ?\n\n' +
            'Cela va créer les nouvelles échéances pour l\'année prochaine.\n\n' +
            'Assurez-vous que :\n' +
            '✓ Les 5 rapports PDF sont uploadés\n' +
            '✓ Toutes les lignes "00" ont "VGP faite" cochée'
        );

        if (!confirmation) return;

        setIsValidating(true);
        setProgress([]);

        try {
            const results = await validerToutesSections((update) => {
                setProgress(prev => [...prev, update]);
            });

            const errors = results.filter(r => r.error);

            if (errors.length === 0) {
                alert(
                    '✅ VGP Apparaux validée avec succès !\n\n' +
                    `5/5 sections traitées\n` +
                    `Nouvelles échéances créées`
                );

                if (onValidationComplete) {
                    onValidationComplete();
                } else {
                    window.location.reload();
                }
            } else {
                alert(
                    `⚠️ Validation partielle\n\n` +
                    `${5 - errors.length}/5 sections validées\n\n` +
                    `Erreurs :\n${errors.map(e => `- ${e.section}: ${e.message}`).join('\n')}`
                );
            }
        } catch (error) {
            alert(`❌ Erreur lors de la validation\n\n${error.message}\n\nVérifiez les logs n8n.`);
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-8">
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">🔄 VALIDATION VGP ANNUELLE APPARAUX</h1>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="font-semibold mb-2">Avant validation :</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Uploader les 5 rapports PDF (ci-dessous)</li>
                        <li className="flex items-center flex-wrap gap-1">
                            Cocher "VGP faite" dans chaque onglet → Rapport Global VGP →
                            <Edit2 className="w-4 h-4 inline mx-1" />
                            →
                            <CheckSquare className="w-4 h-4 inline mx-1" />
                            VGP effectuée → Sauvegarder
                        </li>
                    </ol>
                </div>

                <button
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${isValidating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 hover:shadow-xl hover:-translate-y-0.5'
                        }`}
                    onClick={handleValidationGlobale}
                    disabled={isValidating}
                >
                    {isValidating ? '⏳ Validation en cours...' : '🚀 VALIDER TOUTES LES SECTIONS'}
                </button>

                {progress.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2">
                        {progress.map((item, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded ${item.status === 'processing'
                                    ? 'bg-blue-500/20'
                                    : item.status === 'success'
                                        ? 'bg-green-500/20'
                                        : 'bg-red-500/20'
                                    }`}
                            >
                                {item.status === 'processing' && '⏳'}
                                {item.status === 'success' && '✅'}
                                {item.status === 'error' && '❌'}
                                {' '}
                                {item.section}
                                {item.error && `: ${item.error}`}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApparauxHeader;
