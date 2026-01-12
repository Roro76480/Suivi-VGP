/**
 * Contrôleur pour les Apparaux de levage
 * Gère les 5 sections : Manilles, Élingues, Mailles de tête, Emerillons, Crochets
 */
const BaserowService = require('../services/baserowService');

// Configuration des tables depuis les variables d'environnement
const TABLES_CONFIG = {
    manilles: {
        id: process.env.BASEROW_TABLE_MANILLES,
        nom: 'Manilles',
        ligne00Name: '00 RAPPORT VGP MANILLES'
    },
    elingues: {
        id: process.env.BASEROW_TABLE_ELINGUES,
        nom: 'Élingues',
        ligne00Name: '00 RAPPORT VGP ÉLINGUES'
    },
    mailles: {
        id: process.env.BASEROW_TABLE_MAILLES_DE_TETE,
        nom: 'Mailles de tête',
        ligne00Name: '00 RAPPORT VGP MAILLES DE TÊTE'
    },
    emerillons: {
        id: process.env.BASEROW_TABLE_EMERILLONS,
        nom: 'Emerillons oeil',
        ligne00Name: '00 RAPPORT VGP EMERILLONS OEIL'
    },
    crochets: {
        id: process.env.BASEROW_TABLE_CROCHETS,
        nom: 'Crochets',
        ligne00Name: '00 RAPPORT VGP CROCHETS'
    }
};

// Configuration des webhooks n8n depuis les variables d'environnement
const WEBHOOKS_CONFIG = {
    manilles: process.env.N8N_WEBHOOK_MANILLES,
    elingues: process.env.N8N_WEBHOOK_ELINGUES,
    mailles: process.env.N8N_WEBHOOK_MAILLES,
    emerillons: process.env.N8N_WEBHOOK_EMERILLONS,
    crochets: process.env.N8N_WEBHOOK_CROCHETS
};

