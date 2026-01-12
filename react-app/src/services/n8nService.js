/**
 * Service pour les validations VGP via le backend
 * Utilise le backend comme proxy vers n8n (sécurisé)
 */

import { validerSection as apiValiderSection, validerToutesSections as apiValiderToutesSections } from './baserowService';

/**
 * Valider une section individuelle via son webhook n8n
 */
export const validerSection = async (sectionId) => {
    return apiValiderSection(sectionId);
};

/**
 * Valider toutes les sections en séquence
 * @param {Function} onProgress - Callback pour le suivi de progression
 */
export const validerToutesSections = async (onProgress) => {
    return apiValiderToutesSections(onProgress);
};

export default {
    validerSection,
    validerToutesSections
};
