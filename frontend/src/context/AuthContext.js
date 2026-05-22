import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверяем сохранен ли пользователь при загрузке
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        
        // Сохраняем в localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
        
        // Также сохраняем в sessionStorage для кросс-табной синхронизации
        sessionStorage.setItem('user', JSON.stringify(userData));
        if (userData.token) {
            sessionStorage.setItem('token', userData.token);
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        
        // Очищаем все хранилища
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};