import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaUsers, FaStore } from 'react-icons/fa';
import '../styles/pages.css';
import '../styles/DistributorsSection.css';
import '../styles/Home.css';

// Импорт логотипов
import logo1 from './Logo/1.png';
import logo2 from './Logo/2.png';
import logo3 from './Logo/3.png';
import logo4 from './Logo/4.png';
import logo5 from './Logo/5.png';
import logo6 from './Logo/6.png';
import logo7 from './Logo/7.png';
import logo8 from './Logo/8.png';

const Home = () => {
    const features = [
        { icon: <FaTruck/>,     title: 'Доставка по области',   description: 'Быстрая и надежная доставка продуктов' },
        { icon: <FaShieldAlt/>, title: 'Гарантия качества',     description: 'Сертифицированная продукция от производителей' },
        { icon: <FaUsers/>,     title: 'Опытные специалисты',   description: 'Профессиональная консультация и поддержка' },
        { icon: <FaStore/>,     title: 'Широкий ассортимент',   description: 'Более 1000 позиций в каталоге' }
    ];

     const distributors = [
        { id: 1, s: 'https://www.puratos.ru/ru',    logo: logo1 },
        { id: 2, s: 'https://www.ireks-trier.ru/',  logo: logo2 },
        { id: 3, s: 'https://www.angelyeast.ru/',   logo: logo3 },
        { id: 4, s: 'https://ssnab.ru/',            logo: logo4 },
    { id: 5, s: 'https://www.agrolex.net/',         logo: logo5 },
        { id: 6, s: 'https://gummi.ru/',            logo: logo6 },
        { id: 7, s: 'https://foodmix.su/',          logo: logo7 },
        { id: 8, s: 'https://www.efko.ru/',         logo: logo8 },
    ];

    const doubleDistributors = [...distributors, ...distributors];

    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>ООО "ЯРПРОДСНАБСЕРВИС"</h1>
                    <p className="subtitle">Надежный поставщик продовольственных товаров и ингредиентов</p>
                    <p>Снабжение, оптовая торговля и логистика в сфере продуктов питания</p>
                    <p>Cырье и ингредиенты для пищевой промышленности</p>
                    <div className="hero-buttons">
                        <Link to="/catalog" className="btn btn-primary">Смотреть каталог</Link>
                        <Link to="/about" className="btn btn-secondary">О компании</Link>
                    </div>
                </div>
            </section>

            {/* Основные направления */}
            <section className="directions-section">
                <h2>Основные направления деятельности</h2>
                <div className="directions-grid">
                    <div className="direction-card">
                        <h3>Закупка товаров</h3>
                        <p>Прямые поставки от ведущих производителей пищевых ингредиентов</p>
                    </div>
                    <div className="direction-card">
                        <h3>Складские услуги</h3>
                        <p>Хранение и управление запасами на современных складских комплексах</p>
                    </div>
                    <div className="direction-card">
                        <h3>Оптовая продажа</h3>
                        <p>Поставки продукции предприятиям пищевой промышленности</p>
                    </div>
                    <div className="direction-card">
                        <h3>Логистика</h3>
                        <p>Организация доставки по Ярославской и соседним областям</p>
                    </div>
                </div>
            </section>

            {/* Преимущества */}
            <section className="features-section">
                <h2>Наши преимущества</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Дистрибьюторы */}
            <section className="distributors-section">
                <h2>Наши дистрибьюторы</h2>
                <div className="distributors-container">
                    <div className="distributors-track">
                        {doubleDistributors.map((distributor, index) => (
                            <div key={`${distributor.id}-${index}`} className="distributor-card">
                                <a href={distributor.s} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="distributor-link">
                                    <div className="distributor-logo">
                                        <img src={distributor.logo} 
                                            alt={`Логотип дистрибьютора ${distributor.id}`}
                                            className="logo-image"/>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;