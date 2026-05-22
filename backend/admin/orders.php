<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
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

$database = new Database();
$db = $database->getConnection();

try {
    // Получаем все заказы с информацией о пользователях
    $query = "SELECT z.*, 
                     u.familiy, u.imy, u.otchestvo, u.login, u.phone,
                     sz.Name as status_name
              FROM zakaz z
              JOIN user u ON z.idUser = u.id
              JOIN statuszakaza sz ON z.status = sz.id
              ORDER BY z.dateSozdaniy DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Для каждого заказа получаем товары
    foreach ($orders as &$order) {
        $itemsQuery = "SELECT tz.*, t.Name as product_name, t.cena
                       FROM tovarzakaz tz
                       JOIN tovar t ON tz.idTovar = t.id
                       WHERE tz.idZakaz = :orderId";
        
        $itemsStmt = $db->prepare($itemsQuery);
        $itemsStmt->bindParam(':orderId', $order['id']);
        $itemsStmt->execute();
        $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Считаем общую сумму заказа
        $total = 0;
        foreach ($order['items'] as $item) {
            $total += $item['kolichestvo'] * $item['cena'];
        }
        $order['total_amount'] = $total;
    }
    
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка получения заказов',
        'debug' => $e->getMessage()
    ]);
}
?>