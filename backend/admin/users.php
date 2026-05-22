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
        // Получение списка пользователей с фильтрацией
        $roleFilter = isset($_GET['role']) ? $_GET['role'] : '';
        
        $query = "SELECT u.*, r.Name as role_name, s.Name as status_name 
                  FROM user u 
                  LEFT JOIN role r ON u.role = r.id 
                  LEFT JOIN statususer s ON u.status = s.id";
        
        if ($roleFilter !== '' && $roleFilter !== 'all') {
            $query .= " WHERE u.role = :role";
        }
        
        $query .= " ORDER BY u.id DESC";
        
        $stmt = $db->prepare($query);
        
        if ($roleFilter !== '' && $roleFilter !== 'all') {
            $stmt->bindParam(':role', $roleFilter);
        }
        
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Убираем пароли из ответа
        foreach ($users as &$user) {
            unset($user['password']);
        }
        
        echo json_encode(['success' => true, 'users' => $users], JSON_UNESCAPED_UNICODE);
        break;
        
    case 'POST':
        // Добавление сотрудника
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Проверка обязательных полей
        if (empty($data['familiy']) || empty($data['imy']) || empty($data['otchestvo']) || 
            empty($data['login']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Заполните все обязательные поля']);
            exit();
        }
        
        // Проверка уникальности email
        $checkQuery = "SELECT id FROM user WHERE login = :login";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':login', $data['login']);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Пользователь с таким email уже существует']);
            exit();
        }
        
        // Добавляем сотрудника (role = 2)
        $query = "INSERT INTO user (familiy, imy, otchestvo, login, password, phone, role, status, dataRegistraciy, isBlocked) 
                  VALUES (:familiy, :imy, :otchestvo, :login, :password, :phone, 2, 1, CURDATE(), 0)";
        
        $stmt = $db->prepare($query);
        
        $familiy = trim($data['familiy']);
        $imy = trim($data['imy']);
        $otchestvo = trim($data['otchestvo']);
        $login = trim($data['login']);
        $password = $data['password']; // В реальном проекте нужно хешировать
        $phone = isset($data['phone']) ? trim($data['phone']) : '';
        
        $stmt->bindParam(':familiy', $familiy);
        $stmt->bindParam(':imy', $imy);
        $stmt->bindParam(':otchestvo', $otchestvo);
        $stmt->bindParam(':login', $login);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':phone', $phone);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Сотрудник успешно добавлен',
                'id' => $db->lastInsertId()
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Ошибка при добавлении сотрудника']);
        }
        break;
        
    case 'PUT':
        // Проверяем, что это за тип PUT запроса (блокировка или редактирование)
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Если есть isBlocked - это запрос на блокировку
        if (isset($data['isBlocked'])) {
            // Блокировка/разблокировка пользователя
            if (!isset($data['userId'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Не указан пользователь']);
                exit();
            }
            
            $query = "UPDATE user SET isBlocked = :isBlocked WHERE id = :userId";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':userId', $data['userId']);
            $stmt->bindParam(':isBlocked', $data['isBlocked']);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => $data['isBlocked'] ? 'Пользователь заблокирован' : 'Пользователь разблокирован'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Ошибка при обновлении статуса']);
            }
        } 
        // Иначе это редактирование пользователя
        else {
            // Редактирование пользователя
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Не указан ID пользователя']);
                exit();
            }
            
            $userId = $data['id'];
            
            // Проверка уникальности email (исключая текущего пользователя)
            if (isset($data['login'])) {
                $checkQuery = "SELECT id FROM user WHERE login = :login AND id != :id";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->bindParam(':login', $data['login']);
                $checkStmt->bindParam(':id', $userId);
                $checkStmt->execute();
                
                if ($checkStmt->rowCount() > 0) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Пользователь с таким email уже существует']);
                    exit();
                }
            }
            
            // Строим запрос динамически
            $fields = [];
            $params = [':id' => $userId];
            
            $updatableFields = ['familiy', 'imy', 'otchestvo', 'login', 'phone', 'role', 'status'];
            foreach ($updatableFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = :$field";
                    $params[":$field"] = trim($data[$field]);
                }
            }
            
            // Если пароль передан и не пустой, обновляем и его
            if (isset($data['password']) && !empty($data['password'])) {
                $fields[] = "password = :password";
                $params[':password'] = $data['password'];
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Нет данных для обновления']);
                exit();
            }
            
            $query = "UPDATE user SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $db->prepare($query);
            
            if ($stmt->execute($params)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Пользователь успешно обновлен'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Ошибка при обновлении пользователя']);
            }
        }
        break;
        
    case 'DELETE':
        // Удаление пользователя
        $userId = isset($_GET['userId']) ? $_GET['userId'] : '';
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Не указан пользователь']);
            exit();
        }
        
        // Проверяем, не пытаемся ли удалить самого себя
        $adminId = checkAdminAuth(); // Получаем ID текущего администратора
        if ($userId == $adminId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Нельзя удалить самого себя']);
            exit();
        }
        
        $db->beginTransaction();
        
        try {
            // Удаляем связанные заказы
            $deleteOrdersQuery = "DELETE FROM zakaz WHERE idUser = :userId";
            $deleteOrdersStmt = $db->prepare($deleteOrdersQuery);
            $deleteOrdersStmt->bindParam(':userId', $userId);
            $deleteOrdersStmt->execute();
            
            // Удаляем пользователя
            $deleteUserQuery = "DELETE FROM user WHERE id = :userId";
            $deleteUserStmt = $db->prepare($deleteUserQuery);
            $deleteUserStmt->bindParam(':userId', $userId);
            $deleteUserStmt->execute();
            
            $db->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Пользователь успешно удален'
            ], JSON_UNESCAPED_UNICODE);
            
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Ошибка при удалении пользователя']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Метод не поддерживается']);
        break;
}
?>