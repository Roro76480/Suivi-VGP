/**
 * Service pour les appels API Apparaux via le backend
 * Toutes les requêtes passent par le backend Node.js (sécurisé)
 */

import api from './api';

/**
 * Récupérer la configuration des sections
 */
export const getConfig = async () => {
    const response = await api.get('/apparaux/config');
    return response.data;
};

/**
 * Récupérer les données d'une section (ligne 00 + inventaire)
 */
export const getSectionData = async (sectionId) => {
    const response = await api.get(`/apparaux/${sectionId}`);
    return response.data;
};

/**
 * Mettre à jour une ligne
 */
export const updateRow = async (sectionId, rowId, data) => {
    const response = await api.patch(`/apparaux/${sectionId}/${rowId}`, data);
    return response.data;
};

/**
 * Créer une nouvelle ligne (item)
 */
export const createItem = async (sectionId, data) => {
    const response = await api.post(`/apparaux/${sectionId}/items`, data);
    return response.data;
};

/**
 * Uploader un fichier PDF
 */
export const uploadFile = async (sectionId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/apparaux/${sectionId}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

/**
 * Valider une section (déclenche le workflow n8n)
 */
export const validerSection = async (sectionId) => {
    const response = await api.post(`/apparaux/${sectionId}/validate`);
    return response.data;
};

/**
 * Valider toutes les sections
 */
export const validerToutesSections = async (onProgress) => {
    // On peut optionnellement suivre la progression via un polling
    // Mais pour simplifier, on fait un appel unique au backend
    const response = await api.post('/apparaux/validate-all');

    // Simuler le callback de progression si fourni
    if (onProgress && response.data.results) {
        response.data.results.forEach(result => {
            onProgress({
                section: result.section,
                status: result.success ? 'success' : 'error',
                error: result.error
            });
        });
    }

    return response.data.results;
};

export default {
    getConfig,
    getSectionData,
    updateRow,
    uploadFile,
    validerSection,
    validerToutesSections
};
