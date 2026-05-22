import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaBox, 
    FaShoppingCart, 
    FaUsers, 
    FaMoneyBillWave,
    FaArrowLeft,
    FaUserTie,
    FaEnvelope,
    FaClipboardList,
    FaCubes
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Hport } from '../PROT.js';
import '../../AdminStyle/AdminDashboard.css';

const API_BASE_URL = Hport.httpport;

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total_orders: 0,
        total_stock: 0,
        total_sold: 0,
        total_revenue: 0,
        users_by_role: {
            admins: 0,
            employees: 0,
            customers: 0,
            guests: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const response = await fetch(`${API_BASE_URL}/admin/stats.php`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setStats(data.stats);
            } else {
                setError(data.error || 'Ошибка загрузки статистики');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Загрузка...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <Link to="/" className="back-button">
                    <FaArrowLeft /> На главную
                </Link>
                <h1>Панель администратора</h1>
                <div className="admin-welcome">
                    Здравствуйте, {user?.name}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon orders">
                        <FaShoppingCart />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.total_orders}</h3>
                        <p>Всего заказов</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stock">
                        <FaCubes />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.total_stock}</h3>
                        <p>Товаров на складе</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon sold">
                        <FaBox />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.total_sold}</h3>
                        <p>Продано товаров</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon revenue">
                        <FaMoneyBillWave />
                    </div>
                    <div className="stat-content">
                        <h3>{new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(stats.total_revenue)} ₽</h3>
                        <p>Выручка</p>
                    </div>
                </div>
            </div>

            <div className="users-stats">
                <h2>Пользователи по ролям</h2>
                <div className="roles-grid">
                    <div className="role-card admin">
                        <FaUserTie />
                        <span className="role-count">{stats.users_by_role?.admins || 0}</span>
                        <span className="role-name">Администраторы</span>
                    </div>
                    <div className="role-card employee">
                        <FaUsers />
                        <span className="role-count">{stats.users_by_role?.employees || 0}</span>
                        <span className="role-name">Сотрудники</span>
                    </div>
                    <div className="role-card customer">
                        <FaUsers />
                        <span className="role-count">{stats.users_by_role?.customers || 0}</span>
                        <span className="role-name">Покупатели</span>
                    </div>
                    <div className="role-card guest">
                        <FaUsers />
                        <span className="role-count">{stats.users_by_role?.guests || 0}</span>
                        <span className="role-name">Гости</span>
                    </div>
                </div>
            </div>

            <div className="admin-actions">
                <h2>Управление</h2>
                <div className="actions-grid">
                    <Link to="/admin/users" className="action-card">
                        <FaUsers className="action-icon" />
                        <h3>Пользователи</h3>
                        <p>Управление пользователями, блокировка, добавление сотрудников</p>
                    </Link>

                    <Link to="/admin/products" className="action-card">
                        <FaBox className="action-icon" />
                        <h3>Товары</h3>
                        <p>Просмотр и управление товарами на складе</p>
                    </Link>

                    <Link to="/admin/orders" className="action-card">
                        <FaShoppingCart className="action-icon" />
                        <h3>Заказы</h3>
                        <p>Просмотр всех заказов с деталями покупателей</p>
                    </Link>

                    <Link to="/admin/feedback" className="action-card">
                        <FaEnvelope className="action-icon" />
                        <h3>Обратная связь</h3>
                        <p>Просмотр сообщений от пользователей</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;