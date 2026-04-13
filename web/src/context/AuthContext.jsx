import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { logout as logoutService, refreshToken } from '../services/authService';
import { tokenStore } from '../services/tokenStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    // Prevents React StrictMode from firing the silent refresh twice (which would
    // rotate the token on the first call and then fail on the second with "token not found")
    const silentRefreshRan = useRef(false);

    useEffect(() => {
        // Clean up any tokens left in localStorage from the old implementation
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Register force-logout handler so apiClient can trigger it on refresh failure
        tokenStore.setForceLogoutHandler(() => {
            tokenStore.clearAccessToken();
            setIsAuthenticated(false);
        });

        if (silentRefreshRan.current) return;
        silentRefreshRan.current = true;

        // On app load, try to restore session silently using the HttpOnly cookie
        refreshToken()
            .then((data) => {
                tokenStore.setAccessToken(data.accessToken);
                setIsAuthenticated(true);
            })
            .catch(() => {
                // No valid cookie — user needs to log in
                setIsAuthenticated(false);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = (data) => {
        tokenStore.setAccessToken(data.accessToken);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        tokenStore.clearAccessToken();
        await logoutService(); // wait for backend to clear the HttpOnly cookie
        window.location.replace('/login'); // hard reload — resets all React state
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
