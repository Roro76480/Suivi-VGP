/**
 * Configuration des sections Apparaux de levage
 * Chaque section correspond à une table Baserow et un workflow n8n
 */

export const SECTIONS_CONFIG = [
    {
        id: 'manilles',
        nom: 'Manilles',
        emoji: '🔗',
        tableEnvKey: 'VITE_BASEROW_TABLE_MANILLES',
        webhookEnvKey: 'VITE_N8N_WEBHOOK_MANILLES',
        ligne00Name: '00 RAPPORT VGP MANILLES',
        colonnesSpecifiques: ['Name', 'C.M.U. (T)', 'Type', 'Due Date', 'Statut VGP']
    },
    {
        id: 'elingues',
        nom: 'Élingues',
        emoji: '🪢',
        tableEnvKey: 'VITE_BASEROW_TABLE_ELINGUES',
        webhookEnvKey: 'VITE_N8N_WEBHOOK_ELINGUES',
        ligne00Name: '00 RAPPORT VGP ÉLINGUES',
        colonnesSpecifiques: ['Name', 'C.M.U. (T)', 'Type', 'Longueur (m)', 'Due Date', 'Statut VGP']
    },
    {
        id: 'mailles',
        nom: 'Mailles de tête',
        emoji: '⛓️',
        tableEnvKey: 'VITE_BASEROW_TABLE_MAILLES',
        webhookEnvKey: 'VITE_N8N_WEBHOOK_MAILLES',
        ligne00Name: '00 RAPPORT VGP MAILLES DE TÊTE',
        colonnesSpecifiques: ['Name', 'C.M.U. (T)', 'Type', 'Due Date', 'Statut VGP']
    },
    {
        id: 'emerillons',
        nom: 'Emerillons oeil',
        emoji: '🔄',
        tableEnvKey: 'VITE_BASEROW_TABLE_EMERILLONS',
        webhookEnvKey: 'VITE_N8N_WEBHOOK_EMERILLONS',
        ligne00Name: '00 RAPPORT VGP EMERILLONS OEIL',
        colonnesSpecifiques: ['Name', 'C.M.U. (T)', 'Type', 'Due Date', 'Statut VGP']
    },
    {
        id: 'crochets',
        nom: 'Crochets',
        emoji: '🪝',
        tableEnvKey: 'VITE_BASEROW_TABLE_CROCHETS',
        webhookEnvKey: 'VITE_N8N_WEBHOOK_CROCHETS',
        ligne00Name: '00 RAPPORT VGP CROCHETS',
        colonnesSpecifiques: ['Name', 'C.M.U. (T)', 'Type', 'Due Date', 'Statut VGP']
    }
];

/**
 * Récupère la configuration d'une section avec ses valeurs d'environnement
 */
export const getSectionConfig = (sectionId) => {
    const section = SECTIONS_CONFIG.find(s => s.id === sectionId);
    if (!section) return null;

    return {
        ...section,
        tableId: import.meta.env[section.tableEnvKey],
        webhookUrl: import.meta.env[section.webhookEnvKey]
    };
};

/**
 * Récupère toutes les sections avec leurs configurations complètes
 */
export const getAllSectionsWithConfig = () => {
    return SECTIONS_CONFIG.map(section => ({
        ...section,
        tableId: import.meta.env[section.tableEnvKey],
        webhookUrl: import.meta.env[section.webhookEnvKey]
    }));
};
