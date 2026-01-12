import { useState } from 'react';
import { Pencil, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const ApparauxTable = ({ data, onEdit }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // Configuration des colonnes
    const columns = [
        { key: 'Name', label: 'Identifiant / Nom' },
        { key: 'Type', label: 'Type' },
        { key: 'Longueur (m)', label: 'Longueur (m)' },
        { key: 'C.M.U. (T)', label: 'CMU (T)' },
        { key: 'Statut VGP', label: 'Statut VGP' },
        { key: 'Notes', label: 'Notes' }
    ];

    // Gestion du tri
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Données triées
    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Gestion des objets complexes (ex: { value: '...', color: '...' })
        if (typeof aValue === 'object' && aValue !== null) aValue = aValue.value || '';
        if (typeof bValue === 'object' && bValue !== null) bValue = bValue.value || '';

        // Gestion des valeurs null/undefined
        if (!aValue) aValue = '';
        if (!bValue) bValue = '';

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
        if (sortConfig.direction === 'ascending') return <ArrowUp className="w-3 h-3 text-blue-500" />;
        return <ArrowDown className="w-3 h-3 text-blue-500" />;
    };

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg">
                Aucun élément dans l'inventaire.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg shadow ring-1 ring-black ring-opacity-5">
            <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => handleSort(col.key)}
                            >
                                <div className="flex items-center gap-2">
                                    {col.label}
                                    {getSortIcon(col.key)}
                                </div>
                            </th>
                        ))}
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {sortedData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            {/* Nom */}
                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                {item.Name}
                            </td>

                            {/* Type */}
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {typeof item.Type === 'object' ? item.Type.value : item.Type}
                            </td>

                            {/* Longueur */}
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {item['Longueur (m)'] || '-'}
                            </td>

                            {/* CMU */}
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {item['C.M.U. (T)'] || '-'}
                            </td>

                            {/* Statut VGP */}
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                {item['Statut VGP'] && (
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${item['Statut VGP'].color === 'light-green' ? 'bg-green-100 text-green-800' :
                                            item['Statut VGP'].color === 'dark-green' ? 'bg-green-800 text-white' :
                                                item['Statut VGP'].color === 'light-pink' ? 'bg-pink-100 text-white' : // Baserow light-pink is actually reddish
                                                    item['Statut VGP'].value === 'Défectueux' ? 'bg-red-100 text-red-800' :
                                                        item['Statut VGP'].value === 'À surveiller' ? 'bg-orange-100 text-orange-800' :
                                                            item['Statut VGP'].value === 'Archivée' ? 'bg-gray-100 text-gray-800' :
                                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {item['Statut VGP'].value}
                                    </span>
                                )}
                            </td>

                            {/* Note */}
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={item.Notes}>
                                {item.Notes}
                            </td>

                            {/* Actions */}
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <button
                                    onClick={() => onEdit(item)}
                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-full hover:bg-indigo-100 transition-colors"
                                    title="Modifier"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ApparauxTable;
