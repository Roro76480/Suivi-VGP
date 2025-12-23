const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./config/postgresDb');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes de base
app.get('/', (req, res) => {
    res.send('API Suivi-VGP Running');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const enginsRoutes = require('./routes/enginsRoutes');
const filesRoutes = require('./routes/filesRoutes');
const proxyRoutes = require('./routes/proxyRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/engins', enginsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/proxy', proxyRoutes);

// Initialize database and start server
const startServer = async () => {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
