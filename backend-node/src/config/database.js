const axios = require('axios');
require('dotenv').config();

const baserowClient = axios.create({
    baseURL: 'https://api.baserow.io/api', // Adjust if using a self-hosted instance, prompt implies baserow.io or baserow.evolia-digital.fr?
    // User LINK is https://baserow.evolia-digital.fr/public/grid/...
    // So the API base URL is likely https://baserow.evolia-digital.fr/api
    headers: {
        'Authorization': `Token ${process.env.BASEROW_API_TOKEN}`
    }
});

// Update baseURL based on the public link provided
baserowClient.defaults.baseURL = 'https://baserow.evolia-digital.fr/api';

module.exports = baserowClient;
