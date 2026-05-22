// src/pages/Checkout.js
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Checkout.css';
import {Hport} from './PROT.js';

// Добавьте вверху файла после импортов
const API_BASE_URL = Hport.httpport;

const Checkout = () => {
    const { cartItems, getTotalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        deliveryType: 'pickup',
        paymentType: 'cash'
    });
    
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Очищаем ошибку при изменении
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Введите ФИО';
        if (!formData.email.trim()) newErrors.email = 'Введите email';
        if (!formData.phone.trim()) newErrors.phone = 'Введите телефон';
        if (!formData.address.trim() && formData.deliveryType !== 'pickup') {
            newErrors.address = 'Введите адрес доставки';
        }

        return newErrors;
    };

    // В Checkout.js временно измените handleSubmit:

const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    try {
        // Подготавливаем данные для отправки
        const orderData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            cartItems: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            deliveryType: formData.deliveryType,
            paymentType: formData.paymentType,
            total: getTotalPrice()
        };

        console.log('Отправляем данные заказа:', orderData);
        
        // ТЕСТ 1: Пробуем разные URL
        const testUrls = [
            `${API_BASE_URL}/api/checkout`,
            `${API_BASE_URL}/checkout.php`,
            `http://192.168.0.109/zavedeev/Yrprod_kurs/backend/api/checkout`,
            `http://192.168.0.109/zavedeev/Yrprod_kurs/backend/checkout.php`,
            `http://192.168.0.109/zavedeev/Yrprod_kurs/backend/checkout_debug.php`
        ];
        
        let response = null;
        let result = null;
        let lastError = null;
        
        // Пробуем все URL
        for (const url of testUrls) {
            try {
                console.log(`Пробуем URL: ${url}`);
                
                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData)
                });
                
                console.log(`Статус для ${url}:`, response.status);
                
                // Пробуем прочитать ответ
                const text = await response.text();
                console.log(`Ответ от ${url}:`, text.substring(0, 200));
                
                try {
                    result = JSON.parse(text);
                    console.log(`JSON успешно распарсен для ${url}:`, result);
                    
                    // Если получили ответ - выходим из цикла
                    break;
                } catch (parseError) {
                    console.error(`Ошибка парсинга JSON для ${url}:`, parseError);
                    continue;
                }
                
            } catch (error) {
                lastError = error;
                console.error(`Ошибка для ${url}:`, error.message);
                continue;
            }
        }
        
        if (!result) {
            throw new Error(lastError || 'Все URL не сработали');
        }

        if (result.success) {
            // Очищаем корзину и показываем сообщение
            clearCart();
            alert(`✅ Заказ успешно оформлен! Номер заказа: ${result.data?.orderId || 'не указан'}`);
            navigate('/');
        } else {
            alert(`❌ Ошибка: ${result.error || 'Неизвестная ошибка'}`);
        }
    } catch (error) {
        console.error('Полная ошибка оформления заказа:', error);
        console.error('Сообщение ошибки:', error.message);
        console.error('Stack trace:', error.stack);
        
        // Более информативное сообщение
        alert(`🚨 Произошла ошибка при оформлении заказа: ${error.message}\n\nПроверьте консоль (F12) для подробностей.`);
    }
};


    if (cartItems.length === 0) {
        return (
            <div className="checkout-empty">
                <h2>Корзина пуста</h2>
                <p>Добавьте товары для оформления заказа</p>
                <button 
                    onClick={() => navigate('/catalog')}
                    className="btn btn-primary"
                >
                    Вернуться в каталог
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            {/* Левая часть: Форма */}
            <div className="checkout-form-section">
                <h2>Оформление заказа</h2>
                
                <form onSubmit={handleSubmit} className="checkout-form">
                    <div className="form-section">
                        <h3>Контактная информация</h3>
                        
                        <div className="form-group">
                            <label>
                                ФИО *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'form-input error' : 'form-input'}
                            />
                            {errors.name && (
                                <span className="error-text">
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'form-input error' : 'form-input'}
                            />
                            {errors.email && (
                                <span className="error-text">
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>
                                Телефон *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={errors.phone ? 'form-input error' : 'form-input'}
                            />
                            {errors.phone && (
                                <span className="error-text">
                                    {errors.phone}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Способ доставки</h3>
                        
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="deliveryType"
                                    value="pickup"
                                    checked={formData.deliveryType === 'pickup'}
                                    onChange={handleChange}
                                />
                                Самовывоз
                            </label>
                            
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="deliveryType"
                                    value="delivery"
                                    checked={formData.deliveryType === 'delivery'}
                                    onChange={handleChange}
                                />
                                Курьерская доставка
                            </label>
                        </div>

                        {formData.deliveryType === 'delivery' && (
                            <div className="form-group">
                                <label>
                                    Адрес доставки *
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className={errors.address ? 'form-input error' : 'form-input'}
                                />
                                {errors.address && (
                                    <span className="error-text">
                                        {errors.address}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="form-section">
                        <h3>Способ оплаты</h3>
                        
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="cash"
                                    checked={formData.paymentType === 'cash'}
                                    onChange={handleChange}
                                />
                                Наличными при получении
                            </label>
                            
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="card"
                                    checked={formData.paymentType === 'card'}
                                    onChange={handleChange}
                                />
                                Банковской картой
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="confirm-button"
                    >
                        Подтвердить заказ
                    </button>
                </form>
            </div>

            {/* Правая часть: Информация о заказе */}
            <div className="checkout-summary-section">
                <div className="checkout-summary">
                    <h3>Ваш заказ</h3>
                    
                    <div className="order-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="order-item">
                                <span>
                                    {item.name} × {item.quantity}
                                </span>
                                <span>
                                    {(item.price * item.quantity).toFixed(2)} ₽
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="order-total">
                        <div className="total-row">
                            <span>Итого:</span>
                            <span>{getTotalPrice().toFixed(2)} ₽</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;