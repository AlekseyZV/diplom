<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=utf-8");

// Обработка OPTIONS запроса ДО всего остального
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Функция для очистки и валидации строковых данных
function sanitizeString($input) {
    
    $cleaned = strip_tags($input);      // Удаляем HTML/XML теги
    $cleaned = trim($cleaned);          // Удаляем лишние пробелы
    $cleaned = htmlspecialchars($cleaned, ENT_QUOTES, 'UTF-8');     // Преобразуем специальные символы в HTML-сущности
    return $cleaned;
}

// Функция для валидации email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Функция для валидации телефона
function validatePhone($phone) {
    $cleaned = preg_replace('/[^0-9]/', '', $phone);    // Оставляем только цифры
    return (strlen($cleaned) >= 10);                    // Проверяем минимальную длину (10 цифр - код страны + номер)
}

// Функция для валидации имени (ФИО)
function validateName($name) {
    // Проверяем, что имя содержит только буквы, пробелы, дефисы, апострофы и кириллицу
    return preg_match('/^[\p{L}\s\-\']+$/u', $name) && strlen($name) >= 2;
}

function checkRateLimit($ip, $limit = 10, $period = 60) {
    $key = 'rate_limit_' . md5($ip);
    $cacheFile = __DIR__ . '/cache/' . $key;
    
    if (file_exists($cacheFile)) {
        $data = json_decode(file_get_contents($cacheFile), true);
        if (time() - $data['timestamp'] < $period) {
            if ($data['count'] >= $limit) {
                return false;
            }
            $data['count']++;
        } else {
            $data = ['count' => 1, 'timestamp' => time()];
        }
    } else {
        $data = ['count' => 1, 'timestamp' => time()];
    }
    
    // Создаем папку cache если ее нет
    if (!is_dir(__DIR__ . '/cache')) {
        mkdir(__DIR__ . '/cache', 0755, true);
    }
    
    @file_put_contents($cacheFile, json_encode($data));
    return true;
}

// Проверка rate limiting
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
if (!checkRateLimit($clientIp, 5, 60)) { // 5 запросов в минуту
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'error' => 'Слишком много запросов. Попробуйте позже.'
    ]);
    exit();
}

