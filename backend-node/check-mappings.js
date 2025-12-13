const BaserowService = require('./src/services/baserowService');
const SheetService = require('./src/services/sheetService');

// Charger les variables d'env pour que le service Baserow fonctionne
require('dotenv').config();

const TABLE_ENGINS_ID = "750";

async function checkMappings() {
    console.log("Analyze des correspondances en cours...");

    try {
        const [baserowData, sheetData] = await Promise.all([
            BaserowService.getTableRows(TABLE_ENGINS_ID, { size: 200 }),
            SheetService.getLatestHours()
        ]);

        const engins = baserowData.results;
        const sheetColumns = Object.keys(sheetData);

        const matched = [];
        const unmatched = [];
        const usedColumns = new Set();

        engins.forEach(engin => {
            const normalizedEnginName = engin.Name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            let hasMatch = false;

            sheetColumns.forEach(col => {
                const normalizedCol = col.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                if (normalizedCol.includes(normalizedEnginName)) {
                    hasMatch = true;
                    usedColumns.add(col);
                    // console.log(`MATCH: ${engin.Name} -> ${col}`);
                }
            });

            if (hasMatch) {
                matched.push(engin.Name);
            } else {
                unmatched.push(engin.Name);
            }
        });

        console.log("\n--- BILAN ---");
        console.log(`Engins trouvés : ${matched.length}`);
        console.log(`Engins SANS correspondance : ${unmatched.length}`);

        console.log("\n--- ENGINS À MAPPER MANUELLEMENT (Liste 1) ---");
        unmatched.forEach(name => console.log(`- ${name}`));

        console.log("\n--- COLONNES DISPONIBLES DANS LE SHEET (Liste 2) ---");
        const unusedColumns = sheetColumns.filter(c => !usedColumns.has(c));
        unusedColumns.sort().forEach(c => console.log(`[ ] ${c}`));

    } catch (e) {
        console.error("Erreur:", e.message);
    }
}

checkMappings();
