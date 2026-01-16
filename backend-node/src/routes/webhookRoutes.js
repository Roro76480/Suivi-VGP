const express = require('express');
const router = express.Router();
const { handleBaserowWebhook, testWebhook } = require('../controllers/webhookController');

// Route de test
router.get('/baserow', testWebhook);

// Route principale pour les webhooks Baserow
router.post('/baserow', handleBaserowWebhook);

module.exports = router;
