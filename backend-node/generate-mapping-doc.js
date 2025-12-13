const fs = require('fs');
const BaserowService = require('./src/services/baserowService');
const SheetService = require('./src/services/sheetService');

require('dotenv').config();
const TABLE_ENGINS_ID = process.env.BASEROW_TABLE_ENGINS_ID || "750";

async function generateMappingFile() {
    try {
        console.log("Analyze en cours...");
        const [baserowData, sheetData] = await Promise.all([
            BaserowService.getTableRows(TABLE_ENGINS_ID, { size: 200 }),
            SheetService.getLatestHours()
        ]);

        const engins = baserowData.results;
        const sheetColumns = Object.keys(sheetData).sort();

        let mdContent = "# Mapping des Engins (BDD vs Google Sheet)\n\n";
        mdContent += "Veuillez remplir les colonnes 'Correspondance Sheet 1' et '2' avec les noms **exacts** de la liste des colonnes disponibles plus bas.\n\n";
        mdContent += "| Nom Engin (BDD) | Correspondance Sheet 1 | Correspondance Sheet 2 |\n";
        mdContent += "|---|---|---|\n";

        const ALLOWED_STATUSES = ["Prévoir le renouvellement", "Validité VGP en cours", "Avec écarts"];

        const filteredEngins = engins.filter(e => {
            const s = e['Statut']?.value || e['Statut'];
            return ALLOWED_STATUSES.includes(s);
        });

        // Mapping manuel déjà connu pour l'exclure ou le pré-remplir
        const KNOWN_MAPPINGS = {
            "GRUE - LHM 550": ["LHM 550 Armoire", "LHM 550 Tableau de bord"]
        };

        filteredEngins.sort((a, b) => a.Name.localeCompare(b.Name)).forEach(engin => {
            const known = KNOWN_MAPPINGS[engin.Name];
            const col1 = known ? known[0] : "";
            const col2 = known && known[1] ? known[1] : "";

            // Tentative de guess auto pour aider
            let autoGuess = [];
            const normalizedName = engin.Name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            sheetColumns.forEach(col => {
                if (col.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().includes(normalizedName)) {
                    autoGuess.push(col);
                }
            });

            // Si pas de mapping connu mais deviné, on le suggère entre parenthèses ou on laisse vide
            const displayCol1 = col1 || (autoGuess[0] ? `(? ${autoGuess[0]})` : "");

            mdContent += `| ${engin.Name} | ${displayCol1} | ${col2} |\n`;
        });

        mdContent += "\n\n## Liste des Colonnes Disponibles dans le Google Sheet (Copier-Coller EXACT)\n\n";
        sheetColumns.forEach(c => {
            mdContent += `- \`${c}\`\n`;
        });

        fs.writeFileSync('../MAPPING_A_COMPLETER.md', mdContent);
        console.log("Fichier MAPPING_A_COMPLETER.md généré à la racine !");

    } catch (e) {
        console.error(e);
    }
}

generateMappingFile();
