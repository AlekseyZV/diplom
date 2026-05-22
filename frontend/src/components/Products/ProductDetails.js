import React from 'react';
import { useCart } from '../../context/CartContext';

const ProductDetails = ({ product }) => {
    const { addToCart } = useCart();

    if (!product) return <div>Товар не найден</div>;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px',
            padding: '20px'
        }}>
            <div>
                <div style={{
                    width: '100%',
                    height: '300px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    Изображение товара
                </div>
            </div>
            
            <div>
                <h1>{product.name}</h1>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '15px 0' }}>
                    {product.price} ₽
                </p>
                <p style={{ marginBottom: '20px' }}>{product.description}</p>
                
                <div style={{ marginBottom: '20px' }}>
                    <p><strong>Категория:</strong> {product.category}</p>
                    <p><strong>Поставщик:</strong> {product.supplier}</p>
                    <p><strong>Наличие:</strong> {product.inStock ? 'В наличии' : 'Нет в наличии'}</p>
                </div>
                
                <button
                    onClick={() => addToCart(product)}
                    style={{
                        padding: '12px 30px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    Добавить в корзину
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;