const ApparauxController = {
    /**
     * GET /api/apparaux/config
     * Retourne la configuration des sections (sans les tokens/secrets)
     */
    getConfig: async (req, res) => {
        try {
            const config = Object.entries(TABLES_CONFIG).map(([id, data]) => ({
                id,
                nom: data.nom,
                ligne00Name: data.ligne00Name,
                hasWebhook: !!WEBHOOKS_CONFIG[id]
            }));
            res.json(config);
        } catch (error) {
            console.error("Erreur getConfig:", error);
            res.status(500).json({ message: "Erreur serveur", error: error.message });
        }
    },

    /**
     * GET /api/apparaux/:section
     * Récupère toutes les données d'une section (ligne 00 + inventaire)
     */
    getSectionData: async (req, res) => {
        try {
            const { section } = req.params;
            const tableConfig = TABLES_CONFIG[section];

            if (!tableConfig) {
                return res.status(400).json({ message: `Section '${section}' non trouvée` });
            }

            if (!tableConfig.id) {
                return res.status(500).json({
                    message: `Table ID non configurée pour ${section}. Vérifiez BASEROW_TABLE_* dans .env`
                });
            }

            const data = await BaserowService.getTableRows(tableConfig.id, { size: 200 });
            const rows = data.results || [];

            // Séparer ligne 00 et inventaire
            const ligne00 = rows.find(row =>
                row.Name === tableConfig.ligne00Name || row.Name?.startsWith('00')
            );

            const inventaire = rows.filter(row => {
                const isLigne00 = row.Name?.startsWith('00');
                const isArchived = row.Name?.startsWith('🗃️') || row.Statut?.value === 'Archivée';
                return !isLigne00 && !isArchived;
            });

            res.json({
                section: tableConfig.nom,
                ligne00: ligne00 || null,
                inventaire,
                total: inventaire.length
            });
        } catch (error) {
            console.error(`Erreur getSectionData (${req.params.section}):`, error);
            res.status(500).json({ message: "Erreur serveur", error: error.message });
        }
    },

    /**
     * PATCH /api/apparaux/:section/:rowId
     * Met à jour une ligne dans une section
     */
    updateRow: async (req, res) => {
        try {
            const { section, rowId } = req.params;
            const tableConfig = TABLES_CONFIG[section];

            if (!tableConfig) {
                return res.status(400).json({ message: `Section '${section}' non trouvée` });
            }

            console.log(`[APPARAUX UPDATE] Section: ${section}, Row: ${rowId}`, req.body);
            const result = await BaserowService.updateRow(tableConfig.id, rowId, req.body);
            res.json(result);
        } catch (error) {
            console.error(`[APPARAUX UPDATE ERROR] ${req.params.section}/${req.params.rowId}:`, error);
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            res.status(500).json({ message: "Erreur mise à jour", error: error.message });
        }
    },

    /**
     * POST /api/apparaux/:section/upload
     * Upload un fichier pour une section
     */
    uploadFile: async (req, res) => {
        try {
            const { section } = req.params;
            const tableConfig = TABLES_CONFIG[section];

            if (!tableConfig) {
                return res.status(400).json({ message: `Section '${section}' non trouvée` });
            }

            if (!req.file) {
                return res.status(400).json({ message: "Aucun fichier fourni" });
            }

            console.log(`[APPARAUX UPLOAD] Section: ${section}, File: ${req.file.originalname}`);
            const result = await BaserowService.uploadFile(req.file.buffer, req.file.originalname);
            res.json(result);
        } catch (error) {
            console.error(`[APPARAUX UPLOAD ERROR] ${req.params.section}:`, error);
            res.status(500).json({ message: "Erreur upload fichier", error: error.message });
        }
    },

    /**
     * POST /api/apparaux/:section/items
     * Crée une nouvelle ligne dans une section
     */
    createRow: async (req, res) => {
        try {
            const { section } = req.params;
            const tableConfig = TABLES_CONFIG[section];

            if (!tableConfig) {
                return res.status(400).json({ message: `Section '${section}' non trouvée` });
            }

            console.log(`[APPARAUX CREATE] Section: ${section}`, req.body);
            const result = await BaserowService.createRow(tableConfig.id, req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error(`[APPARAUX CREATE ERROR] ${req.params.section}:`, error);
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            res.status(500).json({ message: "Erreur création ligne", error: error.message });
        }
    },

    /**
     * POST /api/apparaux/:section/validate
     * Déclenche le workflow n8n pour valider une section
     */
    validateSection: async (req, res) => {
        try {
            const { section } = req.params;
            const webhookUrl = WEBHOOKS_CONFIG[section];

            if (!webhookUrl) {
                return res.status(400).json({
                    message: `Webhook non configuré pour ${section}. Vérifiez N8N_WEBHOOK_* dans .env`
                });
            }

            console.log(`[APPARAUX VALIDATE] Section: ${section}, Webhook: ${webhookUrl}`);

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'validate',
                    section,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`Webhook n8n error: ${response.status}`);
            }

            res.json({
                success: true,
                section: TABLES_CONFIG[section]?.nom || section,
                message: 'Validation déclenchée avec succès'
            });
        } catch (error) {
            console.error(`[APPARAUX VALIDATE ERROR] ${req.params.section}:`, error);
            res.status(500).json({ message: "Erreur validation", error: error.message });
        }
    },

    /**
     * POST /api/apparaux/validate-all
     * Déclenche tous les workflows n8n en séquence
     */
    validateAll: async (req, res) => {
        try {
            const results = [];
            const sections = Object.keys(TABLES_CONFIG);

            for (const section of sections) {
                const webhookUrl = WEBHOOKS_CONFIG[section];

                if (!webhookUrl) {
                    results.push({
                        section: TABLES_CONFIG[section]?.nom || section,
                        success: false,
                        error: 'Webhook non configuré'
                    });
                    continue;
                }

                try {
                    console.log(`[VALIDATE ALL] Processing: ${section}`);

                    const response = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'validate',
                            section,
                            timestamp: new Date().toISOString()
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }

                    results.push({
                        section: TABLES_CONFIG[section]?.nom || section,
                        success: true
                    });

                    // Délai de 1 seconde entre chaque appel
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (err) {
                    results.push({
                        section: TABLES_CONFIG[section]?.nom || section,
                        success: false,
                        error: err.message
                    });
                }
            }

            const successCount = results.filter(r => r.success).length;
            res.json({
                success: successCount === sections.length,
                total: sections.length,
                validated: successCount,
                results
            });
        } catch (error) {
            console.error("[VALIDATE ALL ERROR]:", error);
            res.status(500).json({ message: "Erreur validation globale", error: error.message });
        }
    }
};

module.exports = ApparauxController;
