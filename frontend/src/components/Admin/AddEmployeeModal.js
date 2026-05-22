import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Hport } from '../../pages/PROT.js';
import '../../AdminStyle/AddEmployeeModal.css';

const API_BASE_URL = Hport.httpport;

const AddEmployeeModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        familiy: '',
        imy: '',
        otchestvo: '',
        login: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

        if (!formData.familiy.trim()) newErrors.familiy = 'Введите фамилию';
        if (!formData.imy.trim()) newErrors.imy = 'Введите имя';
        if (!formData.otchestvo.trim()) newErrors.otchestvo = 'Введите отчество';
        
        if (!formData.login.trim()) {
            newErrors.login = 'Введите email';
        } else if (!/\S+@\S+\.\S+/.test(formData.login)) {
            newErrors.login = 'Введите корректный email';
        }

        if (!formData.password) {
            newErrors.password = 'Введите пароль';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен быть минимум 6 символов';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
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
            
            const response = await fetch(`${API_BASE_URL}/admin/users.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                onAdd({
                    ...data,
                    familiy: formData.familiy,
                    imy: formData.imy,
                    otchestvo: formData.otchestvo,
                    login: formData.login,
                    phone: formData.phone,
                    role: 2,
                    dataRegistraciy: new Date().toISOString().split('T')[0],
                    isBlocked: 0
                });
                onClose();
            } else {
                alert(data.error || 'Ошибка при добавлении сотрудника');
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
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Добавление нового сотрудника</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Фамилия *</label>
                        <input
                            type="text"
                            name="familiy"
                            value={formData.familiy}
                            onChange={handleChange}
                            className={errors.familiy ? 'error' : ''}
                        />
                        {errors.familiy && <span className="error-message">{errors.familiy}</span>}
                    </div>

                    <div className="form-group">
                        <label>Имя *</label>
                        <input
                            type="text"
                            name="imy"
                            value={formData.imy}
                            onChange={handleChange}
                            className={errors.imy ? 'error' : ''}
                        />
                        {errors.imy && <span className="error-message">{errors.imy}</span>}
                    </div>

                    <div className="form-group">
                        <label>Отчество *</label>
                        <input
                            type="text"
                            name="otchestvo"
                            value={formData.otchestvo}
                            onChange={handleChange}
                            className={errors.otchestvo ? 'error' : ''}
                        />
                        {errors.otchestvo && <span className="error-message">{errors.otchestvo}</span>}
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            className={errors.login ? 'error' : ''}
                        />
                        {errors.login && <span className="error-message">{errors.login}</span>}
                    </div>

                    <div className="form-group">
                        <label>Телефон</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="89991234567"
                        />
                    </div>

                    <div className="form-group">
                        <label>Пароль *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label>Подтвердите пароль *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={errors.confirmPassword ? 'error' : ''}
                        />
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Добавление...' : 'Добавить сотрудника'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;