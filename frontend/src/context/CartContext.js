// src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    // Загружаем корзину из localStorage при инициализации
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                // Проверяем, что это массив
                return Array.isArray(parsedCart) ? parsedCart : [];
            }
        } catch (error) {
            console.error('Ошибка при загрузке корзины из localStorage:', error);
        }
        return [];
    });

    // Сохраняем корзину в localStorage при каждом изменении
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Ошибка при сохранении корзины в localStorage:', error);
        }
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prev => {
            // Проверяем, есть ли товар уже в корзине
            const existingItemIndex = prev.findIndex(item => item.id === product.id);
            
            if (existingItemIndex >= 0) {
                // Увеличиваем количество существующего товара
                const updatedItems = [...prev];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + 1
                };
                return updatedItems;
            } else {
                // Добавляем новый товар с количеством 1
                return [...prev, { ...product, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(id);
            return;
        }
        
        setCartItems(prev => 
            prev.map(item => 
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const increaseQuantity = (id) => {
        setCartItems(prev => 
            prev.map(item => 
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    const decreaseQuantity = (id) => {
        setCartItems(prev => 
            prev.map(item => {
                if (item.id === id) {
                    const newQuantity = item.quantity - 1;
                    if (newQuantity < 1) {
                        return null; // Удалим фильтром
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(item => item !== null)
        );
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );
    };

    const getItemTotal = (item) => {
        return item.price * item.quantity;
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart'); // Очищаем localStorage тоже
    };

    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Дополнительные полезные методы
    const isInCart = (id) => {
        return cartItems.some(item => item.id === id);
    };

    const getItemQuantity = (id) => {
        const item = cartItems.find(item => item.id === id);
        return item ? item.quantity : 0;
    };

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            updateQuantity,
            increaseQuantity,
            decreaseQuantity,
            getTotalPrice,
            getItemTotal,
            clearCart,
            cartItemCount,
            isInCart,
            getItemQuantity
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;