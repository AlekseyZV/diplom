import { api } from './api';

export const authService = {
    async login(email, password) {
        return api.post('/auth/login', { email, password });
    },
    
    async register(userData) {
        return api.post('/auth/register', userData);
    },
    
    async logout() {
        return api.post('/auth/logout');
    }
};