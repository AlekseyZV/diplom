import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Hport } from './PROT.js';
import '../styles/ProductDetail.css';  // ← импортируем новый CSS

const API_BASE_URL = Hport.httpport;
const DEFAULT_PRODUCT_IMAGE = '/images/products/picture.png';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return DEFAULT_PRODUCT_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return `/images/products/${imagePath}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/products.php?id=${id}`);
        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
        } else {
          setError(data.error || 'Товар не найден');
        }
      } catch (err) {
        setError('Ошибка загрузки товара');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      alert(`Товар "${product.name}" добавлен в корзину в количестве ${quantity} шт.`);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 999) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 999));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  if (loading) return <div className="DDproduct-loading">Загрузка...</div>;
  if (error) return <div className="DDproduct-error">{error}</div>;
  if (!product) return <div className="DDproduct-not-found">Товар не найден</div>;

  return (
    <div className="DDproduct-page">
      <div className="DDproduct-container">
        {/* Левая колонка - изображение */}
        <div className="DDproduct-gallery">
          <div className="DDproduct-main-image">
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_PRODUCT_IMAGE;
              }}
            />
          </div>
        </div>

        {/* Правая колонка - информация */}
        <div className="DDproduct-info">
          <h1 className="DDproduct-title">{product.name}</h1>
          
          {product.category_name && (
            <div className="DDproduct-category">
              Категория: <span>{product.category_name}</span>
            </div>
          )}
          
          <div>
            <div className="DDproduct-price">
             Цена: {product.formatted_price || `${product.price} ₽`}
            </div>
          </div>

          {product.kolichestvo !== undefined && (
            <div className="DDproduct-stock">
              <strong>В наличии:</strong>{' '}
              {product.kolichestvo > 0 ? (
                <span className="DDin-stock">{product.kolichestvo} шт.</span>
              ) : (
                <span className="DDout-of-stock">Нет в наличии</span>
              )}
            </div>
          )}

          {product.opisanie && (
            <div className="DDproduct-description">
              <h3>Описание:</h3>
              <p>{product.opisanie}</p>
            </div>
          )}

          {/* Блок количества и кнопок */}
          <div className="DDproduct-actions">
            <div className="DDquantity-selector">
              <button 
                className="DDquantity-btn" 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                className="DDquantity-input"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max="999"
              />
              <button 
                className="DDquantity-btn" 
                onClick={incrementQuantity}
                disabled={quantity >= 999}
              >
                +
              </button>
            </div>

            <button 
              className="DDbtn-add-to-cart"
              onClick={handleAddToCart}
              disabled={product.kolichestvo === 0}
            >
              В корзину
            </button>

            <button 
              className="DDbtn-back-to-catalog"
              onClick={() => navigate('/catalog')}
            >
              Назад в каталог
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;