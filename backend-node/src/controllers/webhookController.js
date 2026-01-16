const { sendNonValideAlert, isNonValideStatus } = require('../services/emailService');

// Mapping des table IDs vers les noms de sections
const TABLE_TO_SECTION = {
    [process.env.BASEROW_TABLE_ELINGUES]: 'Élingues',
    [process.env.BASEROW_TABLE_MANILLES]: 'Manilles',
    [process.env.BASEROW_TABLE_MAILLES]: 'Mailles de tête',
    [process.env.BASEROW_TABLE_EMERILLONS]: 'Émerillons œil',
    [process.env.BASEROW_TABLE_CROCHETS]: 'Crochets'
};

/**
 * Gère les webhooks Baserow pour les changements de statut
 * Baserow envoie les webhooks lors de create/update/delete
 */
const handleBaserowWebhook = async (req, res) => {
    try {
        const payload = req.body;

        // Log pour debug
        console.log('📥 Webhook Baserow reçu:', JSON.stringify(payload, null, 2));

        // Baserow envoie différents types d'événements
        const eventType = payload.event_type;
        const tableId = payload.table_id?.toString();
        const items = payload.items || [payload.item];

        // On ne traite que les événements de mise à jour
        if (eventType !== 'rows.updated' && eventType !== 'row.updated') {
            console.log(`ℹ️ Événement ignoré: ${eventType}`);
            return res.status(200).json({ message: 'Event ignored', eventType });
        }

        // Récupérer le nom de la section
        const section = TABLE_TO_SECTION[tableId] || 'Section inconnue';

        // Traiter chaque item
        for (const item of items) {
            if (!item) continue;

            const newStatus = item['Statut VGP'];
            const oldStatus = item.old_value?.['Statut VGP'];

            // Vérifier si le nouveau statut est "Non valide"
            if (isNonValideStatus(newStatus)) {
                // Vérifier si le statut a changé (éviter les doublons)
                if (oldStatus && isNonValideStatus(oldStatus)) {
                    console.log(`ℹ️ Statut déjà "Non valide" pour ${item.Name}, pas d'email`);
                    continue;
                }

                console.log(`🚨 Statut "Non valide" détecté pour ${item.Name}`);

                // Extraire les données pour l'email
                const emailData = {
                    name: item.Name || item.name || 'N/A',
                    type: typeof item.Type === 'object' ? item.Type.value : (item.Type || 'N/A'),
                    section: section,
                    previousStatus: oldStatus ? (typeof oldStatus === 'object' ? oldStatus.value : oldStatus) : null,
                    notes: item.Notes || item.notes || null
                };

                // Envoyer l'email
                try {
                    await sendNonValideAlert(emailData);
                    console.log(`✅ Email envoyé pour ${item.Name}`);
                } catch (emailError) {
                    console.error(`❌ Erreur envoi email:`, emailError.message);
                    // On ne fait pas échouer le webhook si l'email échoue
                }
            }
        }

        res.status(200).json({ success: true, message: 'Webhook traité' });

    } catch (error) {
        console.error('❌ Erreur traitement webhook:', error);
        res.status(500).json({ error: 'Erreur interne', message: error.message });
    }
};

/**
 * Endpoint de test pour vérifier que le webhook est accessible
 */
const testWebhook = (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Webhook endpoint is active',
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    handleBaserowWebhook,
    testWebhook
};
