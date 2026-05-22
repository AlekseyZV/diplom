import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!isAuthenticated || !user) {
                setLoading(false);
                return;
            }

            // Проверяем роль пользователя (role = 1 - администратор)
            // В вашей БД роль 1 - это администратор (см. таблицу role)
            if (user.role === 1) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        };

        checkAdminStatus();
    }, [user, isAuthenticated]);

    if (loading) {
        return <div className="loading-spinner">Загрузка...</div>;
    }

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;