const API_BASE_URL = 'http://localhost:80/backend/api';

export const api = {
    async get(url) {
        const response = await fetch(`${API_BASE_URL}${url}`);
        return response.json();
    },
    
    async post(url, data) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};