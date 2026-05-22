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

require_once __DIR__ . '/../config/database.php';

function checkAdminAuth() {
    // Получаем заголовок Authorization
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Токен не предоставлен']);
        exit();
    }
    
    // Декодируем токен (это base64)
    $userData = json_decode(base64_decode($token), true);
    
    if (!$userData || !isset($userData['id']) || !isset($userData['role'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Недействительный токен']);
        exit();
    }
    
    // Проверяем роль в базе данных
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "SELECT role FROM user WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $userData['id']);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || $user['role'] != 1) { // role 1 - администратор
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Доступ запрещен. Требуются права администратора']);
        exit();
    }
    
    return $userData['id'];
}
?>