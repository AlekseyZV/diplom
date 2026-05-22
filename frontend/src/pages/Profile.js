// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Profile.css';
import { Hport } from './PROT.js';

const API_BASE_URL = Hport.httpport;

const Profile = () => {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        familiy: '',
        imy: '',
        otchestvo: '',
        dateRojdeniy: '',
        phone: '',
        login: '',
        password: '',
        confirmPassword: ''
    });
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [roleName, setRoleName] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);

    // Загружаем данные профиля с сервера только один раз при монтировании
    useEffect(() => {
        if (user && user.id) {
            fetchUserProfile();
        } else {
            setProfileLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // Пустой массив зависимостей - выполняется только при монтировании

    const fetchUserProfile = async () => {
        if (!user || !user.id) {
            setProfileLoading(false);
            return;
        }

        console.log('🔄 Начинаем загрузку профиля для пользователя ID:', user.id);

        const testUrls = [
            `${API_BASE_URL}/profile.php?id=${user.id}`,
            `${API_BASE_URL}/api/profile?id=${user.id}`,
        ];

        let profileFound = false;

        for (const url of testUrls) {
            try {
                console.log(`🔄 Пробуем URL: ${url}`);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                console.log(`📊 Статус ответа: ${response.status} ${response.statusText}`);

                if (!response.ok) {
                    console.log(`❌ HTTP ошибка ${response.status}, пробуем следующий URL`);
                    continue;
                }

                const text = await response.text();
                console.log('📄 Полный ответ от сервера:', text);

                try {
                    const result = JSON.parse(text);
                    console.log('📊 Парсинг JSON успешен:', result);
                    
                    if (result.success && result.user) {
                        const userData = result.user;
                        console.log('✅ Данные пользователя получены:', userData);
                        
                        // Форматируем дату рождения для input type="date"
                        let formattedDateRojdeniy = '';
                        if (userData.dateRojdeniy) {
                            // Преобразуем дату из формата "YYYY-MM-DD" для input
                            const date = new Date(userData.dateRojdeniy);
                            if (!isNaN(date.getTime())) {
                                formattedDateRojdeniy = date.toISOString().split('T')[0];
                            }
                        }
                        
                        setFormData({
                            familiy: userData.familiy || '',
                            imy: userData.imy || '',
                            otchestvo: userData.otchestvo || '',
                            dateRojdeniy: formattedDateRojdeniy || '',
                            phone: userData.phone ? userData.phone.toString() : '',
                            login: userData.login || '',
                            password: '',
                            confirmPassword: ''
                        });
                        
                        setRoleName(userData.role_name || 'Покупатель');
                        
                        // Обновляем контекст auth ОДИН РАЗ, без loop
                        login({ ...user, ...userData });
                        
                        profileFound = true;
                        setProfileLoading(false);
                        break;
                    }
                } catch (parseError) {
                    console.error('❌ Ошибка парсинга JSON:', parseError, 'Текст:', text);
                }
            } catch (fetchError) {
                console.error('❌ Ошибка fetch:', fetchError);
            }
        }
        
        if (!profileFound) {
            setErrors({ general: 'Не удалось загрузить профиль. Проверьте соединение или сервер.' });
            setProfileLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Изменение поля ${name}: новое значение ${value}`); // Дебаг для проверки ввода
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.familiy.trim()) newErrors.familiy = 'Введите фамилию';
        if (!formData.imy.trim()) newErrors.imy = 'Введите имя';
        if (!formData.otchestvo.trim()) newErrors.otchestvo = 'Введите отчество';
        if (!formData.phone.trim()) newErrors.phone = 'Введите телефон';
        if (!formData.login.trim()) newErrors.login = 'Введите email';
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.login)) newErrors.login = 'Некорректный email';
        
        const phoneRegex = /^[\d\+\-\(\)\s]{10,15}$/;
        if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Некорректный телефон';
        
        if (formData.password) {
            if (formData.password.length < 6) newErrors.password = 'Пароль минимум 6 символов';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
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

        setIsLoading(true);
        
        try {
            const updateData = {
                id: user.id,
                familiy: formData.familiy.trim(),
                imy: formData.imy.trim(),
                otchestvo: formData.otchestvo.trim(),
                dateRojdeniy: formData.dateRojdeniy,
                phone: formData.phone.trim(),
                login: formData.login.trim(),
            };
            
            if (formData.password) {
                updateData.password = formData.password;
            }

            const urls = [
                `${API_BASE_URL}/profile.php`,
                `${API_BASE_URL}/api/profile`,
            ];

            let success = false;
            for (const url of urls) {
                console.log(`🔄 Пробуем POST на URL: ${url}`);
                console.log('📤 Данные для отправки:', JSON.stringify(updateData));
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                }).catch(fetchError => {
                    console.error('❌ Fetch ошибка:', fetchError.message);
                    throw fetchError;
                });

                console.log(`📊 Статус ответа POST: ${response.status} ${response.statusText}`);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Сервер вернул ошибку:', errorText);
                    continue;
                }

                const text = await response.text();
                console.log('📄 Полный ответ POST:', text);

                const result = JSON.parse(text);
                console.log('📊 Парсинг JSON POST:', result);
                
                if (result.success) {
                    // Обновляем контекст и локальный state
                    const updatedUser = { ...user, ...result.user };
                    login(updatedUser);
                    setFormData({
                        ...formData,
                        familiy: result.user.familiy || '',
                        imy: result.user.imy || '',
                        otchestvo: result.user.otchestvo || '',
                        dateRojdeniy: result.user.dateRojdeniy ? new Date(result.user.dateRojdeniy).toISOString().split('T')[0] : '',
                        phone: result.user.phone ? result.user.phone.toString() : '',
                        login: result.user.login || '',
                        password: '',
                        confirmPassword: ''
                    });
                    setRoleName(result.user.role_name || 'Покупатель');
                    setIsEditing(false);
                    success = true;
                    break;
                }
            }

            if (!success) throw new Error('Обновление не удалось - сервер не вернул success');
        } catch (error) {
            console.error('❌ Полная ошибка в handleSubmit:', error);
            setErrors({ general: 'Не удалось обновить профиль. Ошибка: ' + error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        
        try {
            const deleteData = {
                operation: 'block',  // Изменено с 'delete' на 'block'
                id: user.id
            };

            const urls = [
                `${API_BASE_URL}/profile.php`,
                `${API_BASE_URL}/api/profile`
            ];

            let success = false;
            for (const url of urls) {
                console.log(`🔄 Пробуем блокировку аккаунта на URL: ${url}`);
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(deleteData),
                });

                console.log(`📊 Статус ответа: ${response.status} ${response.statusText}`);

                if (!response.ok) {
                    console.log(`❌ Ошибка ${response.status}, пробуем следующий URL`);
                    continue;
                }

                const result = await response.json();
                console.log('📊 Ответ сервера:', result);
                
                if (result.success && result.blocked) {
                    success = true;
                    console.log('✅ Аккаунт успешно заблокирован');
                    break;
                }
            }

            if (success) {
                // Выходим из аккаунта
                logout();
                navigate('/');
                alert('Ваш аккаунт был заблокирован. Для восстановления обратитесь к администратору.');
            } else {
                throw new Error('Блокировка аккаунта не удалась');
            }
        } catch (error) {
            console.error('❌ Ошибка блокировки аккаунта:', error);
            setErrors({ general: 'Ошибка блокировки: ' + error.message });
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleEdit = () => setIsEditing(true);
    const handleCancelEdit = () => {
        setIsEditing(false);
        // Перезагружаем оригинальные данные
        fetchUserProfile();
    };

    if (profileLoading) return <div>Загрузка профиля...</div>;
    if (!user) return <div className="profile-not-authorized">Не авторизован. <Link to="/login">Войти</Link></div>;

    return (
        <div className="profile-container">
            {errors.general && (
                <div className="error-message">{errors.general}</div>
            )}
            
            <div className="profile-header">
                <h2>Личный кабинет</h2>
                {!isEditing && (
                    <button 
                        onClick={handleEdit}
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        Редактировать профиль
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-section">
                    <h3>Личные данные</h3>
                    <div className="section-description">
                        Основная информация о вас
                    </div>
                    <div className="form-row three-columns">
                        <div className="form-group">
                            <label>Фамилия *</label>
                            <input
                                type="text"
                                name="familiy"
                                value={formData.familiy}
                                onChange={handleChange}
                                className={`form-input ${errors.familiy ? 'error' : ''}`}
                                disabled={!isEditing || isLoading}
                                required
                            />
                            {errors.familiy && (
                                <span className="error-text">{errors.familiy}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Имя *</label>
                            <input
                                type="text"
                                name="imy"
                                value={formData.imy}
                                onChange={handleChange}
                                className={`form-input ${errors.imy ? 'error' : ''}`}
                                disabled={!isEditing || isLoading}
                                required
                            />
                            {errors.imy && (
                                <span className="error-text">{errors.imy}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Отчество *</label>
                            <input
                                type="text"
                                name="otchestvo"
                                value={formData.otchestvo}
                                onChange={handleChange}
                                className={`form-input ${errors.otchestvo ? 'error' : ''}`}
                                disabled={!isEditing || isLoading}
                                required
                            />
                            {errors.otchestvo && (
                                <span className="error-text">{errors.otchestvo}</span>
                            )}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Дата рождения</label>
                            <input
                                type="date"
                                name="dateRojdeniy"
                                value={formData.dateRojdeniy}
                                onChange={handleChange}
                                className={`form-input ${errors.dateRojdeniy ? 'error' : ''}`}
                                disabled={!isEditing || isLoading}
                            />
                            {errors.dateRojdeniy && (
                                <span className="error-text">{errors.dateRojdeniy}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Контактная информация</h3>
                    <div className="section-description">
                        Данные для связи с вами
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Телефон *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`form-input ${errors.phone ? 'error' : ''}`}
                                disabled={!isEditing || isLoading}
                                required
                            />
                            {errors.phone && (
                                <span className="error-text">{errors.phone}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="login"
                                value={formData.login}
                                onChange={handleChange}
                                className={`form-input ${errors.login ? 'error' : ''}`}
                                disabled={!isEditing || isLoading}
                                required
                            />
                            {errors.login && (
                                <span className="error-text">{errors.login}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Информация об аккаунте</h3>
                    <div className="account-info">
                        <div className="info-row">
                            <span className="info-label">Дата регистрации:</span>
                            <span className="info-value">{user.dataRegistraciy || 'Не указана'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Статус:</span>
                            <span className="info-value">{user.isBlocked ? 'Заблокирован' : 'Активен'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Роль:</span>
                            <span className="info-value">{roleName}</span>
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="form-section">
                        <h3>Изменение пароля</h3>
                        <div className="section-description">
                            Оставьте поля пустыми, если не хотите менять пароль
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Новый пароль</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.password && (
                                    <span className="error-text">{errors.password}</span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Подтверждение пароля</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.confirmPassword && (
                                    <span className="error-text">{errors.confirmPassword}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className="form-section">
                        <div className="form-submit-row">
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="btn btn-secondary"
                                disabled={isLoading}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            {/* Опасная зона */}
            <div className="danger-zone">
                <h3>Опасная зона</h3>
                <p>Эти действия нельзя отменить. Будьте осторожны.</p>
                
                <div className="danger-actions">
                    <button 
                        onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                        className="btn btn-danger"
                        disabled={isLoading}
                    >
                        Удалить учетную запись
                    </button>
                    
                    {showDeleteConfirm && (
                        <div className="delete-confirm">
                            <p>Вы уверены, что хотите удалить свою учетную запись? Все ваши данные будут удалены без возможности восстановления.</p>
                            <div className="confirm-actions">
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="btn btn-secondary"
                                    disabled={isLoading}
                                >
                                    Отмена
                                </button>
                                <button 
                                    onClick={handleDeleteAccount}
                                    className="btn btn-danger"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Удаление...' : 'Да, удалить аккаунт'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;