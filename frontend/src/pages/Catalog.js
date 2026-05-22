// src/pages/Catalog.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/pagesCatalog.css';
import  {Hport} from './PROT.js';
import { useNavigate } from 'react-router-dom';


// Изображения
import filter from './Logo/filter1.png';

const DEFAULT_PRODUCT_IMAGE = '../../public/images/products/picture.png';

const API_BASE_URL = Hport.httpport;

const Catalog = () => {
    
    const { addToCart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [visibleProductsCount, setVisibleProductsCount] = useState(24);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);

    const navigate = useNavigate();

    const handleClick = (id) => {
        navigate(`/catalog/${id}`);
    };

    // Функция для получения корректного URL изображения
    const getImageUrl = (imagePath) => {
        if (!imagePath) return DEFAULT_PRODUCT_IMAGE;
        
        // Если путь уже полный URL
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // Если путь начинается с /, оставляем как есть
        if (imagePath.startsWith('/')) {
            return imagePath;
        }
        
        // Если относительный путь, добавляем базовый
        return `/images/products/${imagePath}`;
    };

    const fetchProducts = async () => {
    try {
        setLoading(true);
        const params = new URLSearchParams({
            search: searchQuery,
            category: selectedCategory,
            limit: visibleProductsCount,
            page: 1
        });

        // Пробуем разные варианты URL
        const urls = [
            //`${API_BASE_URL}/api/products?${params}`,
            //`${API_BASE_URL}/api/products`,
            `${API_BASE_URL}/products.php?${params}`,
            `${API_BASE_URL}/products.php`
        ];
        
        let response = null;
        let data = null;
        let lastError = null;
        
        // Пробуем все URL пока один не сработает
        for (const url of urls) {
            try {
                console.log('Пробуем URL:', url);
                response = await fetch(url);
                console.log('Статус для', url, ':', response.status);
                
                if (response.ok) {
                    data = await response.json();
                    console.log('Успех! Данные от', url, ':', data);
                    break;
                }
            } catch (error) {
                lastError = error;
                console.log('Ошибка для', url, ':', error.message);
                continue;
            }
        }
        
        if (!data) {
            throw new Error(lastError || 'Все URL не сработали');
        }
        
        if (data.success) {
            setProducts(data.data.products);
            setTotalProducts(data.data.pagination.total);
        } else {
            console.error('Ошибка API:', data.error);
        }
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
        } finally {
            setLoading(false);
        }
    };

    // Загрузка категорий
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories.php`);
            const data = await response.json();
            
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, selectedCategory, visibleProductsCount]);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Определяем мобильное устройство
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Сбрасываем пагинацию при изменении фильтров
    useEffect(() => {
        setVisibleProductsCount(24);
    }, [searchQuery, selectedCategory]);

    // Функция для загрузки больше товаров
    const loadMoreProducts = () => {
        setVisibleProductsCount(prevCount => prevCount + 12);
    };
    
    // Проверяем, есть ли еще товары для загрузки
    const hasMoreProducts = products.length < totalProducts;

    // Функция для применения фильтра
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        window.scrollTo({
           top: 0,
           behavior: 'smooth' 
        });
    };

    // Функция сброса фильтров
    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setVisibleProductsCount(24);
    };

    // Группировка категорий (адаптируйте под вашу структуру)
    const productionCategories = categories.filter(cat => cat.id <= 14);
    const cateringCategories = categories.filter(cat => cat.id >= 15);

    return (
        <div className="catalog-page">
            {/* Поле поиска */}
            <div className="search-container">
                <div className="search-input-wrapper">
                    <input 
                        type="text"
                        placeholder="Поиск по названию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
            </div>
            
            <h2 className='h2-zagalovok'>Каталог товаров</h2>
            
            <div className="catalog-container">
                {/* Левая часть: Фильтры */}
                <aside className={`filters-sidebar ${isFiltersExpanded ? 'expanded' : ''}`}>
                    <button 
                        className="filter-toggle-btn"
                        onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                    >
                        {isFiltersExpanded ? '✕' : (<img src={filter} alt='Фильтр' style={{width: '32px', height: '32px'}}/>)}
                    </button>
                    
                    <div className="filters-content">
                        <div className="filters-card">
                            <div className="filter-section">
                                <h3>Сырье и ингредиенты для производств</h3>
                                <div className="filter-categories">
                                    <button
                                        key="all-production"
                                        className={`filter-category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                                        onClick={() => handleCategorySelect('all')}
                                    >
                                        Все категории
                                    </button>
                                    {productionCategories.map(category => (
                                        <button
                                            key={category.id}
                                            className={`filter-category-btn ${selectedCategory === category.id.toString() ? 'active' : ''}`}
                                            onClick={() => handleCategorySelect(category.id)}
                                        >
                                            {category.Name}
                                        </button>
                                    ))}
                                </div>
                                
                                <h3>Для предприятий общественного питания и магазинов</h3>
                                <div className="filter-categories">
                                    <button
                                        key="all-catering"
                                        className={`filter-category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                                        onClick={() => handleCategorySelect('all')}
                                    >
                                        Все категории
                                    </button>
                                    {cateringCategories.map(category => (
                                        <button
                                            key={category.id}
                                            className={`filter-category-btn ${selectedCategory === category.id.toString() ? 'active' : ''}`}
                                            onClick={() => handleCategorySelect(category.id)}
                                        >
                                            {category.Name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Статистика */}
                            <div className="filter-stats">
                                <p>Найдено товаров: {totalProducts}</p>
                                <p>Показано: {products.length}</p>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={handleResetFilters}
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        width: '100%'
                                    }}
                                >
                                    Сбросить фильтры
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
                
                {/* Правая часть: Товары */}
                <main className="products-main">
                    {/* Кнопка открытия фильтров на мобильных */}
                    {isMobile && !isFiltersExpanded && (
                        <button 
                            className="mobile-filter-toggle"
                            onClick={() => setIsFiltersExpanded(true)}
                        >
                            <img 
                                src={filter} 
                                alt='Фильтр' 
                                loading="lazy"
                                style={{width: '20px', height: '20px', marginRight: '8px'}}/>
                            Фильтры
                        </button>
                    )}
                    
                    {loading ? (
                        <div className="loading-container">
                            <p>Загрузка товаров...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="no-products">
                            <p>Товары по вашему запросу не найдены</p>
                            <button 
                                className="btn btn-primary"
                                onClick={handleResetFilters}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px'
                                }}
                            >
                                Показать все товары
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="products-grid">
                                {products.map(product => (
                                    <div key={product.id} className="product-card">
                                        <div className="product-info">
                                            <img 
                                                alt={product.name} 
                                                src={getImageUrl(product.image)} 
                                                className='product-img' 
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = DEFAULT_PRODUCT_IMAGE;
                                                }}
                                            />
                                            <h3 className="product-title">{product.name}</h3>
                                        </div>
                                        <p className="product-price">
                                            {product.formatted_price ? `${product.formatted_price}` : 'Цена не указана'}
                                        </p>
                                        <button 
                                            onClick={() => handleClick(product.id)}
                                            className="btn btn-primary"
                                            style={{
                                                padding: '10px',
                                                margin: '0px 0px 2px 0px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Подробнее
                                        </button>
                                        <button 
                                            onClick={() => addToCart(product)}
                                            className="btn btn-primary add-to-cart-btn"
                                            style={{
                                                padding: '10px',
                                                margin: '2px 0px 0px 0px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            В корзину
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            
                            {/* Кнопка "Показать ещё" */}
                            {hasMoreProducts && (
                                <div className="load-more-container">
                                    <button 
                                        onClick={loadMoreProducts}
                                        className="btn btn-secondary"
                                        style={{
                                            padding: '12px 30px',
                                            fontSize: '16px',
                                            backgroundColor: '#f8f9fa',
                                            color: '#333',
                                            border: '1px solid #ddd',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = '#e9ecef';
                                            e.target.style.borderColor = '#007bff';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = '#f8f9fa';
                                            e.target.style.borderColor = '#ddd';
                                        }}
                                    >
                                        Показать ещё ({totalProducts - products.length})
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
            
            {/* Оверлей для закрытия фильтров на мобильных */}
            {isMobile && isFiltersExpanded && (
                <div 
                    className="filters-overlay"
                    onClick={() => setIsFiltersExpanded(false)}
                />
            )}
        </div>
    );
};

export default Catalog;