import React from 'react';
import '../styles/About.css';

// Импорт логотипов
import logo1 from './Logo/1.png';
import logo2 from './Logo/2.png';
import logo3 from './Logo/3.png';
import logo4 from './Logo/4.png';
import logo5 from './Logo/5.png';
import logo6 from './Logo/6.png';
import logo7 from './Logo/7.png';
import logo8 from './Logo/8.png';

const About = () => {
    const distributors = [
        { id: 1, s: 'https://www.puratos.ru/ru', name: 'Puratos', logo: logo1, alt: 'puratos' },
        { id: 2, s: 'https://www.ireks-trier.ru/', name: 'ТРИЭР', logo: logo2, alt: 'ТРИЭР' },
        { id: 3, s: 'https://www.angelyeast.ru/', name: 'Angel', logo: logo3, alt: 'Angel' },
        { id: 4, s: 'https://ssnab.ru/', name: 'СОЮЗСНАБ', logo: logo4, alt: 'СОЮЗСНАБ' },
        { id: 5, s: 'https://www.agrolex.net/', name: 'AGROLEX', logo: logo5, alt: 'AGROLEX' },
        { id: 6, s: 'https://gummi.ru/', name: 'ГаммИ', logo: logo6, alt: 'ГаммИ' },
        { id: 7, s: 'https://foodmix.su/', name: 'FOODMIX', logo: logo7, alt: 'FOODMIX' },
        { id: 8, s: 'https://www.efko.ru/', name: 'ЭФКО', logo: logo8, alt: 'ЭФКО' }
    ];

    return (
        <div className="about-container">
            <h2>О компании ЯРПРОДСНАБСЕРВИС</h2>
            <div className="about-section">
                <h3>Наша миссия</h3>
                <p>
                    ООО "ЯРПРОДСНАБСЕРВИС" - компания, занимающаяся снабжением продовольственными товарами, 
                    оптовой торговлей и логистикой в сфере продуктов питания.
                </p>
            </div>

            <div className="about-section">
                <h3>Основные направления деятельности</h3>
                <ul className="about-list">
                    <li><b>Импортные поставки от производителей</b> в таких странах как: Индия, Китай, Турция, Аргентина, Чили, Индонезия, Таиланд, Вьетнам.</li>
                    <li>Более <b>2000 наименований в наличии на</b> складе.</li>
                    <li><b>Холодильные камеры площадью 450 м^2</b> позволяют поддерживать температуру хранения от -20 до + 10 градусов.</li>
                    <li>Штатные технологи наши и наших поставщиков проводят <b>мастер-классы и демонстрацию новых изделий на вашем оборудовании</b>.</li>
                    <li>Предоставление <b>готовых решений</b> для расширения вашего ассортимента включая демонстрацию полностью разработанной рецептуры, техническую документацию, расчет себестоимости.</li>
                </ul>
            </div>

            <div className="about-section">
                <h3>Наши дистрибьюторы</h3>
                <p>Мы работаем с ведущими производителями пищевых ингредиентов:</p>
                <div className="distributors-grid">
                    {distributors.map((distributor) => (
                        <div key={distributor.id} className="distributor-item">
                            <a href={distributor.s}>
                            <img 
                                src={distributor.logo} 
                                alt={distributor.alt} 
                                className="distributor-logo-image"
                            ></img></a>
                        </div>
                    ))}
                </div>
            </div>

            <div className="about-section">
                <h3>Клиенты</h3>
                <p>
                    Клиентами компании являются различные предприятия пищевой промышленности, 
                    в основном хлебозаводы и пекарни Ярославской и соседних областей.
                </p>
            </div>
        </div>
    );
};

export default About;