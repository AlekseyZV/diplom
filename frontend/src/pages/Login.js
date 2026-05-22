// src/pages/Login.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { Hport } from './PROT.js';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Простая валидация
        if (!formData.email || !formData.password) {
            setError('Заполните все поля');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const API_BASE_URL = Hport.httpport;
            
            /*const response = await fetch(
                `${API_BASE_URL}/api/login`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password
                })
            });*/
            // Вместо `${API_BASE_URL}/api/login` используйте прямой путь
const response = await fetch(`${API_BASE_URL}/login.php`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        email: formData.email.trim(),
        password: formData.password
    })
});

            const result = await response.json();
            
            if (!response.ok) {
                setError(result.error || 'Ошибка авторизации');
                return;
            }

            // Успешный вход
            const user = result.user;
            login({
                id: user.id,
                name: `${user.familiy} ${user.imy} ${user.otchestvo}`.trim(),
                email: user.login,
                phone: user.phone,
                role: user.role,
                status: user.status,
                token: result.token,
                dataRegistraciy: user.dataRegistraciy
            });

            // Перенаправление
            navigate('/');
            
        } catch (error) {
            console.error('Ошибка при входе:', error);
            setError('Ошибка соединения с сервером');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-wrapper">
                <h2>Вход в систему</h2>
                
                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            placeholder="example@mail.ru"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Пароль
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            placeholder="Введите пароль"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                <div className="login-link">
                    <p>
                        Нет аккаунта?{' '}
                        <Link to="/register">
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
                   {/*<p>
                        <Link to="/forgot-password">
                            Забыли пароль?
                        </Link>
                    </p>*/}
                
            </div>
        </div>
    );
};

export default Login;