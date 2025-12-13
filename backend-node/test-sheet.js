const axios = require('axios');
const { parse } = require('csv-parse/sync');

const SHEET_ID = '1LVcj2OQh-UrkrdTLyXiYRT-8JCQDe6lSMJp9A7cFZIA';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

async function testSheet() {
    try {
        console.log("Fetching CSV from:", CSV_URL);
        const response = await axios.get(CSV_URL);
        const csvData = response.data;

        const records = parse(csvData, {
            columns: false, // Lecture brute
            skip_empty_lines: true
        });

        console.log("Structure brute (5 premières lignes):");
        records.slice(0, 5).forEach((row, i) => console.log(`Row ${i}:`, row));

    } catch (error) {
        console.error("Error fetching sheet:", error.message);
    }
}

testSheet();
