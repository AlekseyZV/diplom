<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_log("=== PROFILE API REQUEST ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("URI: " . $_SERVER['REQUEST_URI']);

require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    switch ($_SERVER['REQUEST_METHOD']) {
        
        case 'GET':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Не указан ID']);
                exit();
            }
            
            $userId = intval($_GET['id']);
            error_log("GET profile for ID: " . $userId);
            
            $sql = "SELECT u.id, u.familiy, u.imy, u.otchestvo, u.dateRojdeniy, u.phone, u.login, u.dataRegistraciy, u.isBlocked, u.role, r.Name as role_name 
                    FROM user u LEFT JOIN role r ON u.role = r.id WHERE u.id = :id";
            
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':id', $userId);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                error_log("User found: " . json_encode($user));
                
                $response = [
                    'success' => true,
                    'user' => [
                        'id' => (int)$user['id'],
                        'familiy' => $user['familiy'] ?? '',
                        'imy' => $user['imy'] ?? '',
                        'otchestvo' => $user['otchestvo'] ?? '',
                        'dateRojdeniy' => $user['dateRojdeniy'] ?? '',
                        'phone' => (string)($user['phone'] ?? ''),
                        'login' => $user['login'] ?? '',
                        'dataRegistraciy' => $user['dataRegistraciy'] ?? '',
                        'isBlocked' => (bool)$user['isBlocked'],
                        'role' => (int)$user['role'],
                        'role_name' => $user['role_name'] ?? 'Покупатель'
                    ]
                ];
                
                echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Пользователь не найден']);
            }
            break;
        
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            error_log("POST data: " . json_encode($data));
            
            // Обработка блокировки аккаунта (вместо удаления)
            if (isset($data['operation']) && $data['operation'] === 'block') {
                if (!isset($data['id'])) {
                    throw new Exception('Не указан ID для блокировки');
                }
                $userId = intval($data['id']);
                error_log("Block user ID: " . $userId);
                
                // Устанавливаем isBlocked = 1
                $sql = "UPDATE user SET isBlocked = 1 WHERE id = :id";
                $stmt = $db->prepare($sql);
                $stmt->bindParam(':id', $userId);
                
                if ($stmt->execute()) {
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Аккаунт заблокирован',
                        'blocked' => true
                    ]);
                } else {
                    throw new Exception('Ошибка блокировки: ' . print_r($stmt->errorInfo(), true));
                }
                break;
            }
            
            // Обновление профиля
            if (!isset($data['id'])) {
                throw new Exception('Не указан ID пользователя');
            }
            
            $userId = intval($data['id']);
            $fields = [];
            $params = [':id' => $userId];
            
            // Получаем текущие данные пользователя для сравнения
            $currentSql = "SELECT login, phone FROM user WHERE id = :id";
            $currentStmt = $db->prepare($currentSql);
            $currentStmt->bindParam(':id', $userId);
            $currentStmt->execute();
            $currentUser = $currentStmt->fetch(PDO::FETCH_ASSOC);
            
            if (isset($data['familiy'])) {
                $fields[] = "familiy = :familiy";
                $params[':familiy'] = trim($data['familiy']);
            }
            if (isset($data['imy'])) {
                $fields[] = "imy = :imy";
                $params[':imy'] = trim($data['imy']);
            }
            if (isset($data['otchestvo'])) {
                $fields[] = "otchestvo = :otchestvo";
                $params[':otchestvo'] = trim($data['otchestvo']);
            }
            if (isset($data['dateRojdeniy'])) {
                $fields[] = "dateRojdeniy = :dateRojdeniy";
                $params[':dateRojdeniy'] = $data['dateRojdeniy'] ?: null;
            }
            
            // Для phone - проверяем уникальность только если изменился
            if (isset($data['phone']) && trim($data['phone']) !== (string)$currentUser['phone']) {
                // Проверка уникальности phone
                $checkPhoneSql = "SELECT id FROM user WHERE phone = :phone AND id != :id";
                $checkPhoneStmt = $db->prepare($checkPhoneSql);
                $checkPhoneStmt->execute([':phone' => trim($data['phone']), ':id' => $userId]);
                if ($checkPhoneStmt->rowCount() > 0) {
                    throw new Exception('Телефон уже используется');
                }
                $fields[] = "phone = :phone";
                $params[':phone'] = trim($data['phone']);
            }
            
            // Для login - проверяем уникальность только если изменился
            if (isset($data['login']) && trim($data['login']) !== $currentUser['login']) {
                // Проверка уникальности
                $checkSql = "SELECT id FROM user WHERE login = :login AND id != :id";
                $checkStmt = $db->prepare($checkSql);
                $checkStmt->execute([':login' => trim($data['login']), ':id' => $userId]);
                if ($checkStmt->rowCount() > 0) {
                    http_response_code(409);
                    echo json_encode(['success' => false, 'error' => 'Email уже используется']);
                    exit();
                }
                $fields[] = "login = :login";
                $params[':login'] = trim($data['login']);
            }
            
            if (isset($data['password'])) {
                $hashed = $data['password']; 
                $fields[] = "password = :password";
                $params[':password'] = $hashed;
            }
            
            if (empty($fields)) {
                throw new Exception('Нет данных для обновления');
            }
            
            $sql = "UPDATE user SET " . implode(', ', $fields) . " WHERE id = :id";
            error_log("SQL: $sql");
            error_log("Params: " . json_encode($params));
            
            $stmt = $db->prepare($sql);
            if ($stmt->execute($params)) {
                // Получаем обновленного пользователя
                $updatedSql = "SELECT u.id, u.familiy, u.imy, u.otchestvo, u.dateRojdeniy, u.phone, u.login, u.dataRegistraciy, u.isBlocked, u.role, r.Name as role_name 
                               FROM user u LEFT JOIN role r ON u.role = r.id WHERE u.id = :id";
                $updatedStmt = $db->prepare($updatedSql);
                $updatedStmt->bindParam(':id', $userId);
                $updatedStmt->execute();
                $updated_user = $updatedStmt->fetch(PDO::FETCH_ASSOC);
                
                $response = [
                    'success' => true,
                    'message' => 'Профиль успешно обновлен',
                    'user' => [
                        'id' => (int)$updated_user['id'],
                        'familiy' => $updated_user['familiy'] ?? '',
                        'imy' => $updated_user['imy'] ?? '',
                        'otchestvo' => $updated_user['otchestvo'] ?? '',
                        'dateRojdeniy' => $updated_user['dateRojdeniy'] ?? '',
                        'phone' => (string)($updated_user['phone'] ?? ''),
                        'login' => $updated_user['login'] ?? '',
                        'dataRegistraciy' => $updated_user['dataRegistraciy'] ?? '',
                        'isBlocked' => (bool)$updated_user['isBlocked'],
                        'role' => (int)$updated_user['role'],
                        'role_name' => $updated_user['role_name'] ?? 'Покупатель'
                    ]
                ];
                
                echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            } else {
                error_log("Update error: " . print_r($stmt->errorInfo(), true));
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Ошибка при обновлении профиля']);
            }
            break;

        case 'DELETE':
            // Для DELETE запроса
            parse_str(file_get_contents('php://input'), $deleteData);
            
            if (!isset($deleteData['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Не указан ID для блокировки']);
                exit();
            }
            
            $userId = intval($deleteData['id']);
            error_log("DELETE/Block user ID: " . $userId);
            
            // Устанавливаем isBlocked = 1
            $sql = "UPDATE user SET isBlocked = 1 WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':id', $userId);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Аккаунт заблокирован',
                    'blocked' => true
                ]);
            } else {
                error_log("Block error: " . print_r($stmt->errorInfo(), true));
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Ошибка блокировки аккаунта']);
            }
            break;
        
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    error_log("Ошибка в profile.php: " . $e->getMessage());
    error_log("Стек вызовов: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Внутренняя ошибка сервера', 'debug' => $e->getMessage()]);
}
?>