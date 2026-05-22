<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/../config/database.php';

// Проверяем авторизацию администратора
checkAdminAuth();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Общая статистика
    $stats = [];
    
    // Всего заказов
    $query = "SELECT COUNT(*) as total_orders FROM zakaz";
    $stmt = $db->query($query);
    $stats['total_orders'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_orders'];
    
    // Товаров на складе (сумма всех остатков)
    $query = "SELECT SUM(kolichestvo) as total_stock FROM tovar";
    $stmt = $db->query($query);
    $stats['total_stock'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_stock'] ?? 0;
    
    // Продано товаров
    $query = "SELECT SUM(kolichestvo) as total_sold FROM tovarzakaz";
    $stmt = $db->query($query);
    $stats['total_sold'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_sold'] ?? 0;
    
    // Общая выручка (сумма всех заказов)
    $query = "SELECT SUM(t.cena * tz.kolichestvo) as total_revenue 
              FROM tovarzakaz tz 
              JOIN tovar t ON tz.idTovar = t.id";
    $stmt = $db->query($query);
    $stats['total_revenue'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_revenue'] ?? 0;
    
    // Количество пользователей по ролям
    $query = "SELECT 
                SUM(CASE WHEN role = 1 THEN 1 ELSE 0 END) as admins,
                SUM(CASE WHEN role = 2 THEN 1 ELSE 0 END) as employees,
                SUM(CASE WHEN role = 3 THEN 1 ELSE 0 END) as customers,
                SUM(CASE WHEN role = 4 THEN 1 ELSE 0 END) as guests
              FROM user";
    $stmt = $db->query($query);
    $roleStats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'stats' => [
            'total_orders' => (int)$stats['total_orders'],
            'total_stock' => (int)$stats['total_stock'],
            'total_sold' => (int)$stats['total_sold'],
            'total_revenue' => (float)$stats['total_revenue'],
            'users_by_role' => $roleStats
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка получения статистики',
        'debug' => $e->getMessage()
    ]);
}
?>