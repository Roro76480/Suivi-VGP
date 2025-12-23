import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const authService = {
    async login(email, password) {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        return response.data;
    },

    async register(email, password, fullName) {
        const response = await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            fullName
        });
        return response.data;
    },

    async getProfile(token) {
        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Set auth header for all subsequent requests
    setAuthToken(token) {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }
};

export default authService;
