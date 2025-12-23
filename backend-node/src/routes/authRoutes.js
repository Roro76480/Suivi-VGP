const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg
        });
    }
    next();
};

// Register route
router.post('/register', [
    body('email')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères'),
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Le nom doit contenir au moins 2 caractères')
], handleValidationErrors, register);

// Login route
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Mot de passe requis')
], handleValidationErrors, login);

// Get current user (protected route)
router.get('/me', authMiddleware, me);

module.exports = router;
