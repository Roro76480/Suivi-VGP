const express = require('express');
const router = express.Router();
const multer = require('multer');
const FilesController = require('../controllers/filesController');

// Configuration Multer (stockage mémoire temporaire avant envoi Baserow)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/files/upload
router.post('/upload', upload.single('file'), FilesController.uploadFile);

module.exports = router;
