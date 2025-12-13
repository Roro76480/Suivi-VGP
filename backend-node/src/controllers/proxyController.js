const axios = require('axios');

const ProxyController = {
    triggerWebhook: async (req, res) => {
        try {
            const { webhookUrl } = req.body;
            if (!webhookUrl) return res.status(400).json({ message: "Webhook URL manquante" });

            // Appel au webhook n8n depuis le serveur (Pas de problème CORS)
            // Appel au webhook n8n depuis le serveur (Pas de problème CORS)
            // Utilisation de GET car n8n retourne "webhook not registered for POST"
            const n8nResponse = await axios.get(webhookUrl);

            res.json({ message: "Webhook déclenché avec succès", data: n8nResponse.data });
        } catch (error) {
            console.error("Erreur Proxy Webhook:", error.message);
            if (error.response) {
                // Erreur retournée par n8n (ex: 404, 500)
                console.error("Détails n8n:", error.response.data);
                return res.status(error.response.status).json({ message: "Erreur n8n", details: error.response.data });
            }
            res.status(500).json({ message: "Erreur lors de l'appel au webhook", error: error.message });
        }
    }
};

module.exports = ProxyController;
