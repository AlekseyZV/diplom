// src/pages/Orders.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaChevronDown, FaChevronUp, FaBox, FaCalendar, FaRubleSign, FaShoppingCart } from 'react-icons/fa';
import styles from '../styles/Orders.module.css';
import { Hport } from './PROT.js';

const API_BASE_URL = Hport.httpport;

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        total_orders: 0,
        total_spent: 0,
        total_products: 0
    });
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && user.id) {
            fetchUserOrders();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const fetchUserOrders = async () => {
        if (!user || !user.id) {
            setError('Пользователь не авторизован');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError('');

        const urls = [
            `${API_BASE_URL}/api/orders?userId=${user.id}`,
            `${API_BASE_URL}/orders.php?userId=${user.id}`
        ];

        let found = false;

        for (const url of urls) {
            try {
                console.log(`🔄 Пробуем URL для заказов: ${url}`);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                console.log(`📊 Статус ответа: ${response.status} ${response.statusText}`);

                if (!response.ok) {
                    console.log(`❌ HTTP ошибка ${response.status}, пробуем следующий URL`);
                    continue;
                }

                const text = await response.text();
                console.log('📄 Полный ответ от сервера:', text);

                try {
                    const result = JSON.parse(text);
                    console.log('📊 Парсинг JSON успешен:', result);
                    
                    if (result.success) {
                        setOrders(result.orders || []);
                        setStats(result.stats || {
                            total_orders: 0,
                            total_spent: 0,
                            total_products: 0
                        });
                        found = true;
                        setIsLoading(false);
                        break;
                    }
                } catch (parseError) {
                    console.error('❌ Ошибка парсинга JSON:', parseError, 'Текст:', text);
                }
            } catch (fetchError) {
                console.error('❌ Ошибка fetch:', fetchError);
            }
        }

        if (!found) {
            setError('Не удалось загрузить заказы. Проверьте соединение или сервер.');
            setIsLoading(false);
        }
    };

    const toggleOrderExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(price) + ' ₽';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 1: return '#3498db';
            case 3: return '#2ecc71';
            case 5: return '#27ae60';
            case 8: return '#9b59b6';
            case 9: return '#1abc9c';
            case 10: return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    // Используем правильные имена классов из CSS-модуля
    if (!user) return <div className={styles['orders-not-authorized']}>Не авторизован</div>;
    if (isLoading) return <div className={styles['orders-loading']}>Загрузка...</div>;
    if (error) return <div className={styles['orders-error']}>{error}</div>;

    return (
        <div className={styles['orders-container']}>
            <h2>Мои заказы</h2>

            <div className={styles['orders-stats']}>
                <div className={styles['stat-card']}>
                    <FaBox  />
                    <div className={styles['stat-info']}>
                        <h3>{stats.total_orders}</h3>
                        <p>Заказов</p>
                    </div>
                </div>
                <div className={styles['stat-card']}>
                    <FaRubleSign  />
                    <div className={styles['stat-info']}>
                        <h3>{formatPrice(stats.total_spent)}</h3>
                        <p>Потрачено</p>
                    </div>
                </div>
                <div className={styles['stat-card']}>
                    <FaShoppingCart  />
                    <div className={styles['stat-info']}>
                        <h3>{stats.total_products}</h3>
                        <p>Товаров</p>
                    </div>
                </div>
            </div>

            <div className={styles['orders-list']}>
                {orders.length === 0 ? (
                    <div className={styles['orders-empty']}>Нет заказов</div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className={styles['order-card']}>
                            <div className={styles['order-header']} onClick={() => toggleOrderExpand(order.id)}>
                                <div className={styles['order-header-main']}>
                                    <div className={styles['order-number']}>Заказ #{order.id}</div>
                                    <div className={styles['order-status']} style={{ background: getStatusColor(order.status) }}>
                                        {order.status_name}
                                    </div>
                                </div>
                                <div className={styles['order-header-secondary']}>
                                    <div className={styles['order-date']}><FaCalendar /> {formatDate(order.dateSozdaniy)}</div>
                                    <div className={styles['order-summary']}>
                                        {order.total_items} товаров на {formatPrice(order.total_amount)}
                                    </div>
                                    {expandedOrderId === order.id ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                            </div>
                            {expandedOrderId === order.id && (
                                <div className={styles['order-details']}>
                                    <div className={styles['order-items']}>
                                        {order.items.map((item) => (
                                            <div key={item.item_id} className={styles['order-item']}>
                                                <div className={styles['item-info']}>
                                                    <span className={styles['item-name']}>{item.product_name}</span>
                                                    <div className={styles['item-details']}>
                                                        <span>{item.quantity} × {formatPrice(item.price)} = {formatPrice(item.item_total)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles['order-total']}>
                                        <div className={styles['total-row']}>
                                            <span>Итого:</span>
                                            <span className={styles['total-amount']}>
                                                {formatPrice(order.total_amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Orders;