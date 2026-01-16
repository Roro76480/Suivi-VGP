const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initDatabase } = require('./config/postgresDb');

const app = express();
const PORT = process.env.PORT || 5000;

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Helmet: Secure HTTP headers (XSS, clickjacking, etc.)
app.use(helmet());

// Trust Proxy (Required for proper IP detection behind Traefik/Nginx)
app.set('trust proxy', 1);

// CORS: Restrict origins in production
const corsOptions = {
    origin: process.env.CORS_ORIGIN === '*'
        ? '*'
        : process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// Rate limiting: Prevent brute force and DDoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false }, // Suppress warnings as we set trust proxy
    message: { error: 'Trop de requêtes, veuillez réessayer plus tard' }
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Only 10 auth attempts per 15 min
    message: { error: 'Trop de tentatives de connexion, veuillez réessayer plus tard' }
});

// ===========================================
// BODY PARSERS
// ===========================================
app.use(express.json({ limit: '10mb' })); // Reduced from 50mb for security
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// ROUTES
// ===========================================

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'API Suivi-VGP Running' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const enginsRoutes = require('./routes/enginsRoutes');
const filesRoutes = require('./routes/filesRoutes');
const proxyRoutes = require('./routes/proxyRoutes');
const apparauxRoutes = require('./routes/apparauxRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Apply stricter rate limit to auth routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/engins', enginsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/apparaux', apparauxRoutes);
app.use('/api/webhook', webhookRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack);
    res.status(500).json({ error: 'Une erreur interne est survenue' });
});

// ===========================================
// SERVER STARTUP
// ===========================================
const startServer = async () => {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
