try {
    const SheetService = require('./src/services/sheetService');
    console.log("SheetService loaded successfully");
} catch (e) {
    console.error("Error loading SheetService:", e);
}

try {
    const EnginsController = require('./src/controllers/enginsController');
    console.log("EnginsController loaded successfully");
} catch (e) {
    console.error("Error loading EnginsController:", e);
}
