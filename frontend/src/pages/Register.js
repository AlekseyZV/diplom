// src/pages/Register.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import { Hport } from './PROT.js';

const Register = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        face: '1', // значение по умолчанию
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Очищаем ошибку для поля при изменении
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (apiError) setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Введите ФИО';
        }

        if (!formData.face) {
            newErrors.face = 'Выберите лицо';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Введите email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Введите корректный email';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Введите телефон';
        } else if (!/^[\d\s\-()+]{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Введите корректный телефон';
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
        
        setIsSubmitting(true);
        setApiError('');
        
        try {
            // Используем правильный URL из PROT.js
            const API_BASE_URL = Hport.httpport;
            
            // Формируем данные для отправки
            const requestData = {
                name: formData.name.trim(),
                face: formData.face,
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                password: formData.password
            };
            
            console.log('Отправка данных на регистрацию:', requestData);
            console.log('URL:', `${API_BASE_URL}/api/register`);
            
            // Отправляем запрос
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            console.log('Ответ от сервера:', result);
            
            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }
            
            if (result.success) {
                // Сохраняем данные пользователя в контексте
                const userData = {
                    name: formData.name,
                    face: formData.face,
                    email: formData.email,
                    phone: formData.phone,
                    id: result.id
                };
                
                login(userData);
                alert('Регистрация прошла успешно!');
                navigate('/');
            } else {
                setApiError(result.error || 'Ошибка регистрации');
            }
            
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            setApiError(error.message || 'Ошибка соединения с сервером');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form-wrapper">
                <h2>Регистрация</h2>

                {apiError && (
                    <div className="error-message global-error">
                        {apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            ФИО *
                            <span className="hint">(Фамилия Имя Отчество)</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            placeholder="Иванов Иван Иванович"
                        />
                        {errors.name && (
                            <span className="error-message">
                                {errors.name}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Лицо *
                        </label>
                        <select 
                            name="face" 
                            value={formData.face}
                            onChange={handleChange}
                            className={`form-input ${errors.face ? 'error' : ''}`}
                        >
                            <option value="1">Физическое лицо</option>
                            <option value="2">Юридическое лицо</option>
                        </select>
                        {errors.face && (
                            <span className="error-message">
                                {errors.face}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="example@mail.ru"
                        />
                        {errors.email && (
                            <span className="error-message">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Телефон *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`form-input ${errors.phone ? 'error' : ''}`}
                            placeholder="+7 (999) 123-45-67"
                        />
                        {errors.phone && (
                            <span className="error-message">
                                {errors.phone}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Пароль *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`form-input ${errors.password ? 'error' : ''}`}
                            placeholder="Минимум 6 символов"
                        />
                        {errors.password && (
                            <span className="error-message">
                                {errors.password}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Подтвердите пароль *
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                            placeholder="Повторите пароль"
                        />
                        {errors.confirmPassword && (
                            <span className="error-message">
                                {errors.confirmPassword}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="register-link">
                    <p>
                        Уже есть аккаунт?{' '}
                        <Link to="/login">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;