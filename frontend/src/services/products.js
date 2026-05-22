import { api } from './api';

export const productsService = {
    async getAll() {
        return api.get('/products');
    },
    
    async getById(id) {
        return api.get(`/products/${id}`);
    },
    
    async getByCategory(category) {
        return api.get(`/products/category/${category}`);
    }
};