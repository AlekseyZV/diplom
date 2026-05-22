import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, 
    FaSearch,
    FaFilter,
    FaPlus,
    FaEdit,
    FaTrash,
    FaTrashRestore,
    FaTrashAlt,
    FaBan
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Hport } from '../PROT.js';
import ProductModal from '../../components/Admin/ProductModal';
import '../../AdminStyle/AdminProducts.css';

const API_BASE_URL = Hport.httpport;
const ITEMS_PER_PAGE = 10;

const AdminProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [showDeleted]);

    useEffect(() => {
        // Сбрасываем пагинацию при изменении фильтров
        setCurrentPage(1);
        filterProducts(1);
    }, [searchTerm, categoryFilter, products, showDeleted]);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const url = `${API_BASE_URL}/admin/products.php${showDeleted ? '?showDeleted=true' : ''}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setProducts(data.products);
            } else {
                setError(data.error || 'Ошибка загрузки товаров');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories.php`);
            const data = await response.json();
            
            if (data.success && data.data) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    };

    const filterProducts = (page = 1) => {
        let filtered = [...products];
        
        // Фильтр по поиску
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(p => 
                p.Name?.toLowerCase().includes(term) ||
                p.opisanie?.toLowerCase().includes(term)
            );
        }
        
        // Фильтр по категории
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.idKategoriy == categoryFilter);
        }
        
        // Пагинация
        const start = 0;
        const end = page * ITEMS_PER_PAGE;
        const paginated = filtered.slice(start, end);
        
        setDisplayedProducts(paginated);
        setHasMore(end < filtered.length);
    };

    const loadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        filterProducts(nextPage);
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleSaveProduct = (data) => {
        fetchProducts(); // Перезагружаем список
    };

    const handleSoftDelete = async (productId, currentStatus) => {
        const action = currentStatus ? 'восстановить' : 'удалить (переместить в корзину)';
        if (!window.confirm(`Вы уверены, что хотите ${action} этот товар?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const response = await fetch(`${API_BASE_URL}/admin/products.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: productId,
                    isDeleted: currentStatus ? 0 : 1
                })
            });

            const data = await response.json();

            if (data.success) {
                fetchProducts(); // Перезагружаем список
                alert(data.message);
            } else {
                alert(data.error || 'Ошибка при обновлении статуса товара');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    };

    const handleHardDelete = async (productId) => {
        if (!window.confirm('Вы уверены, что хотите полностью удалить этот товар? Это действие нельзя отменить!')) {
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const response = await fetch(`${API_BASE_URL}/admin/products.php?id=${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                fetchProducts(); // Перезагружаем список
                alert('Товар полностью удален');
            } else {
                alert(data.error || 'Ошибка при удалении товара');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    };

    const getCategoryName = (categoryId) => {
        if (!categories || categories.length === 0) return 'Загрузка...';
        const category = categories.find(c => c.id === categoryId);
        return category ? category.Name : 'Без категории';
    };

    const formatPrice = (price) => {
        if (!price) return '0.00 ₽';
        return new Intl.NumberFormat('ru-RU', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
        }).format(price) + ' ₽';
    };

    if (loading) return <div className="admin-loading">Загрузка...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-products">
            <div className="admin-header">
                <Link to="/admin" className="back-button">
                    <FaArrowLeft /> На главную админки
                </Link>
                <h1>Управление товарами</h1>
                <div className="header-buttons">
                    <button 
                        className={`toggle-deleted-btn ${showDeleted ? 'active' : ''}`}
                        onClick={() => setShowDeleted(!showDeleted)}
                    >
                        {showDeleted ? 'Скрыть заблокированные товары' : 'Показать заблокированные товары'}
                    </button>
                    <button className="add-product-btn" onClick={handleAddProduct}>
                        <FaPlus /> Добавить товар
                    </button>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск по названию или описанию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-box">
                    <FaFilter className="filter-icon" />
                    <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Все категории</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.Name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-label">Всего товаров:</span>
                    <span className="stat-value">{products.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Отображается:</span>
                    <span className="stat-value">{displayedProducts.length}</span>
                </div>
            </div>

            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Описание</th>
                            <th>Категория</th>
                            <th>Цена</th>
                            <th>В наличии</th>
                            {/*<th>Статус</th>*/}
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedProducts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    Товары не найдены
                                </td>
                            </tr>
                        ) : (
                            displayedProducts.map(product => (
                                <tr key={product.id} className={product.isDeleted ? 'deleted' : ''}>
                                    <td className="product-name-cell">{product.Name}</td>
                                    <td className="text-truncate" title={product.opisanie}>
                                        {product.opisanie || '—'}
                                    </td>
                                    <td>{getCategoryName(product.idKategoriy)}</td>
                                    <td className="price-cell">{formatPrice(product.cena)}</td>
                                    <td className={`stock-cell ${(product.kolichestvo || 0) < 10 ? 'low-stock' : ''}`}>
                                        {product.kolichestvo || 0} шт.
                                    </td>
                                    {/*<td>
                                        {product.isDeleted ? (
                                            <span className="status-badge deleted">В корзине</span>
                                        ) : (
                                            <span className="status-badge active">Активен</span>
                                        )}
                                    </td>*/}
                                    <td>
                                        <div className="action-buttons">
                                            {!product.isDeleted && (
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEditProduct(product)}
                                                    title="Редактировать"
                                                >
                                                    <FaEdit />
                                                </button>
                                            )}
                                            <button
                                                className={product.isDeleted ? 'restore-btn' : 'delete-soft-btn'}
                                                onClick={() => handleSoftDelete(product.id, product.isDeleted)}
                                                title={product.isDeleted ? 'Восстановить' : 'В корзину'}
                                            >
                                                {product.isDeleted ? <FaTrashRestore /> : <FaBan />}
                                            </button>
                                            { 
                                                <button
                                                    className="delete-hard-btn"
                                                    onClick={() => handleHardDelete(product.id)}
                                                    title="Удалить навсегда"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <div className="load-more-container">
                    <button onClick={loadMore} className="load-more-btn">
                        Показать ещё 10
                    </button>
                </div>
            )}

            {showModal && (
                <ProductModal
                    product={editingProduct}
                    categories={categories}
                    onClose={() => setShowModal(false)}
                    onSave={handleSaveProduct}
                />
            )}
        </div>
    );
};

export default AdminProducts;