const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

// Import Routes (Structure placeholder)
const enginsRoutes = require('./routes/enginsRoutes');
const filesRoutes = require('./routes/filesRoutes');
const proxyRoutes = require('./routes/proxyRoutes');

app.use('/api/engins', enginsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/proxy', proxyRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
