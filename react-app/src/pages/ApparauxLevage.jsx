import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ApparauxHeader from '../components/features/apparaux/ApparauxHeader';
import ApparauxSection from '../components/features/apparaux/ApparauxSection';
import { getAllSectionsWithConfig } from '../utils/apparauxConfig';

const ApparauxLevage = () => {
    const sections = getAllSectionsWithConfig();
    const [activeTab, setActiveTab] = useState(sections[0].id);

    const handleValidationComplete = () => {
        window.location.reload();
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
                <ArrowLeft className="w-5 h-5" />
                Retour au Parc Matériel
            </Link>

            <ApparauxHeader onValidationComplete={handleValidationComplete} />

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex overflow-x-auto no-scrollbar">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveTab(section.id)}
                        className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 select-none ${activeTab === section.id
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <span className="text-lg">{section.emoji}</span>
                        {section.nom}
                    </button>
                ))}
            </div>

            {/* Active Section Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {sections.map(section => (
                    section.id === activeTab && (
                        <ApparauxSection
                            key={section.id}
                            section={section}
                        />
                    )
                ))}
            </div>
        </div>
    );
};

export default ApparauxLevage;
