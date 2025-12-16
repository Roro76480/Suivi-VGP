const express = require('express');
const router = express.Router();
const EnginsController = require('../controllers/enginsController');

// GET /api/engins
router.get('/', EnginsController.getAllEngins);

// POST /api/engins/validate-vgp/:id (Optionnel pour le futur)
router.post('/validate-vgp/:id', EnginsController.triggerValidationVGP);

// POST /api/engins (Création)
router.post('/', EnginsController.createEngin);

// PATCH /api/engins/:id (Mise à jour)
router.patch('/:id', EnginsController.updateEngin);

// DELETE /api/engins/:id (Suppression)
router.delete('/:id', EnginsController.deleteEngin);

module.exports = router;
