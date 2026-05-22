export const CATEGORIES = [
    { id: 'all', name: 'Все товары' },
    { id: 'flour', name: 'Мука' },
    { id: 'yeast', name: 'Дрожжи' },
    { id: 'additives', name: 'Добавки' },
    { id: 'packaging', name: 'Упаковка' }
];

export const ORDER_STATUSES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};