require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Получаем данные из POST запроса
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Проверяем, что данные получены
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Некорректный JSON формат данных'
        ]);
        exit();
    }
    
    // Санитизация и валидация данных
    $name = sanitizeString($input['name'] ?? '');
    $email = sanitizeString($input['email'] ?? '');
    $rawPhone = $input['phone'] ?? '';
    
    // Валидация email
    if (!validateEmail($email)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Некорректный email адрес'
        ]);
        exit();
    }
    
    // Валидация телефона
    if (!validatePhone($rawPhone)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Некорректный номер телефона. Введите минимум 10 цифр'
        ]);
        exit();
    }
    
    // Валидация имени
    if (!validateName($name)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Некорректное имя. Используйте только буквы и пробелы'
        ]);
        exit();
    }
    
    // Проверяем способ доставки
    $allowedDeliveryTypes = ['pickup', 'delivery'];
    $deliveryType = sanitizeString($input['deliveryType'] ?? '');
    if (!in_array($deliveryType, $allowedDeliveryTypes)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Некорректный способ доставки'
        ]);
        exit();
    }
    
    // Проверяем способ оплаты
    $allowedPaymentTypes = ['cash', 'card'];
    $paymentType = sanitizeString($input['paymentType'] ?? '');
    if (!in_array($paymentType, $allowedPaymentTypes)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Некорректный способ оплаты'
        ]);
        exit();
    }
    
    // Проверяем адрес доставки (если требуется)
    $address = '';
    if ($deliveryType === 'delivery') {
        $address = sanitizeString($input['address'] ?? '');
        if (empty($address)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Адрес доставки обязателен для курьерской доставки'
            ]);
            exit();
        }
    }
    
    // Проверяем корзину
    if (!isset($input['cartItems']) || !is_array($input['cartItems']) || empty($input['cartItems'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Корзина пуста'
        ]);
        exit();
    }
    
    // Валидация каждого товара в корзине
    $cartItems = [];
    foreach ($input['cartItems'] as $index => $item) {
        // Проверяем обязательные поля
        if (!isset($item['id']) || !isset($item['quantity'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => "Товар на позиции {$index} не содержит обязательных полей"
            ]);
            exit();
        }
        
        // Проверяем типы данных
        $productId = filter_var($item['id'], FILTER_VALIDATE_INT);
        $quantity = filter_var($item['quantity'], FILTER_VALIDATE_INT);
        
        if ($productId === false || $productId <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => "Некорректный ID товара на позиции {$index}"
            ]);
            exit();
        }
        
        if ($quantity === false || $quantity <= 0 || $quantity > 999) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => "Некорректное количество товара на позиции {$index} (допустимо: 1-999)"
            ]);
            exit();
        }
        
        // Сохраняем проверенные данные
        $cartItems[] = [
            'id' => $productId,
            'quantity' => $quantity,
            'name' => sanitizeString($item['name'] ?? 'Неизвестный товар'),
            'price' => filter_var($item['price'] ?? 0, FILTER_VALIDATE_FLOAT)
        ];
    }
    
    // Разделяем ФИО на составляющие
    $fioParts = explode(' ', trim($name));
    $familiy = $fioParts[0] ?? '';
    $imy = $fioParts[1] ?? '';
    $otchestvo = $fioParts[2] ?? '';
    
    // Если недостаточно частей ФИО
    if (empty($familiy) || empty($imy)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Введите фамилию и имя (минимум 2 слова)'
        ]);
        exit();
    }
    
    // Очищаем телефон (оставляем только цифры)
    $phone = preg_replace('/[^0-9]/', '', $rawPhone);
    
    // Начинаем транзакцию
    $db->beginTransaction();
    
    try {
        // Проверяем существующего пользователя
        $checkUserQuery = "SELECT id FROM user WHERE login = :login AND phone = :phone";
        $checkStmt = $db->prepare($checkUserQuery);
        $checkStmt->bindValue(':login', $email, PDO::PARAM_STR);
        $checkStmt->bindValue(':phone', $phone, PDO::PARAM_STR);
        $checkStmt->execute();
        
        $existingUser = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingUser) {
            // Пользователь уже существует
            $userId = (int)$existingUser['id'];
            $isNewUser = false;
        } else {
            // Создаем нового пользователя
            // Генерируем случайный пароль из 6 цифр
            $password = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            
            $insertUserQuery = "INSERT INTO user 
                (familiy, imy, otchestvo, dateRojdeniy, status, phone, role, login, password, dataRegistraciy, isBlocked) 
                VALUES (:familiy, :imy, :otchestvo, NULL, 1, :phone, 4, :login, :password, CURDATE(), 0)";
            
            $userStmt = $db->prepare($insertUserQuery);
            $userStmt->bindValue(':familiy', $familiy, PDO::PARAM_STR);
            $userStmt->bindValue(':imy', $imy, PDO::PARAM_STR);
            $userStmt->bindValue(':otchestvo', $otchestvo, PDO::PARAM_STR);
            $userStmt->bindValue(':phone', $phone, PDO::PARAM_STR);
            $userStmt->bindValue(':login', $email, PDO::PARAM_STR);
            $userStmt->bindValue(':password', $password, PDO::PARAM_STR);
            
            if (!$userStmt->execute()) {
                throw new Exception('Ошибка создания пользователя: ' . implode(', ', $userStmt->errorInfo()));
            }
            
            $userId = (int)$db->lastInsertId();
            $isNewUser = true;
        }
        
        // Создаем заказ
        $insertOrderQuery = "INSERT INTO zakaz 
            (idUser, status, oplata, dateSozdaniy, dostavka) VALUES (:userId, 1, :paymentType, CURDATE(), :deliveryType)";
        $orderStmt = $db->prepare($insertOrderQuery);
        $orderStmt->bindValue(':userId', $userId, PDO::PARAM_INT);
        $orderStmt->bindValue(':paymentType', $paymentType, PDO::PARAM_STR);
        $orderStmt->bindValue(':deliveryType', $deliveryType, PDO::PARAM_STR);
        
        if (!$orderStmt->execute()) {
            throw new Exception('Ошибка создания заказа: ' . implode(', ', $orderStmt->errorInfo()));
        }
        
        $orderId = (int)$db->lastInsertId();
        
        // Добавляем товары в заказ
        $insertItemsQuery = "INSERT INTO tovarzakaz (idTovar, kolichestvo, idZakaz) VALUES (:productId, :quantity, :orderId)";
        $itemsStmt = $db->prepare($insertItemsQuery);
        
        foreach ($cartItems as $item) {
            // Проверяем, что товар существует и есть в наличии
            $checkProductQuery = "SELECT id, Name, kolichestvo FROM tovar WHERE id = :productId";
            $productStmt = $db->prepare($checkProductQuery);
            $productStmt->bindValue(':productId', $item['id'], PDO::PARAM_INT);
            $productStmt->execute();
            
            $product = $productStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$product) {
                throw new Exception("Товар с ID {$item['id']} не найден в базе данных");
            }
            
            // Проверяем наличие
            if ($product['kolichestvo'] !== null && $item['quantity'] > (int)$product['kolichestvo']) {
                throw new Exception("Товара '{$product['Name']}' недостаточно в наличии. Доступно: {$product['kolichestvo']}, запрошено: {$item['quantity']}");
            }
            
            // Добавляем товар в заказ
            $itemsStmt->bindValue(':productId', $item['id'], PDO::PARAM_INT);
            $itemsStmt->bindValue(':quantity', $item['quantity'], PDO::PARAM_INT);
            $itemsStmt->bindValue(':orderId', $orderId, PDO::PARAM_INT);
            
            if (!$itemsStmt->execute()) {
                throw new Exception('Ошибка добавления товара в заказ: ' . implode(', ', $itemsStmt->errorInfo()));
            }
            
            // Обновляем количество товара на складе (если требуется)
            if ($product['kolichestvo'] !== null) {
                $updateQuantityQuery = "UPDATE tovar SET kolichestvo = kolichestvo - :quantity WHERE id = :productId";
                $updateStmt = $db->prepare($updateQuantityQuery);
                $updateStmt->bindValue(':quantity', $item['quantity'], PDO::PARAM_INT);
                $updateStmt->bindValue(':productId', $item['id'], PDO::PARAM_INT);
                
                if (!$updateStmt->execute()) {
                    throw new Exception('Ошибка обновления количества товара: ' . implode(', ', $updateStmt->errorInfo()));
                }

                $checkQuantityQuery = "SELECT kolichestvo FROM tovar WHERE id = :productId";
                $checkQuantityStmt = $db->prepare($checkQuantityQuery);
                $checkQuantityStmt->bindValue(':productId', $item['id'], PDO::PARAM_INT);
                $checkQuantityStmt->execute();
                $newQuantity = (int)$checkQuantityStmt->fetchColumn();
                
                if ($newQuantity <= 0) {
                    // Товар закончился - помечаем как удалённый
                    $updateDeletedQuery = "UPDATE tovar SET isDeleted = 1 WHERE id = :productId AND (isDeleted IS NULL OR isDeleted = 0)";
                    $updateDeletedStmt = $db->prepare($updateDeletedQuery);
                    $updateDeletedStmt->bindValue(':productId', $item['id'], PDO::PARAM_INT);
                    $updateDeletedStmt->execute();
                }   
            }
        }
        
        // Подтверждаем транзакцию
        $db->commit();
        
        // Формируем ответ
        $response = [
            'success' => true,
            'message' => 'Заказ успешно оформлен',
            'data' => [
                'orderId' => $orderId,
                'userId' => $userId,
                'isNewUser' => $isNewUser,
                'created' => date('Y-m-d H:i:s'),
                'itemsCount' => count($cartItems),
                'totalAmount' => array_reduce($cartItems, function($sum, $item) {
                    return $sum + ($item['price'] * $item['quantity']);
                }, 0)
            ]
        ];
        
        // Логирование успешного заказа
        $logMessage = date('Y-m-d H:i:s') . " - Заказ #{$orderId} создан для пользователя #{$userId} " . 
                     ($isNewUser ? '(новый пользователь)' : '(существующий пользователь)') . 
                     " - Товаров: " . count($cartItems) . PHP_EOL;
        error_log($logMessage, 3, __DIR__ . '/order_log.txt');
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        
    } catch (Exception $e) {
        // Откатываем транзакцию при ошибке
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        
        // Логирование ошибки
        $errorLog = date('Y-m-d H:i:s') . " - Ошибка оформления заказа: " . $e->getMessage() . 
                   " - IP: " . $clientIp . PHP_EOL;
        error_log($errorLog, 3, __DIR__ . '/error_log.txt');
        
        throw $e; // Передаем исключение дальше для обработки в основном блоке catch
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка сервера при оформлении заказа: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>