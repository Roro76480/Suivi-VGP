const axios = require('axios');
const { parse } = require('csv-parse/sync');

const SHEET_ID = '1LVcj2OQh-UrkrdTLyXiYRT-8JCQDe6lSMJp9A7cFZIA';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const SheetService = {
    getLatestHours: async () => {
        try {
            console.log("Fetching Google Sheet CSV...");
            const response = await axios.get(CSV_URL);
            const records = parse(response.data, {
                columns: false,
                skip_empty_lines: true,
                relax_column_count: true
            });

            if (records.length < 2) return {};

            // Ligne 0 = Headers (Noms des engins)
            const headers = records[0];
            const latestValues = {};

            // Initialiser les cles avec les headers
            headers.forEach((header, index) => {
                if (header && index > 0) { // Ignorer la colonne date (souvent index 0 ou 1)
                    latestValues[header.trim()] = null;
                }
            });

            // Parcourir toutes les lignes de données (du bas vers le haut pour aller plus vite ? Non, du haut vers le bas pour avoir la chronologie si c'est trié)
            // On suppose que le fichier est trié par date chrono. Donc la dernière valeur vue est la bonne.
            for (let i = 1; i < records.length; i++) {
                const row = records[i];
                row.forEach((cell, index) => {
                    const header = headers[index];
                    if (header && cell && cell.trim() !== "") {
                        latestValues[header.trim()] = cell.trim();
                    }
                });
            }

            console.log("Dernières heures récupérées (extrait):", Object.entries(latestValues).slice(0, 3));
            return latestValues;

        } catch (error) {
            console.error("Erreur récupération Google Sheet:", error.message);
            return {};
        }
    }
};

module.exports = SheetService;
