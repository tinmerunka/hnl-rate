import { createContext, useContext, useState, useEffect } from 'react';
import { logout as logoutService, refreshToken } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    const login = (data) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await logoutService();
        setIsAuthenticated(false);
    };

    const refresh = async () => {
        try {
            await refreshToken();
            setIsAuthenticated(true);
        } catch {
            setIsAuthenticated(false);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}