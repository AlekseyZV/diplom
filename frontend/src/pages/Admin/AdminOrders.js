import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, 
    FaShoppingCart,
    FaSearch,
    FaFilter,
    FaCalendar,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaChevronDown,
    FaChevronUp,
    FaBox
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Hport } from '../PROT.js';
import '../../AdminStyle/AdminOrders.css';

const API_BASE_URL = Hport.httpport;
const ITEMS_PER_PAGE = 10;

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [displayedOrders, setDisplayedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [statuses, setStatuses] = useState([]);
    
    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchOrders();
        fetchStatuses();
    }, []);

    useEffect(() => {
        // Сбрасываем пагинацию при изменении фильтров
        setCurrentPage(1);
        filterOrders(1);
    }, [searchTerm, statusFilter, orders]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const response = await fetch(`${API_BASE_URL}/admin/orders.php`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setOrders(data.orders);
            } else {
                setError(data.error || 'Ошибка загрузки заказов');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatuses = async () => {
        setStatuses([
            { id: 1, name: 'Оформлен' },
            { id: 2, name: 'На проверке' },
            { id: 3, name: 'Подтвержден' },
            { id: 4, name: 'Ожидает оплаты' },
            { id: 5, name: 'Оплачен' },
            { id: 6, name: 'На комплектации' },
            { id: 7, name: 'Готов к отгрузке' },
            { id: 8, name: 'Отгружен' },
            { id: 9, name: 'Доставлен' },
            { id: 10, name: 'Отменен' }
        ]);
    };

    const filterOrders = (page = 1) => {
        let filtered = [...orders];
        
        // Фильтр по статусу
        if (statusFilter !== 'all') {
            filtered = filtered.filter(o => o.status == statusFilter);
        }
        
        // Поиск по ФИО покупателя, email, телефону или ID заказа
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(o => 
                o.id.toString().includes(term) ||
                `${o.familiy} ${o.imy} ${o.otchestvo}`.toLowerCase().includes(term) ||
                o.login?.toLowerCase().includes(term) ||
                o.phone?.toString().includes(term)
            );
        }
        
        // Пагинация
        const start = 0;
        const end = page * ITEMS_PER_PAGE;
        const paginated = filtered.slice(start, end);
        
        setDisplayedOrders(paginated);
        setHasMore(end < filtered.length);
    };

    const loadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        filterOrders(nextPage);
    };

    const toggleOrderExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(price) + ' ₽';
    };

    // Функция для подсчета общего количества товаров в заказе
    const getTotalItemsCount = (order) => {
        if (!order.items || order.items.length === 0) return 0;
        return order.items.reduce((sum, item) => sum + (item.kolichestvo || 0), 0);
    };

    const getPaymentMethod = (method) => {
        const methods = {
            'card': 'Банковская карта',
            'cash': 'Наличные'
        };
        return methods[method] || method || 'Не указан';
    };

    const getDeliveryMethod = (method) => {
        const methods = {
            'pickup': 'Самовывоз'
        };
        return methods[method] || method || 'Не указан';
    };

    const getStatusColor = (statusId) => {
        const colors = {
            1: '#3498db', // Оформлен - синий
            2: '#f39c12', // На проверке - оранжевый
            3: '#2ecc71', // Подтвержден - зеленый
            4: '#e67e22', // Ожидает оплаты - оранжевый
            5: '#27ae60', // Оплачен - темно-зеленый
            6: '#9b59b6', // На комплектации - фиолетовый
            7: '#3498db', // Готов к отгрузке - синий
            8: '#1abc9c', // Отгружен - бирюзовый
            9: '#2ecc71', // Доставлен - зеленый
            10: '#e74c3c' // Отменен - красный
        };
        return colors[statusId] || '#95a5a6';
    };

    if (loading) return <div className="admin-loading">Загрузка...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-orders">
            <div className="admin-header">
                <Link to="/admin" className="back-button">
                    <FaArrowLeft /> На главную админки
                </Link>
                <h1>Управление заказами</h1>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск по ФИО, email или телефону..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-box">
                    <FaFilter className="filter-icon" />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Все статусы</option>
                        {statuses.map(status => (
                            <option key={status.id} value={status.id}>
                                {status.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-label">Всего заказов:</span>
                    <span className="stat-value">{orders.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Отображается:</span>
                    <span className="stat-value">{displayedOrders.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Общая сумма:</span>
                    <span className="stat-value">
                        {formatPrice(displayedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0))}
                    </span>
                </div>
            </div>

            <div className="orders-list">
                {displayedOrders.length === 0 ? (
                    <div className="no-data">
                        Заказы не найдены
                    </div>
                ) : (
                    displayedOrders.map(order => (
                        <div key={order.id} className="order-card">
                            <div 
                                className="order-header" 
                                onClick={() => toggleOrderExpand(order.id)}
                            >
                                <div className="order-main-info">
                                    <div className="order-number">
                                        Заказ #{order.id}
                                    </div>
                                    <div 
                                        className="order-status"
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {order.status_name}
                                    </div>
                                </div>
                                
                                <div className="order-customer-info">
                                    <div className="customer-name">
                                        <FaUser /> {`${order.familiy} ${order.imy} ${order.otchestvo}`}
                                    </div>
                                    <div className="customer-contact">
                                        <FaEnvelope /> {order.login}
                                    </div>
                                    {order.phone && (
                                        <div className="customer-phone">
                                            <FaPhone /> {order.phone}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="order-summary">
                                    <div className="order-date">
                                        <FaCalendar /> {formatDate(order.dateSozdaniy)}
                                    </div>
                                    <div className="order-total">
                                        {formatPrice(order.total_amount)}
                                    </div>
                                    
                                    {/* Исправлено: показывает общее количество товаров (сумму всех количеств) */}
                                    <div className="order-items-count">
                                        <FaBox /> {getTotalItemsCount(order)} шт.
                                    </div>
                                </div>
                                
                                <div className="expand-icon">
                                    {expandedOrderId === order.id ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                            </div>
                            
                            {expandedOrderId === order.id && (
                                <div className="order-details">
                                    <div className="details-section">
                                        <h4>Информация о заказе</h4>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="label">Дата оформления:</span>
                                                <span>{formatDate(order.dateSozdaniy)}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Способ оплаты:</span>
                                                <span>{getPaymentMethod(order.oplata)}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Способ доставки:</span>
                                                <span>{getDeliveryMethod(order.dostavka)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="details-section">
                                        <h4>Информация о покупателе</h4>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="label">ФИО:</span>
                                                <span>{`${order.familiy} ${order.imy} ${order.otchestvo}`}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Email:</span>
                                                <span>{order.login}</span>
                                            </div>
                                            {order.phone && (
                                                <div className="info-item">
                                                    <span className="label">Телефон:</span>
                                                    <span>{order.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="details-section">
                                        <h4>Состав заказа</h4>
                                        <table className="order-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Товар</th>
                                                    <th>Количество</th>
                                                    <th>Цена</th>
                                                    <th>Сумма</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items?.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.product_name}</td>
                                                        <td>{item.kolichestvo} шт.</td>
                                                        <td>{formatPrice(item.cena)}</td>
                                                        <td>{formatPrice(item.kolichestvo * item.cena)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="3" className="total-label">Итого:</td>
                                                    <td className="total-amount">{formatPrice(order.total_amount)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {hasMore && (
                <div className="load-more-container">
                    <button onClick={loadMore} className="load-more-btn">
                        Показать ещё 10
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;