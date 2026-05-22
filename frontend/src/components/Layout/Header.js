import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaHome, FaStore, FaInfoCircle, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import '../../styles/components.css';


import logo  from './logo.png';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const getUserFirstName = () => {
        if (!user || !user.name) return '';
        
        // Разделяем по пробелам и берем первую часть
        const nameParts = user.name.trim().split(' ');
        return nameParts[1] || nameParts[0];
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Главная', icon: <FaHome /> },
        { path: '/catalog', label: 'Каталог', icon: <FaStore /> },
        { path: '/about', label: 'О нас', icon: <FaInfoCircle /> },
        { path: '/contact', label: 'Контакты', icon: <FaEnvelope /> }
    ];

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Logo */}
                    <div className="logo">
                        <NavLink to="/" className="logo-link">
                        <img src={logo} alt='Логотип' width={32} ></img>
                            <div className="logo-text">
                                
                                <span className="logo-main">ЯРПРОДСНАБСЕРВИС</span>
                                {/*<span className="logo-sub">ООО</span>*/}
                            </div>
                        </NavLink>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        <ul className="nav-list">
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => 
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-text">{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Actions */}
                    <div className="header-actions">
                        {/* Cart */}
                        <NavLink to="/cart" className="cart-link">
                            <FaShoppingCart className="cart-icon" />
                            {cartItemCount > 0 && (
                                <span className="cart-badge">{cartItemCount}</span>
                            )}
                            <span className="action-text d-md-none">Корзина</span>
                        </NavLink>

                        {/* User Menu */}
                        <div className="user-menu-wrapper">
                            <button 
                                className="user-menu-btn"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                aria-label="Меню пользователя"
                            >
                                <FaUser />
                                <span className="action-text d-md-none">
                                    {isAuthenticated ? getUserFirstName() : 'Войти'}
                                </span>
                            </button>
                            
                            {isUserMenuOpen && (
                                <div className="user-dropdown">
                                    {isAuthenticated ? (
                                        <>
                                            <div className="user-info">
                                                <p className="user-name">Привет, {user?.name}</p>
                                                <p className="user-email">{user?.email}</p>
                                            </div>
                                            <NavLink 
                                                to="/profile" 
                                                className="dropdown-link"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Профиль
                                            </NavLink>
                                            <NavLink 
                                                to="/orders" 
                                                className="dropdown-link"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Мои заказы
                                            </NavLink>
                                            {user?.role === 1 && (
                                                <NavLink 
                                                    to="/admin" 
                                                    className="dropdown-link"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    Админ-панель
                                                </NavLink>
                                            )}
                                            <button 
                                                onClick={handleLogout}
                                                className="dropdown-link logout-btn"
                                            >
                                                Выйти
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <NavLink 
                                                to="/login" 
                                                className="dropdown-link"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Войти
                                            </NavLink>
                                            <NavLink 
                                                to="/register" 
                                                className="dropdown-link"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Регистрация
                                            </NavLink>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button 
                            className="mobile-menu-toggle"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Меню"
                        >
                            {isMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="mobile-nav">
                        <ul className="mobile-nav-list">
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => 
                                            `mobile-nav-link ${isActive ? 'active' : ''}`
                                        }
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span className="mobile-nav-icon">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                            
                            {/* Mobile user options */}
                            <li className="mobile-user-options">
                                {isAuthenticated ? (
                                    <>
                                        <p className="mobile-user-greeting">Привет, {getUserFirstName()}</p>
                                        <button 
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="btn btn-secondary"
                                        >
                                            Выйти
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <NavLink 
                                            to="/login" 
                                            className="btn btn-primary"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Войти
                                        </NavLink>
                                        <NavLink 
                                            to="/register" 
                                            className="btn btn-secondary"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Регистрация
                                        </NavLink>
                                    </>
                                )}
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
            
            {/* Header specific styles */}
            <style jsx>{`
                .header {
                    background-color: var(--primary-color);
                    color: white;
                    box-shadow: var(--shadow-md);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }
                
                .header-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-md) 0;
                    min-height: 70px;
                }
                
                .logo-link {
                    color: white;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                }
                
                .logo-text {
                    display: flex;
                    flex-direction: column;
                }
                
                .logo-main {
                    font-size: 1.25rem;
                    font-weight: 700;
                    line-height: 1.2;
                }
                
                .logo-sub {
                    font-size: 0.875rem;
                    opacity: 0.8;
                }
                
                .desktop-nav {
                    display: none;
                }
                
                .nav-list {
                    display: flex;
                    gap: var(--space-md);
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }
                
                .nav-link {
                    color: white;
                    text-decoration: none;
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    transition: var(--transition-fast);
                }
                
                .nav-link:hover,
                .nav-link.active {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .nav-icon {
                    font-size: 1rem;
                }
                
                .nav-text {
                    font-size: 0.95rem;
                }
                
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                }
                
                .cart-link,
                .user-menu-btn {
                    color: white;
                    background: none;
                    border: none;
                    padding: var(--space-sm);
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    cursor: pointer;
                    text-decoration: none;
                    position: relative;
                    transition: var(--transition-fast);
                }
                
                .cart-link:hover,
                .user-menu-btn:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .cart-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background-color: var(--accent-color);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    min-width: 20px;
                    height: 20px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                }
                
                .action-text {
                    font-size: 0.875rem;
                }
                
                .user-menu-wrapper {
                    position: relative;
                }
                
                .user-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    min-width: 250px;
                    z-index: 1001;
                    overflow: hidden;
                    margin-top: var(--space-sm);
                }
                
                .user-info {
                    padding: var(--space-md);
                    border-bottom: 1px solid var(--border-color);
                }
                
                .user-name {
                    font-weight: 600;
                    margin: 0;
                    color: var(--text-color);
                }
                
                .user-email {
                    font-size: 0.875rem;
                    color: var(--text-light);
                    margin: var(--space-xs) 0 0;
                }
                
                .dropdown-link {
                    display: block;
                    padding: var(--space-md);
                    color: var(--text-color);
                    text-decoration: none;
                    transition: var(--transition-fast);
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    font-size: 0.95rem;
                }
                
                .dropdown-link:hover {
                    background-color: var(--bg-light);
                }
                
                .logout-btn {
                    color: var(--danger-color);
                }
                
                .mobile-menu-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: var(--space-sm);
                    border-radius: var(--radius-sm);
                    transition: var(--transition-fast);
                }
                
                .mobile-menu-toggle:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .mobile-nav {
                    display: block;
                    padding: var(--space-md) 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .mobile-nav-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }
                
                .mobile-nav-link {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    color: white;
                    text-decoration: none;
                    padding: var(--space-md) 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    font-size: 1.1rem;
                }
                
                .mobile-nav-link.active {
                    color: var(--secondary-color);
                }
                
                .mobile-nav-icon {
                    font-size: 1.2rem;
                    width: 24px;
                }
                
                .mobile-user-options {
                    padding: var(--space-lg) 0;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                }
                
                .mobile-user-greeting {
                    color: white;
                    margin: 0;
                    text-align: center;
                }
                
                /* Desktop styles */
                @media (min-width: 720px) {
                    .desktop-nav {
                        display: block;
                    }
                    
                    .mobile-menu-toggle {
                        display: none;
                    }
                    
                    .mobile-nav {
                        display: none;
                    }
                    
                    .action-text {
                        display: inline;
                    }
                }
                
                /* Tablet styles */
                @media (max-width: 1024px) and (min-width: 769px) {
                    .nav-text {
                        font-size: 0.9rem;
                    }
                    
                    .nav-link {
                        padding: var(--space-sm);
                    }
                }
                 @media (max-width: 990px) {
                    .header-content {
                        min-height: 60px;
                    }
                    
                    .logo-main {
                        font-size: 1.1rem;
                    }
                    
                    .logo-sub {
                        font-size: 0.8rem;
                    }
                    
                    .action-text {
                        display: none;
                    }
                    
                    .header-actions {
                        gap: var(--space-sm);
                    }
                }
                /* Mobile styles */
                @media (max-width: 768px) {
                    .header-content {
                        min-height: 60px;
                    }
                    
                    .logo-main {
                        font-size: 1.1rem;
                    }
                    
                    .logo-sub {
                        font-size: 0.8rem;
                    }
                    
                    .action-text {
                        display: none;
                    }
                    
                    .header-actions {
                        gap: var(--space-sm);
                    }
                }
                
                /* Small mobile */
                @media (max-width: 480px) {
                    .logo-main {
                        font-size: 1rem;
                    }
                    
                    .header-actions {
                        gap: var(--space-xs);
                    }
                }
            `}</style>
        </header>
    );
};

export default Header;