import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, 
    FaUserPlus,
    FaBan,
    FaCheckCircle,
    FaTrash,
    FaSearch,
    FaFilter,
    FaEdit
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Hport } from '../PROT.js';
import AddEmployeeModal from '../../components/Admin/AddEmployeeModal';
import EditUserModal from '../../components/Admin/EditUserModal';
import '../../AdminStyle/AdminUsers.css';

const API_BASE_URL = Hport.httpport;
const ITEMS_PER_PAGE = 10;




const AdminUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Добавьте в состояние
    const [editingUser, setEditingUser] = useState(null);

    // Добавьте функцию обработки редактирования
    const handleEditUser = (user) => {
        setEditingUser(user);
    };

    const handleUpdateUser = (updatedUser) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        // Сбрасываем пагинацию при изменении фильтров
        setCurrentPage(1);
        filterUsers(1);
    }, [roleFilter, searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const response = await fetch(`${API_BASE_URL}/admin/users.php?role=${roleFilter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setUsers(data.users);
            } else {
                setError(data.error || 'Ошибка загрузки пользователей');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = (page = 1) => {
        let filtered = [...users];
        
        // Фильтр по роли
        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role == roleFilter);
        }
        
        // Поиск по ФИО, email, телефону
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(u => 
                `${u.familiy} ${u.imy} ${u.otchestvo}`.toLowerCase().includes(term) ||
                u.login?.toLowerCase().includes(term) ||
                u.phone?.toString().includes(term)
            );
        }
        
        // Пагинация
        const start = 0;
        const end = page * ITEMS_PER_PAGE;
        const paginated = filtered.slice(start, end);
        
        setDisplayedUsers(paginated);
        setHasMore(end < filtered.length);
    };

    const loadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        filterUsers(nextPage);
    };

    const handleBlockToggle = async (userId, currentStatus) => {
        // Запрещаем самоблокировку
        if (userId === user?.id) {
            alert('Вы не можете заблокировать самого себя!');
            return;
        }
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/users.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: userId,
                    isBlocked: currentStatus ? 0 : 1
                })
            });
            const data = await response.json();
            if (data.success) {
                // Обновляем список пользователей
                setUsers(users.map(u => 
                    u.id === userId 
                        ? { ...u, isBlocked: currentStatus ? 0 : 1 }
                        : u
                ));
            } else {
                alert(data.error || 'Ошибка при изменении статуса');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    };
    

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) {
            return;
        }
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');   
            const response = await fetch(`${API_BASE_URL}/admin/users.php?userId=${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                // Удаляем пользователя из списка
                setUsers(users.filter(u => u.id !== userId));
                alert('Пользователь успешно удален');
            } else {
                alert(data.error || 'Ошибка при удалении пользователя');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    };

    const handleAddEmployee = (newEmployee) => {
        setUsers([newEmployee, ...users]);
    };

    const getRoleName = (roleId) => {
        const roles = {
            1: 'Администратор',
            2: 'Сотрудник',
            3: 'Покупатель',
            4: 'Гость'
        };
        return roles[roleId] || 'Неизвестно';
    };

    const getStatusName = (statusId) => {
        const statuses = {
            1: 'Физическое лицо',
            2: 'Юридическое лицо'
        };
        return statuses[statusId] || 'Неизвестно';
    };

    if (loading) return <div className="admin-loading">Загрузка...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-users">
            <div className="admin-header">
                <Link to="/admin" className="back-button">
                    <FaArrowLeft /> На главную админки
                </Link>
                <h1>Управление пользователями</h1>
                <button 
                    className="add-employee-btn"
                    onClick={() => setShowAddModal(true)}
                >
                    <FaUserPlus /> Добавить сотрудника
                </button>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск по ФИО, email или телефону..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-box">
                    <FaFilter className="filter-icon" />
                    <select 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">Все роли</option>
                        <option value="1">Администраторы</option>
                        <option value="2">Сотрудники</option>
                        <option value="3">Покупатели</option>
                        <option value="4">Гости</option>
                    </select>
                </div>
            </div>

            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-label">Всего пользователей:</span>
                    <span className="stat-value">{users.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Отображается:</span>
                    <span className="stat-value">{displayedUsers.length}</span>
                </div>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            {/*<th>Код</th>*/}
                            <th>ФИО</th>
                            <th>Email</th>
                            <th>Телефон</th>
                            <th>Роль</th>
                            <th>Статус</th>
                            <th>Дата регистрации</th>
                            <th>Блокировка</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedUsers.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="no-data">
                                    Пользователи не найдены
                                </td>
                            </tr>
                        ) : (
                            displayedUsers.map(userItem => (
                                <tr key={userItem.id} className={userItem.isBlocked ? 'blocked' : ''}>
                                   {/*} <td>{userItem.id}</td>*/}
                                    <td>{`${userItem.familiy || ''} ${userItem.imy || ''} ${userItem.otchestvo || ''}`}</td>
                                    <td>{userItem.login}</td>
                                    <td>{userItem.phone || '—'}</td>
                                    <td>
                                        <span className={`role-badge role-${userItem.role}`}>
                                            {getRoleName(userItem.role)}
                                        </span>
                                    </td>
                                    <td>{getStatusName(userItem.status)}</td>
                                    <td>{userItem.dataRegistraciy ? new Date(userItem.dataRegistraciy).toLocaleDateString('ru-RU') : '—'}</td>
                                    <td>
                                        {userItem.isBlocked ? (
                                            <span className="status-badge blocked">Заблокирован</span>
                                        ) : (
                                            <span className="status-badge active">Активен</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEditUser(userItem)}
                                                title="Редактировать"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className={`block-btn ${userItem.isBlocked ? 'unblock' : 'block'}`}
                                                onClick={() => handleBlockToggle(userItem.id, userItem.isBlocked)}
                                                disabled={userItem.id === user?.id}
                                                title={userItem.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                                                
                                            >
                                                {userItem.isBlocked ? <FaCheckCircle /> : <FaBan />}
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteUser(userItem.id)}
                                                title="Удалить"
                                                disabled={userItem.id === user?.id}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                        
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <div className="load-more-container">
                    <button onClick={loadMore} className="load-more-btn">
                        Показать ещё 10
                    </button>
                </div>
            )}

            {showAddModal && (
                <AddEmployeeModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddEmployee}
                />
            )}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onUpdate={handleUpdateUser}
                />
            )}
        </div>
    );
};

export default AdminUsers;