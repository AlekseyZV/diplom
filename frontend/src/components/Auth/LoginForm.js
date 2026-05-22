import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        login({ email: formData.email, name: 'Пользователь' });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ marginBottom: '10px', padding: '10px', width: '100%' }}
            />
            <input
                type="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ marginBottom: '10px', padding: '10px', width: '100%' }}
            />
            <button type="submit" style={{ padding: '10px 20px' }}>Войти</button>
        </form>
    );
};

export default LoginForm;