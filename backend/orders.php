<?php

// Включаем вывод ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Устанавливаем заголовки CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Обрабатываем предварительный запрос OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверяем, что запрос GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Use GET.'
    ]);
    exit();
}

// Проверяем наличие ID пользователя
if (!isset($_GET['userId'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Не указан ID пользователя'
    ]);
    exit();
}

$userId = intval($_GET['userId']);
error_log("Запрос заказов для пользователя ID: " . $userId);

// Подключаем класс базы данных
require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Получаем список заказов
    $orders_sql = "SELECT z.id, z.dateSozdaniy, z.status, COALESCE(sz.Name, 'Неизвестно') as status_name
                   FROM zakaz z
                   LEFT JOIN statuszakaza sz ON z.status = sz.id
                   WHERE z.idUser = :userId
                   ORDER BY z.dateSozdaniy DESC";
    
    $orders_stmt = $db->prepare($orders_sql);
    $orders_stmt->bindParam(':userId', $userId);
    $orders_stmt->execute();
    
    $orders = [];
    while ($row = $orders_stmt->fetch(PDO::FETCH_ASSOC)) {
        // Получаем товары для заказа
        $items_sql = "SELECT tz.id as item_id, tz.idTovar as product_id, t.Name as product_name,
                      tz.kolichestvo as quantity, COALESCE(t.cena, 2) as price,
                      (tz.kolichestvo * COALESCE(t.cena, 2)) as item_total
                      FROM tovarzakaz tz
                      LEFT JOIN tovar t ON tz.idTovar = t.id
                      WHERE tz.idZakaz = :orderId";
        
        $items_stmt = $db->prepare($items_sql);
        $items_stmt->bindParam(':orderId', $row['id']);
        $items_stmt->execute();
        
        $items = $items_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $total_amount = 0;
        $total_items = 0;
        foreach ($items as $item) {
            $total_amount += (float)$item['item_total'];
            $total_items += (int)$item['quantity'];
        }
        
        $row['items'] = $items;
        $row['total_amount'] = $total_amount;
        $row['total_items'] = $total_items;
        
        $orders[] = $row;
    }
    
    // Получаем статистику
    $stats_sql = "SELECT 
                    COUNT(DISTINCT z.id) as total_orders,
                    COALESCE(SUM(tz.kolichestvo * COALESCE(t.cena, 2)), 0) as total_spent,
                    COALESCE(SUM(tz.kolichestvo), 0) as total_products
                  FROM zakaz z
                  LEFT JOIN tovarzakaz tz ON z.id = tz.idZakaz
                  LEFT JOIN tovar t ON tz.idTovar = t.id
                  WHERE z.idUser = :userId";
    
    $stats_stmt = $db->prepare($stats_sql);
    $stats_stmt->bindParam(':userId', $userId);
    $stats_stmt->execute();
    
    $stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'stats' => [
            'total_orders' => (int)($stats['total_orders'] ?? 0),
            'total_spent' => (float)($stats['total_spent'] ?? 0),
            'total_products' => (int)($stats['total_products'] ?? 0)
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    error_log("Ошибка в orders.php: " . $e->getMessage());
    error_log("Стек вызовов: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Внутренняя ошибка сервера',
        'debug' => $e->getMessage() // Убрать в продакшене
    ]);
}
?>