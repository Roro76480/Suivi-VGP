import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('auth_token'));
    const [loading, setLoading] = useState(true);

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('auth_token');
            if (storedToken) {
                try {
                    authService.setAuthToken(storedToken);
                    const userData = await authService.getProfile(storedToken);
                    setUser(userData);
                    setToken(storedToken);
                } catch (error) {
                    // Token invalid or expired
                    localStorage.removeItem('auth_token');
                    authService.setAuthToken(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const response = await authService.login(email, password);
        const { token: newToken, user: userData } = response;

        localStorage.setItem('auth_token', newToken);
        authService.setAuthToken(newToken);
        setToken(newToken);
        setUser(userData);

        return response;
    };

    const register = async (email, password, fullName) => {
        const response = await authService.register(email, password, fullName);
        const { token: newToken, user: userData } = response;

        localStorage.setItem('auth_token', newToken);
        authService.setAuthToken(newToken);
        setToken(newToken);
        setUser(userData);

        return response;
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        authService.setAuthToken(null);
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
