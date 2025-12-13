const BaserowService = require('../services/baserowService');
const SheetService = require('../services/sheetService');

const TABLE_ENGINS_ID = process.env.BASEROW_TABLE_ENGINS_ID || "750";

const EnginsController = {
    // Récupérer tous les engins
    getAllEngins: async (req, res) => {
        try {
            // Appel parallèle : Rows Baserow + CSV Google Sheet
            const [baserowData, sheetData] = await Promise.all([
                BaserowService.getTableRows(TABLE_ENGINS_ID, { size: 200 }),
                SheetService.getLatestHours()
            ]);

            // Filtrage des statuts autorisés
            const ALLOWED_STATUSES = ["Prévoir le renouvellement", "Validité VGP en cours", "Avec écarts"];
            // Mapping manuel COMPLET (Nom Baserow -> [Colonnes Sheet])
            const MANUAL_MAPPING = {
                "CAGE PERSONNEL - 51604": ["HIDE_HOURS"],
                "CHARIOT - FENWICK LOC - 2,5T": ["2,5T FENWICK LOC"],
                "CHARIOT - FENWICK LOC - 5T": ["H50D 02785 FENWICK"],
                "CHARIOT - SVETRUCK - 18T": ["18T SVETRUCK"],
                "CHARIOT - YALE -  2,13T- 128": ["2,13T YALE 128"],
                "COL DE SIGNE SEACOM SH30 N°A/5214 / REP2": ["HIDE_HOURS"],
                "COMPRESSEUR - ATLAS": ["COMPRESSEUR ATLAS"],
                "GRUE - LHM 250": ["LHM 250"],
                "GRUE - LHM 420": ["LHM 420"],
                "GRUE - LHM 550": ["LHM 550 Armoire", "LHM 550 Tableau de bord"],
                "MINI CHARGEUSE - MUSTANG - 1900R": ["MUSTANG 1900R"],
                "NACELLE - 2045898": ["NACELLE 2045898"],
                "NACELLE - 2049130": ["NACELLE 2049130"],
                "PALONNIER - BROMMA - BELGE - 2504": ["HIDE_HOURS"],
                "PALONNIER - BROMMA - EH12U - 36460 (neuf 07/2023)": ["HIDE_HOURS"],
                "PALONNIER - MODULIFT - MOD 70H N°1011896": ["HIDE_HOURS"],
                "PALONNIER - MODULIFT - MOD34 N° 95665 N° REP 2": ["HIDE_HOURS"],
                "PALONNIER - MODULIFT - MOD70": ["HIDE_HOURS"],
                "PALONNIER - MODULIFT - MOD70 - 220000329": ["HIDE_HOURS"],
                "PALONNIER - MODULIFT - MOD70 - 220000332": ["HIDE_HOURS"],
                "PALONNIER - MODULIFT - MODL110SH": ["HIDE_HOURS"],
                "PALONNIER - STINIS - Vatc II - STB35-0410198": ["HIDE_HOURS"],
                "PALONNIER CADRE - TEC CONTAINER - BAIIOCF2 - 4997": ["HIDE_HOURS"],
                "PALONNIER CADRE - TEC CONTAINER - BAIIOCF2 - 4998": ["HIDE_HOURS"],
                "PALONNIER SPREADER  FIXE- STINIS - 20' - SAC 20 4A-35T - 0411080": ["HIDE_HOURS"],
                "PALONNIER SPREADER  FIXE- STINIS - 40' - SAC 40 5A-45T - 0411081": ["HIDE_HOURS"],
                "PELLE - SENNEBOGEN - 835": ["SENNEBOGEN 835"],
                "PELLE - SENNEBOGEN - 835E": ["SENNEBOGEN 835E"],
                "PELLE - SENNEBOGEN - 840": ["SENNEBOGEN 840"],
                "PPM 11 - 70310-11": ["70310- 11"],
                "PPM 12 - 70310-12": ["70310- 12"],
                "PPM 45 - 70360-45": ["70360- 45"],
                "PPM 62 - 70360-62": ["70360- 62"],
                "PPM 7 - 70310-7": ["70310- 7"]
            };

            const sheetKeys = Object.keys(sheetData);

            const engins = baserowData.results
                .filter(engin => {
                    // Vérification du Statut
                    if (!engin['Statut']) return false;
                    const statutValue = typeof engin['Statut'] === 'object' ? engin['Statut'].value : engin['Statut'];
                    return ALLOWED_STATUSES.includes(statutValue);
                })
                .map(engin => {
                    // Enrichissement avec les heures du Google Sheet
                    let matchedHours = [];
                    const enginName = engin.Name;

                    // 1. Recherche par Mapping Manuel (Prioritaire)
                    if (MANUAL_MAPPING[enginName]) {

                        // Cas SPÉCIAL : Masquer les heures
                        if (MANUAL_MAPPING[enginName].length === 1 && MANUAL_MAPPING[enginName][0] === "HIDE_HOURS") {
                            matchedHours = null; // Signale au frontend de ne rien afficher
                        } else {
                            MANUAL_MAPPING[enginName].forEach(columnName => {
                                if (sheetData[columnName]) {
                                    // Nettoyage du label
                                    let label = columnName;
                                    label = label.replace("LHM 550", "").trim();

                                    matchedHours.push({
                                        label: label || columnName,
                                        value: sheetData[columnName],
                                        originalColumn: columnName
                                    });
                                }
                            });
                        }
                    }

                    // 2. Si rien trouvé manuellement ET que ce n'est pas un cas masqué explicitement
                    if (matchedHours !== null && matchedHours.length === 0) {
                        const normalizedEnginName = enginName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

                        sheetKeys.forEach(columnName => {
                            const normalizedColumn = columnName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

                            // Si le nom de l'engin est contenu dans le nom de la colonne du sheet
                            if (normalizedColumn.includes(normalizedEnginName) && sheetData[columnName]) {

                                // Extraire le label propre
                                let label = columnName.replace(engin.Name, '').replace(/[-_]/g, ' ').trim();
                                if (!label || label.toLowerCase() === engin.Name.toLowerCase()) label = "Heures";
                                if (label.startsWith(engin.Name)) label = label.substring(engin.Name.length).trim();

                                matchedHours.push({
                                    label: label || "Heures",
                                    value: sheetData[columnName],
                                    originalColumn: columnName
                                });
                            }
                        });
                    }

                    return {
                        ...engin,
                        // Tableau d'objets, ou null si masqué
                        hoursData: matchedHours
                    };
                });

            res.json(engins);
        } catch (error) {
            console.error("Erreur récupération engins:", error);
            res.status(500).json({ message: "Erreur serveur", error: error.message });
        }
    },

    // Mise à jour d'un engin
    updateEngin: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`[UPDATE] Request for Engin ID: ${id}`, req.body);
            const result = await BaserowService.updateRow(TABLE_ENGINS_ID, id, req.body);
            res.json(result);
        } catch (error) {
            console.error(`[UPDATE ERROR] Engin ID ${req.params.id}:`, error.message);
            if (error.response) {
                console.error("[BASEROW ERROR DETAILS]", error.response.data);
                return res.status(error.response.status).json(error.response.data);
            }
            res.status(500).json({ message: "Erreur mise à jour engin", error: error.message });
        }
    },

    // Méthodes placeholder pour éviter le crash des routes existantes
    createEngin: async (req, res) => {
        res.status(501).json({ message: "Not implemented yet" });
    },

    triggerValidationVGP: async (req, res) => {
        res.status(501).json({ message: "Not implemented yet" });
    }
};

module.exports = EnginsController;
