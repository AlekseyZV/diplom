// src/pages/Contact.js
import React, { useState } from 'react';
import '../styles/Contact.css?inline';
import { Hport } from './PROT.js';
import MapComponent from '../components/MapComponent';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({
        success: false,
        message: '',
        error: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Сбрасываем статус при изменении полей
        if (submitStatus.message || submitStatus.error) {
            setSubmitStatus({ success: false, message: '', error: '' });
        }
    };

    // Contact.js - исправленная версия handleSubmit
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    const nameParts = formData.name.trim().split(' ');
    if (nameParts.length < 2) {
        setSubmitStatus({ 
            success: false, 
            message: '', 
            error: 'Введите Фамилию и Имя через пробел (например: Иванов Иван)' 
        });
        return;
    }
    
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        setSubmitStatus({ 
            success: false, 
            message: '', 
            error: 'Введите корректный email' 
        });
        return;
    }
    
    if (!formData.message.trim()) {
        setSubmitStatus({ 
            success: false, 
            message: '', 
            error: 'Введите сообщение' 
        });
        return;
    }
    
    setLoading(true);
    setSubmitStatus({ success: false, message: '', error: '' });

    try {
        // Используйте правильный URL из PROT.js
        const API_BASE_URL = Hport.httpport; 
        
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('Отправляемые данные:', formData);
        
        // Пробуем разные варианты
        const urls = [
            `${API_BASE_URL}/api/contact`,
            `${API_BASE_URL}/contact.php`,
            `http://192.168.0.109/zavedeev/Yrprod_kurs/backend/api/contact`,
            `http://192.168.0.109/zavedeev/Yrprod_kurs/backend/contact.php`,
        ];
        
        let response = null;
        let data = null;
        
        for (const url of urls) {
            try {
                console.log('Пробуем URL:', url);
                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        phone: formData.phone.trim(),
                        message: formData.message.trim()
                    })
                });
                
                console.log('Статус:', response.status, response.statusText);
                
                // Проверяем Content-Type
                const contentType = response.headers.get('content-type');
                console.log('Content-Type:', contentType);
                
                if (!contentType || !contentType.includes('application/json')) {
                    // Если сервер вернул не JSON, читаем как текст
                    const text = await response.text();
                    console.error('Сервер вернул не JSON:', text.substring(0, 200));
                    continue;
                }
                
                data = await response.json();
                console.log('Данные от сервера:', data);
                break;
                
            } catch (error) {
                console.log('Ошибка для', url, ':', error.message);
                continue;
            }
        }
        
        if (!data) {
            throw new Error('Не удалось получить корректный ответ от сервера');
        }

        if (data.success) {
            setSubmitStatus({
                success: true,
                message: data.message || 'Сообщение успешно отправлено!',
                error: ''
            });
            
            setFormData({ 
                name: '', 
                email: '', 
                phone: '', 
                message: '' 
            });
        } else {
            setSubmitStatus({
                success: false,
                message: '',
                error: data.error || 'Произошла ошибка при отправке сообщения.'
            });
        }
    } catch (error) {
        console.error('Ошибка при отправке формы:', error);
        console.error('Тип ошибки:', error.name);
        console.error('Сообщение:', error.message);
        
        setSubmitStatus({
            success: false,
            message: '',
            error: `Ошибка: ${error.message}`
        });
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="contact-page-container">
            <h2>Контактная информация</h2>
            
            {/* Инструкция по заполнению ФИО 
            <div style={{
                backgroundColor: '#f0f8ff',
                padding: '10px 15px',
                borderRadius: '5px',
                marginBottom: '20px',
                fontSize: '14px',
                border: '1px solid #d1ecf1'
            }}>
                <strong>Как заполнять ФИО:</strong> Введите Фамилию, Имя и Отчество через пробел 
                (например: <em>Иванов Иван</em> или <em>Иванов Иван Иванович</em>)
            </div>*/}
            
            {/* Сообщения об успехе/ошибке */}
            {submitStatus.message && (
                <div className="alert alert-success" style={{
                    padding: '15px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    ✅ {submitStatus.message}
                </div>
            )}
            
            {submitStatus.error && (
                <div className="alert alert-error" style={{
                    padding: '15px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    ❌ {submitStatus.error}
                </div>
            )}
            
            <div className="contact-grid">
                {/* Контактная информация */}
                <div className="contact-info-section">
                    <div>
                        <h4>Режим работы</h4>
                        <p>С 9:00 - 17:00 по Москве</p>
                    </div>
                    
                    <div>
                        <h4>Адреса самовывозов со складов в Ярославле и Москве</h4>
                        <p>г. Ярославль, 2ая портовая улица (Речной порт)</p>
                        <p>г. Лосино-Петровский, р.п. Свердловский, ул. Промышленная (тер. Аграрная), строение 5, копрус 4</p>
                    </div>

                    <div>
                        <h4>Телефоны</h4>
                        <p>+7 (4852) 77-88-77</p>
                    </div>

                    <div>
                        <h4>Реквизиты</h4>
                        <p>ИНН 7606029530</p>
                        <p>КПП 760601001</p>
                    </div>
                </div>

                {/* Форма обратной связи */}
                <div className="contact-form-section">
                    <h3>Форма обратной связи</h3>
                    
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label>
                                Ваше ФИО * <small>(Фамилия Имя Отчество)</small>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="Иванов Иван Иванович"
                                title="Введите Фамилию, Имя и Отчество через пробел"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="example@mail.ru"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Телефон <small>(только цифры)</small>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="89991234567"
                                pattern="[0-9]*"
                                title="Введите только цифры телефона"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Сообщение *
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                                disabled={loading}
                                placeholder="Ваше сообщение..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                            style={{
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{marginRight: '10px'}}>⏳</span>
                                    Отправка...
                                </>
                            ) : 'Отправить сообщение'}
                        </button>
                        
                        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                            * - обязательные для заполнения поля
                        </div>
                    </form>
                </div>
            </div>

            {/* Карта */}
            <div style={{ marginTop: '40px' }}>
                <h3>Мы на карте</h3>
                <div className="map-container">
                    <MapComponent></MapComponent>
                </div>
            </div>
        </div>
    );
};

export default Contact;