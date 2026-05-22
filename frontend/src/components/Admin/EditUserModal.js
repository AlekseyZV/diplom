import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Hport } from '../../pages/PROT.js';
import '../../AdminStyle/AddEmployeeModal.css';

const API_BASE_URL = Hport.httpport;

const EditUserModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        familiy: '',
        imy: '',
        otchestvo: '',
        login: '',
        phone: '',
        role: '',
        status: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                familiy: user.familiy || '',
                imy: user.imy || '',
                otchestvo: user.otchestvo || '',
                login: user.login || '',
                phone: user.phone || '',
                role: user.role || '',
                status: user.status || '',
                password: ''
            });
        }
    }, [user]);

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
        
        if (!formData.login.trim()) {
            newErrors.login = 'Введите email';
        } else if (!/\S+@\S+\.\S+/.test(formData.login)) {
            newErrors.login = 'Введите корректный email';
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
            
            const updateData = {
                id: user.id,
                familiy: formData.familiy,
                imy: formData.imy,
                otchestvo: formData.otchestvo,
                login: formData.login,
                phone: formData.phone,
                role: formData.role,
                status: formData.status
            };

            if (formData.password.trim()) {
                updateData.password = formData.password;
            }

            const response = await fetch(`${API_BASE_URL}/admin/users.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (data.success) {
                onUpdate({
                    ...user,
                    ...updateData,
                    password: undefined
                });
                // Закрываем модальное окно после успешного обновления
                onClose();
            } else {
                alert(data.error || 'Ошибка при обновлении пользователя');
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
                    <h2>Редактирование пользователя</h2>
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
                        <label>Отчество</label>
                        <input
                            type="text"
                            name="otchestvo"
                            value={formData.otchestvo}
                            onChange={handleChange}
                        />
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
                        <label>Роль</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="1">Администратор</option>
                            <option value="2">Сотрудник</option>
                            <option value="3">Покупатель</option>
                            <option value="4">Гость</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Статус</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="1">Физическое лицо</option>
                            <option value="2">Юридическое лицо</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Новый пароль (оставьте пустым, если не хотите менять)</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Минимум 6 символов"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;