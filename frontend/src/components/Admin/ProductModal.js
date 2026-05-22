import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Hport } from '../../pages/PROT.js';
import '../../AdminStyle/ProductModal.css';

const API_BASE_URL = Hport.httpport;

const ProductModal = ({ product, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        Name: '',
        opisanie: '',
        kolichestvo: '',
        idKategoriy: '',
        cena: '',
        image: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            // Режим редактирования
            setFormData({
                Name: product.Name || '',
                opisanie: product.opisanie || '',
                kolichestvo: product.kolichestvo || '',
                idKategoriy: product.idKategoriy || '',
                cena: product.cena || '',
                image: product.image || ''
            });
        } else {
            // Режим добавления
            setFormData({
                Name: '',
                opisanie: '',
                kolichestvo: '',
                idKategoriy: '',
                cena: '',
                image: ''
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.Name.trim()) {
            newErrors.Name = 'Введите название товара';
        }

        if (!formData.idKategoriy) {
            newErrors.idKategoriy = 'Выберите категорию';
        }

        if (!formData.cena) {
            newErrors.cena = 'Введите цену';
        } else if (isNaN(formData.cena) || parseFloat(formData.cena) <= 0) {
            newErrors.cena = 'Введите корректную цену';
        }

        if (formData.kolichestvo && (isNaN(formData.kolichestvo) || parseInt(formData.kolichestvo) < 0)) {
            newErrors.kolichestvo = 'Введите корректное количество';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const url = product 
                ? `${API_BASE_URL}/admin/products.php`
                : `${API_BASE_URL}/admin/products.php`;
            
            const method = product ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(product ? { ...formData, id: product.id } : formData)
            });

            const data = await response.json();

            if (data.success) {
                onSave(data);
                onClose();
            } else {
                alert(data.error || 'Ошибка при сохранении товара');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content product-modal">
                <div className="modal-header">
                    <h2>{product ? 'Редактирование товара' : 'Добавление нового товара'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Название товара *</label>
                        <input
                            type="text"
                            name="Name"
                            value={formData.Name}
                            onChange={handleChange}
                            className={errors.Name ? 'error' : ''}
                            placeholder="Введите название товара"
                        />
                        {errors.Name && <span className="error-message">{errors.Name}</span>}
                    </div>

                    <div className="form-group">
                        <label>Категория *</label>
                        <select
                            name="idKategoriy"
                            value={formData.idKategoriy}
                            onChange={handleChange}
                            className={errors.idKategoriy ? 'error' : ''}
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.Name}
                                </option>
                            ))}
                        </select>
                        {errors.idKategoriy && <span className="error-message">{errors.idKategoriy}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Цена *</label>
                            <input
                                type="number"
                                name="cena"
                                value={formData.cena}
                                onChange={handleChange}
                                className={errors.cena ? 'error' : ''}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                            {errors.cena && <span className="error-message">{errors.cena}</span>}
                        </div>

                        <div className="form-group">
                            <label>Количество на складе</label>
                            <input
                                type="number"
                                name="kolichestvo"
                                value={formData.kolichestvo}
                                onChange={handleChange}
                                className={errors.kolichestvo ? 'error' : ''}
                                placeholder="0"
                                min="0"
                            />
                            {errors.kolichestvo && <span className="error-message">{errors.kolichestvo}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Описание</label>
                        <textarea
                            name="opisanie"
                            value={formData.opisanie}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Введите описание товара"
                        />
                    </div>

                    <div className="form-group">
                        <label>Путь к изображению</label>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="Например: /images/product.jpg"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Сохранение...' : (product ? 'Сохранить изменения' : 'Добавить товар')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;