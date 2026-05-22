import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, 
    FaEnvelope,
    FaUser,
    FaPhone,
    FaSearch,
    FaTrash,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Hport } from '../PROT.js';
import '../../AdminStyle/AdminFeedback.css';

const API_BASE_URL = Hport.httpport;
const ITEMS_PER_PAGE = 10;


const AdminFeedback = () => {
    const [messages, setMessages] = useState([]);
    const [displayedMessages, setDisplayedMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedMessageId, setExpandedMessageId] = useState(null);
    
    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        // Сбрасываем пагинацию при изменении поиска
        setCurrentPage(1);
        filterMessages(1);
    }, [searchTerm, messages]);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const response = await fetch(`${API_BASE_URL}/admin/feedback.php`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessages(data.messages);
            } else {
                setError(data.error || 'Ошибка загрузки сообщений');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    const filterMessages = (page = 1) => {
        let filtered = [...messages];
        
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(m => 
                `${m.familiy} ${m.imy} ${m.otchestvo}`.toLowerCase().includes(term) ||
                m.pochta?.toLowerCase().includes(term) ||
                m.komment?.toLowerCase().includes(term) ||
                m.phone?.toString().includes(term)
            );
        }
        
        // Пагинация
        const start = 0;
        const end = page * ITEMS_PER_PAGE;
        const paginated = filtered.slice(start, end);
        
        setDisplayedMessages(paginated);
        setHasMore(end < filtered.length);
    };

    const loadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        filterMessages(nextPage);
    };


    const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это сообщение?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/admin/feedback.php?id=${messageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Удаляем сообщение из списка
            setMessages(messages.filter(m => m.id !== messageId));
            alert('Сообщение успешно удалено');
        } else {
            alert(data.error || 'Ошибка при удалении сообщения');
        }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    };
    

    const toggleMessageExpand = (messageId) => {
        setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
    };

    const formatDate = (id) => {
        // Если нет даты, используем ID как условную дату
        return new Date().toLocaleDateString('ru-RU');
    };

    if (loading) return <div className="admin-loading">Загрузка...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-feedback">
            <div className="admin-header">
                <Link to="/admin" className="back-button">
                    <FaArrowLeft /> На главную админки
                </Link>
                <h1>Обратная связь</h1>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск по ФИО, email, телефону или сообщению..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-label">Всего сообщений:</span>
                    <span className="stat-value">{messages.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Отображается:</span>
                    <span className="stat-value">{displayedMessages.length}</span>
                </div>
            </div>

            <div className="messages-list">
                {displayedMessages.length === 0 ? (
                    <div className="no-data">
                        Сообщения не найдены
                    </div>
                ) : (
                    displayedMessages.map(message => (
                        <div key={message.id} className="message-card">
                            <div 
                                className="message-header"
                                onClick={() => toggleMessageExpand(message.id)}
                            >
                                <div className="message-sender">
                                    <FaUser className="sender-icon" />
                                    <div className="sender-info">
                                        <div className="sender-name">
                                            {`${message.familiy || ''} ${message.imy || ''} ${message.otchestvo || ''}`}
                                        </div>
                                        <div className="sender-contact">
                                            <FaEnvelope /> {message.pochta}
                                            {message.phone && (
                                                <>
                                                    <span className="separator">|</span>
                                                    <FaPhone /> {message.phone}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="message-preview">
                                    <div className="preview-text">
                                        {message.komment?.substring(0, 100)}
                                        {message.komment?.length > 100 && '...'}
                                    </div>
                                </div>
                                
                                <div className="message-actions">
                                    <button 
                                        className="delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMessage(message.id);
                                        }}
                                        title="Удалить"
                                    >
                                        <FaTrash />
                                    </button>
                                    <div className="expand-icon">
                                        {expandedMessageId === message.id ? <FaEyeSlash /> : <FaEye />}
                                    </div>
                                </div>
                            </div>
                            
                            {expandedMessageId === message.id && (
                                <div className="message-body">
                                    <div className="message-content">
                                        <h4>Полное сообщение:</h4>
                                        <p>{message.komment}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {hasMore && (
                <div className="load-more-container">
                    <button onClick={loadMore} className="load-more-btn">
                        Показать ещё 10
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminFeedback;