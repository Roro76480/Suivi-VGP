const express = require('express');
const router = express.Router();
const ProxyController = require('../controllers/proxyController');

// POST /api/proxy/webhook
router.post('/webhook', ProxyController.triggerWebhook);

module.exports = router;
