<?php

// Включаем вывод ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Добавим диагностику в начало файла
file_put_contents(__DIR__ . '/login_debug.log', date('Y-m-d H:i:s') . " - Начало обработки login.php\n", FILE_APPEND);

// Устанавливаем заголовки CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

// Обрабатываем предварительный запрос OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents(__DIR__ . '/login_debug.log', "OPTIONS запрос\n", FILE_APPEND);
    http_response_code(200);
    exit();
}

// Проверяем, что запрос POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    file_put_contents(__DIR__ . '/login_debug.log', "Ошибка: метод {$_SERVER['REQUEST_METHOD']}\n", FILE_APPEND);
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Use POST.'
    ]);
    exit();
}

// Получаем данные
$input = file_get_contents('php://input');
file_put_contents(__DIR__ . '/login_debug.log', "Получены данные: " . $input . "\n", FILE_APPEND);

$data = json_decode($input, true);

// Если не получили JSON, пробуем получить из формы
if ($data === null) {
    $data = $_POST;
    file_put_contents(__DIR__ . '/login_debug.log', "Используем POST данные\n", FILE_APPEND);
}

// Проверяем обязательные поля
if (empty($data['email']) || empty($data['password'])) {
    file_put_contents(__DIR__ . '/login_debug.log', "Ошибка: не все поля заполнены\n", FILE_APPEND);
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Заполните email и пароль'
    ]);
    exit();
}

// Подключаем класс базы данных
require_once __DIR__ . '/config/database.php';

try {
    // Создаем подключение к БД
    $database = new Database();
    $db = $database->getConnection();
    
    // Очищаем данные
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];
    
    // Ищем пользователя по логину (email)
    $sql = "SELECT * FROM user WHERE login = :login";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':login', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        // Пользователь не найден
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Пользователь с таким email не найден'
        ]);
        exit();
    }
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Проверяем, заблокирован ли аккаунт
    if ($user['isBlocked'] == 1) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Аккаунт заблокирован. Обратитесь к администратору.'
        ]);
        exit();
    }
    
    // Проверяем пароль 
    if ($password === $user['password']) {  
        // Успешная авторизация
        
        // Возвращаем данные пользователя (без пароля)
        unset($user['password']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Вход выполнен успешно',
            'user' => $user,
            'token' => base64_encode(json_encode([
                'id' => $user['id'],
                'email' => $user['login'],
                'role' => $user['role']
            ]))
        ]);
    } else {
        // Неверный пароль
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Неверный пароль'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка сервера при авторизации',
        'debug' => $e->getMessage()
    ]);
}
?>