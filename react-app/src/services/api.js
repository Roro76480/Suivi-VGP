import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

export const getEngins = async () => {
    const response = await api.get('/engins');
    return response.data;
};

// Fonction pour mettre à jour un champ (ex: coche VGP faite)
export const updateEngin = async (id, data) => {
    // Route backend existante: PATCH /api/engins/:id
    const response = await api.patch(`/engins/${id}`, data);
    return response.data;
};

export const triggerWebhook = async (webhookUrl) => {
    // Appel via notre Backend pour éviter CORS
    return api.post('/proxy/webhook', { webhookUrl });
};

export { api };
export default api;
