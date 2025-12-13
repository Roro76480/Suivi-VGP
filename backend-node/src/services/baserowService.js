const baserowClient = require('../config/database');
const FormData = require('form-data');

const BaserowService = {
    // Récupérer toutes les lignes d'une table
    getTableRows: async (tableId, params = {}) => {
        try {
            const response = await baserowClient.get(`/database/rows/table/${tableId}/`, {
                params: {
                    user_field_names: true, // Utiliser les noms de colonnes au lieu des IDs field_123
                    ...params
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur Baserow (Table ${tableId}):`, error.response?.data || error.message);
            throw error;
        }
    },

    // Mettre à jour une ligne
    updateRow: async (tableId, rowId, data) => {
        try {
            const response = await baserowClient.patch(`/database/rows/table/${tableId}/${rowId}/`, data, {
                params: {
                    user_field_names: true
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur Update Baserow (Table ${tableId}, Row ${rowId}):`, error.response?.data || error.message);
            throw error;
        }
    },

    // Créer une ligne
    createRow: async (tableId, data) => {
        try {
            const response = await baserowClient.post(`/database/rows/table/${tableId}/`, data, {
                params: {
                    user_field_names: true
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur Create Baserow (Table ${tableId}):`, error.response?.data || error.message);
            throw error;
        }
    },

    // Upload de fichier vers Baserow
    uploadFile: async (fileBuffer, fileName) => {
        try {
            const form = new FormData();
            form.append('file', fileBuffer, fileName);

            const response = await baserowClient.post('/user-files/upload-file/', form, {
                headers: {
                    ...form.getHeaders()
                }
            });
            return response.data; // Retourne { url, thumbnails, name, size, mime_type, is_image, ... }
        } catch (error) {
            console.error(`Erreur Upload Baserow:`, error.response?.data || error.message);
            throw error;
        }
    }
};

module.exports = BaserowService;
