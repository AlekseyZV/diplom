// src/pages/Cart.js
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import '../styles/Cart.css';

const Cart = () => {
    const { 
        cartItems, 
        getTotalPrice, 
        getItemTotal,
        increaseQuantity, 
        decreaseQuantity, 
        removeFromCart,
        clearCart 
    } = useCart();
    
    if (cartItems.length === 0) {
        return (
            <div className="cart-empty">
                <h2>Корзина пуста</h2>
                <p>Добавьте товары из каталога</p>
                <Link 
                    to="/catalog" 
                    className="btn btn-primary"
                >
                    Перейти в каталог
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <div className="cart-container">
                {/* Левая часть: Список товаров */}
                <div className="cart-items-main">
                    <h2>Ваша корзина</h2>
                    <div className="cart-items-list">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item-card">
                                {/* Информация о товаре */}
                                <div className='korz-mom'>
                                    <div className='img-product'>
                                        <img alt={item.name} src={item.image || ''} />
                                    </div>
                                    <div className="cart-item-info">
                                        <h3 className="cart-item-title">{item.name}</h3>
                                        <p className="cart-item-category">
                                            Категория: {item.category}
                                        </p>
                                        <p className="cart-item-price">
                                            {item.price} ₽ / шт.
                                        </p>
                                    </div>
                                </div>
                                {/* Управление количеством */}
                                <div className='cart-item-quantity-center'>
                                    <div className="cart-item-quantity">
                                        <button 
                                            onClick={() => decreaseQuantity(item.id)}
                                            className="quantity-btn"
                                        >
                                            -
                                        </button>
                                        
                                        <span className="quantity-display">
                                            {item.quantity}
                                        </span>
                                        
                                        <button 
                                            onClick={() => increaseQuantity(item.id)}
                                            className="quantity-btn"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Общая цена за товар */}
                                <div className="cart-item-total">
                                    <span className="total-price">
                                        {getItemTotal(item).toFixed(2)} ₽
                                    </span>
                                </div>
                                
                                {/* Кнопка удаления */}
                                <div className="cart-item-actions">
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="btn btn-danger"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Кнопка очистки корзины */}
                    <div style={{ marginTop: '20px' }}>
                        <button 
                            onClick={clearCart}
                            className="btn btn-secondary"
                        >
                            Очистить всю корзину
                        </button>
                    </div>
                </div>
                
                {/* Правая часть: Оформление заказа */}
                <div className="order-summary-sidebar">
                    <div className="order-summary">
                        <h3>Оформление заказа</h3>
                        
                        {/* Итоговая информация */}
                        <div className="order-details">
                            <div className="order-row">
                                <span>Товаров:</span>
                                <span>{cartItems.reduce((total, item) => total + item.quantity, 0)} шт.</span>
                            </div>
                            
                            <div className="order-row">
                                <span>Общая сумма:</span>
                                <span className="total-amount">{getTotalPrice().toFixed(2)} ₽</span>
                            </div>
                        </div>
                        
                        {/* Кнопка оформления */}
                        <Link 
                            to="/checkout"
                            className="checkout-btn"
                        >
                            Оформить заказ
                        </Link>
                        
                        <p className="order-terms">
                            Нажимая кнопку, вы соглашаетесь с условиями покупки
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;