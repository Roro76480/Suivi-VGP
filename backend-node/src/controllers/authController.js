const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/postgresDb');

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

// Register a new user
const register = async (req, res) => {
    const { email, password, fullName } = req.body;

    try {
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                error: 'Un compte avec cet email existe déjà'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, full_name) 
             VALUES ($1, $2, $3) 
             RETURNING id, email, full_name, created_at`,
            [email.toLowerCase(), passwordHash, fullName || null]
        );

        const user = result.rows[0];

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'Compte créé avec succès',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                createdAt: user.created_at
            },
            token
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Erreur lors de la création du compte' });
    }
};

// Login user
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const result = await pool.query(
            'SELECT id, email, password_hash, full_name FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Email ou mot de passe incorrect'
            });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Email ou mot de passe incorrect'
            });
        }

        // Update last login timestamp
        await pool.query(
            'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Connexion réussie',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name
            },
            token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
};

// Get current user profile
const me = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, full_name, created_at FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const user = result.rows[0];
        res.json({
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            createdAt: user.created_at
        });
    } catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
};

module.exports = { register, login, me };
