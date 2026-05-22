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
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Получение всех сообщений
            $query = "SELECT * FROM obrantaysvyz ORDER BY id DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'messages' => $messages
            ], JSON_UNESCAPED_UNICODE);
            break;
            
        case 'DELETE':
            // Удаление сообщения
            $messageId = isset($_GET['id']) ? $_GET['id'] : '';
            
            if (!$messageId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Не указан ID сообщения']);
                exit();
            }
            
            $query = "DELETE FROM obrantaysvyz WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $messageId);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Сообщение успешно удалено'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Ошибка при удалении сообщения']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Метод не поддерживается']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка сервера',
        'debug' => $e->getMessage()
    ]);
}
?>