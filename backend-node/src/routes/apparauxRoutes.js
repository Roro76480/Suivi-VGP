const express = require('express');
const router = express.Router();
const multer = require('multer');
const ApparauxController = require('../controllers/apparauxController');

// Configuration multer pour l'upload de fichiers en mémoire
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        // Accepter uniquement les PDF
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
        }
    }
});

// GET /api/apparaux/config - Configuration des sections
router.get('/config', ApparauxController.getConfig);

// POST /api/apparaux/validate-all - Validation globale (toutes les sections)
router.post('/validate-all', ApparauxController.validateAll);

// GET /api/apparaux/:section - Données d'une section (ligne 00 + inventaire)
router.get('/:section', ApparauxController.getSectionData);

// PATCH /api/apparaux/:section/:rowId - Mise à jour d'une ligne
router.patch('/:section/:rowId', ApparauxController.updateRow);

// POST /api/apparaux/:section/items - Création d'une nouvelle ligne
router.post('/:section/items', ApparauxController.createRow);

// POST /api/apparaux/:section/upload - Upload fichier PDF
router.post('/:section/upload', upload.single('file'), ApparauxController.uploadFile);

// POST /api/apparaux/:section/validate - Validation d'une section
router.post('/:section/validate', ApparauxController.validateSection);

module.exports = router;
