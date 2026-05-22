import React from 'react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center'
        }}>
            <h3 style={{ marginBottom: '10px' }}>{product.name}</h3>
            <p style={{ color: '#666', marginBottom: '10px' }}>{product.description}</p>
            <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>{product.price} ₽</p>
            <button
                onClick={() => addToCart(product)}
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                В корзину
            </button>
        </div>
    );
};

export default ProductCard;