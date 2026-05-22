<?php
// Устанавливаем заголовки CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Обработка OPTIONS запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "SELECT id, Name FROM kategoriy ORDER BY Name ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Экранируем данные
    foreach ($categories as &$category) {
        $category['Name'] = htmlspecialchars($category['Name'], ENT_QUOTES, 'UTF-8');
    }
    
    echo json_encode([
        'success' => true,
        'data' => $categories
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка сервера: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>