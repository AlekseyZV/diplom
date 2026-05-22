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

switch ($method) {
    case 'GET':
        // Получение списка товаров 
        $showDeleted = isset($_GET['showDeleted']) && $_GET['showDeleted'] === 'true';
        
        $query = "SELECT t.*, k.Name as category_name 
                  FROM tovar t 
                  LEFT JOIN kategoriy k ON t.idKategoriy = k.id";
        
        if (!$showDeleted) {
            $query .= " WHERE (t.isDeleted IS NULL OR t.isDeleted = 0)";
        }
        
        $query .= " ORDER BY t.id DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'products' => $products
        ], JSON_UNESCAPED_UNICODE);
        break;
        
    case 'POST':
        // Добавление нового товара
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Проверка обязательных полей
        if (empty($data['Name']) || empty($data['idKategoriy']) || !isset($data['cena'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Заполните все обязательные поля']);
            exit();
        }
        
        $query = "INSERT INTO tovar (Name, opisanie, kolichestvo, idKategoriy, cena, image, isDeleted) 
                  VALUES (:Name, :opisanie, :kolichestvo, :idKategoriy, :cena, :image, 0)";
        
        $stmt = $db->prepare($query);
        
        $Name = trim($data['Name']);
        $opisanie = isset($data['opisanie']) ? trim($data['opisanie']) : null;
        $kolichestvo = isset($data['kolichestvo']) ? intval($data['kolichestvo']) : 0;
        $isDeleted = ($kolichestvo <= 0)?1:0;
        $idKategoriy = intval($data['idKategoriy']);
        $cena = floatval($data['cena']);
        $image = isset($data['image']) ? trim($data['image']) : null;
        
        $stmt->bindParam(':Name', $Name);
        $stmt->bindParam(':opisanie', $opisanie);
        $stmt->bindParam(':kolichestvo', $kolichestvo);
        $stmt->bindParam(':idKategoriy', $idKategoriy);
        $stmt->bindParam(':cena', $cena);
        $stmt->bindParam(':image', $image);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Товар успешно добавлен',
                'id' => $db->lastInsertId()
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Ошибка при добавлении товара']);
        }
        break;
        
    case 'PUT':
        // Редактирование товара или мягкое удаление/восстановление
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Не указан ID товара']);
            exit();
        }
        
        $productId = intval($data['id']);
        
        // Если есть isDeleted - это запрос на мягкое удаление/восстановление
        if (isset($data['isDeleted'])) {
            $query = "UPDATE tovar SET isDeleted = :isDeleted WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':isDeleted', $data['isDeleted']);
            $stmt->bindParam(':id', $productId);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => $data['isDeleted'] ? 'Товар перемещен в корзину' : 'Товар восстановлен'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Ошибка при обновлении статуса товара']);
            }
            exit();
        }
        
        // Иначе это редактирование товара
        $fields = [];
        $params = [':id' => $productId];
        
        $updatableFields = ['Name', 'opisanie', 'kolichestvo', 'idKategoriy', 'cena', 'image'];
        foreach ($updatableFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                if (in_array($field, ['kolichestvo', 'idKategoriy'])) {
                    $params[":$field"] = intval($data[$field]);
                } elseif ($field === 'cena') {
                    $params[":$field"] = floatval($data[$field]);
                } else {
                    $params[":$field"] = trim($data[$field]);
                }
            }
        }
        
        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Нет данных для обновления']);
            exit();
        }
        

        if (isset($data['kolichestvo'])) {
            $newQuantity = intval($data['kolichestvo']);
            // Если количество <= 0, товар помечается как удалённый
            // Если количество > 0, товар восстанавливается (isDeleted = 0)
            $autoIsDeleted = ($newQuantity <= 0) ? 1 : 0;
            $fields[] = "isDeleted = :autoIsDeleted";
            $params[':autoIsDeleted'] = $autoIsDeleted;
        }
        
        $query = "UPDATE tovar SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($query);
        
        if ($stmt->execute($params)) {
            echo json_encode([
                'success' => true,
                'message' => 'Товар успешно обновлен'
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Ошибка при обновлении товара']);
        }
        break;
        
    case 'DELETE':
        // Полное удаление товара (физическое)
        $productId = isset($_GET['id']) ? $_GET['id'] : '';
        
        if (!$productId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Не указан ID товара']);
            exit();
        }
        
        // Проверяем, есть ли товар в заказах
        $checkQuery = "SELECT COUNT(*) as count FROM tovarzakaz WHERE idTovar = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':id', $productId);
        $checkStmt->execute();
        $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Нельзя удалить товар, который есть в заказах']);
            exit();
        }
        
        $query = "DELETE FROM tovar WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $productId);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Товар полностью удален'
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Ошибка при удалении товара']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Метод не поддерживается']);
        break;
}
?>