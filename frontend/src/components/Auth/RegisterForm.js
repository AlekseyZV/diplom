import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        login({ email: formData.email, name: formData.name });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Имя"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ marginBottom: '10px', padding: '10px', width: '100%' }}
            />
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
            <button type="submit" style={{ padding: '10px 20px' }}>Зарегистрироваться</button>
        </form>
    );
};

export default RegisterForm;