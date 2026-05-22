import React from 'react';
import { Link } from 'react-router-dom';

import logo from './logo.png';

const Footer = () => {

    const currentYear =new Date().getFullYear();
    return (
        <footer style={{
            backgroundColor: '#34495e',
            color: 'white',
            padding: '30px 20px',
            marginTop: 'auto'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '30px'
            }}>
                <div style={{textAlign: 'center'}}>
                    <img src={logo} alt='Логотип' width={34} ></img>
                    <h3 style={{ marginBottom: '15px' }}>ЯРПРОДСНАБСЕРВИС</h3>
                    <p>Cырье и ингредиенты для <br/>пищевой промышленности</p>
                </div>
                
                <div>
                    <h4 style={{ marginBottom: '15px', textAlign: 'center' }}>Контакты</h4>
                    <p>г. Ярославль, 2ая портовая улица (Речной порт)</p>
                    <p>+7 (4852) 77-88-77</p>
                    <p>ИНН 7606029530</p>
                    <p>КПП 760601001</p>
                </div>
                
                <div  style={{textAlign: 'center'}}>
                    <h4 style={{ marginBottom: '15px' }}>Навигация</h4>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Главная</Link>
                        <Link to="/catalog" style={{ color: 'white', textDecoration: 'none' }}>Каталог</Link>
                        <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>О нас</Link>
                        <Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>Контакты</Link>
                    </nav>
                </div>
            </div>
            
            <div style={{
                textAlign: 'center',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                <p>© 1998-{currentYear} ООО "ЯРПРОДСНАБСЕРВИС". Все права защищены.</p>
            </div>
        </footer>
    );
};


export default Footer;