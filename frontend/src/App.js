import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import ProductPage from './pages/ProductPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

// Импорт компонентов админ-панели
import AdminRoute from './components/Admin/AdminRoute'; // Исправленный путь
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminFeedback from './pages/Admin/AdminFeedback';

// Стили (пути исправлены)
import './styles/App.css';
// Импортируем стили админки из правильной папки
import './AdminStyle/AdminDashboard.css';
import './AdminStyle/AdminUsers.css';
import './AdminStyle/AdminProducts.css';
import './AdminStyle/AdminOrders.css';
import './AdminStyle/AdminFeedback.css';
import './AdminStyle/AddEmployeeModal.css';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <div className="app">
                        <Header />
                        <main className="main-content">
                            <Routes>
                                {/* Публичные маршруты */}
                                <Route path="/" element={<Home />} />
                                <Route path="/catalog" element={<Catalog />} />
                                <Route path="/catalog/:id" element={<ProductPage />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                
                                {/* Маршруты админ-панели (защищенные) */}
                                <Route path="/admin" element={
                                    <AdminRoute>
                                        <AdminDashboard />
                                    </AdminRoute>
                                } />
                                <Route path="/admin/users" element={
                                    <AdminRoute>
                                        <AdminUsers />
                                    </AdminRoute>
                                } />
                                <Route path="/admin/products" element={
                                    <AdminRoute>
                                        <AdminProducts />
                                    </AdminRoute>
                                } />
                                <Route path="/admin/orders" element={
                                    <AdminRoute>
                                        <AdminOrders />
                                    </AdminRoute>
                                } />
                                <Route path="/admin/feedback" element={
                                    <AdminRoute>
                                        <AdminFeedback />
                                    </AdminRoute>
                                } />
                                
                                {/* 404 - перенаправление на главную */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;