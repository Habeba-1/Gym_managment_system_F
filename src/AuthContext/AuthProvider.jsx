import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = Cookies.get('user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return null;
            }
        }
        // Default demo user for development
        return {
            id: 1,
            name: "Captain Ahmed",
            phone: "01012345678",
            role: "owner",
            gym_id: "gym-001"
        };
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const auth = Cookies.get('isAuthenticated');
        const token = Cookies.get('token');
        return auth === 'true' && !!token;
    });

    const timeoutRef = useRef(null);
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes to match Access Token lifespan

    const logout = useCallback(() => {
        Cookies.remove('isAuthenticated');
        Cookies.remove('user');
        Cookies.remove('token');
        setUser(null);
        setIsAuthenticated(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const resetInactivityTimer = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (isAuthenticated) {
            timeoutRef.current = setTimeout(() => {
                console.log('Session expired due to inactivity');
                logout();
            }, INACTIVITY_LIMIT);
        }
    }, [isAuthenticated, logout]);

    useEffect(() => {
        if (isAuthenticated) {
            const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
            events.forEach(event => document.addEventListener(event, resetInactivityTimer));
            resetInactivityTimer();

            return () => {
                events.forEach(event => document.removeEventListener(event, resetInactivityTimer));
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
        }
    }, [isAuthenticated, resetInactivityTimer]);

    const login = (response) => {
        if (response) {
            const expiry = 1 / 3; // 8 hours hard limit
            Cookies.set('isAuthenticated', 'true', { expires: expiry });
            Cookies.set('user', JSON.stringify(response.user || response.data?.user || response), { expires: expiry });
            Cookies.set('token', response.token || response.data?.access_token || 'demo-token', { expires: expiry });
            setUser(response.user || response.data?.user || response);
        }
        setIsAuthenticated(true);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isOwner: user?.role === 'owner' }}>
            {children}
        </AuthContext.Provider>
    );
};
