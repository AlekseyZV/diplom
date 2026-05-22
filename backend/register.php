<?php

// Включаем вывод ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Устанавливаем заголовки CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=utf-8");
// Обрабатываем предварительный запрос OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверяем, что запрос POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Use POST.'
    ]);
    exit();
}

// Получаем данные
$data = json_decode(file_get_contents('php://input'), true);

// Если не получили JSON, пробуем получить из формы
if ($data === null) {
    $data = $_POST;
}

// Логируем полученные данные для отладки
file_put_contents('register_debug.log', date('Y-m-d H:i:s') . " - " . print_r($data, true) . "\n", FILE_APPEND);

// Проверяем обязательные поля
$required_fields = ['name', 'face', 'email', 'phone', 'password'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => "Missing required field: {$field}"
        ]);
        exit();
    }
}

// Подключаем класс базы данных
require_once __DIR__ . '/config/database.php';

try {
    // Создаем подключение к БД
    $database = new Database();
    $db = $database->getConnection();
    
    // Проверяем уникальность email/логина и телефона одним запросом
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $phone = preg_replace('/[^0-9]/', '', $data['phone']);

    $check_sql = "SELECT id, login, phone FROM user WHERE login = :login OR phone = :phone";
    $check_stmt = $db->prepare($check_sql);
    $check_stmt->bindParam(':login', $email);
    $check_stmt->bindParam(':phone', $phone);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
        $existing_user = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        $error_message = '';
        if ($existing_user['login'] === $email) {
            $error_message = 'Пользователь с таким email уже существует';
        } elseif ($existing_user['phone'] == $phone) {
            $error_message = 'Пользователь с таким номером телефона уже существует';
        } else {
            $error_message = 'Пользователь с такими данными уже существует';
        }
        
        http_response_code(409); // Conflict
        echo json_encode([
            'success' => false,
            'error' => $error_message
        ]);
        exit();
    }
    
    // Разделяем ФИО - ПРОСТАЯ И НАДЕЖНАЯ ЛОГИКА
    $nameParts = explode(' ', trim($data['name']));
    $nameParts = array_filter($nameParts); // Удаляем пустые элементы
    
    // Устанавливаем значения по умолчанию
    $familiy = '';
    $imy = '';
    $otchestvo = '';
    
    // Правильно распределяем части ФИО
    if (count($nameParts) >= 1) {
        $familiy = $nameParts[0]; // Первое слово - фамилия
    }
    
    if (count($nameParts) >= 2) {
        $imy = $nameParts[1]; // Второе слово - имя
    }
    
    if (count($nameParts) >= 3) {
        $otchestvo = implode(' ', array_slice($nameParts, 2)); // Все остальные слова - отчество
    }
    
    // Если имя пустое, а фамилия заполнена меняем местами (пользователь мог ввести "Иван Иванов")
    if (empty($imy) && !empty($familiy)) {
        $imy = $familiy;
        $familiy = ''; // Фамилия становится неизвестной
    }
    
    // Проверяем, что хотя бы имя заполнено
    if (empty($imy)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Введите хотя бы имя (первое слово в ФИО)'
        ]);
        exit();
    }
    
    // Очищаем данные
    $login = $email;
    $phone = preg_replace('/[^0-9]/', '', $data['phone']);
    $face = intval($data['face']); // 1 - физическое, 2 - юридическое
    
    // Проверяем валидность номера телефона
    if (strlen($phone) < 10) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Введите корректный номер телефона'
        ]);
        exit();
    }
    
    // Хэшируем пароль
    if (strlen($data['password']) < 6) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Пароль должен быть не менее 6 символов'
        ]);
        exit();
    }

    $password_hash = $data['password'];

    $status = $face; // 1 - физическое, 2 - юридическое
    // Роль всегда 3 (Покупатель)
    $role = 3;
    // Текущая дата
    $dataRegistraciy = date('Y-m-d H:i:s');
    //Блокировка ползователя 0-false, так как он не заблокирован
    $isblocked = 0;

    // Подготавливаем SQL запрос
    $sql = "INSERT INTO user (familiy, imy, otchestvo, status, phone, role, login, password, dataRegistraciy, isBlockes) 
            VALUES (:familiy, :imy, :otchestvo, :status, :phone, :role, :login, :password, :dataRegistraciy, :isblocked)";
    
    $stmt = $db->prepare($sql);
    
    // Привязываем параметры
    $stmt->bindParam(':familiy', $familiy);
    $stmt->bindParam(':imy', $imy);
    $stmt->bindParam(':otchestvo', $otchestvo);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':role', $role);
    $stmt->bindParam(':login', $login);
    $stmt->bindParam(':password', $password_hash);
    $stmt->bindParam(':dataRegistraciy', $dataRegistraciy);
    $stmt->bindParam(':isblocked', $isblocked);
    
    // Выполняем запрос
    if ($stmt->execute()) {
        // Получаем ID нового пользователя
        $userId = $db->lastInsertId();
        
        // Получаем полные данные пользователя для ответа
        $select_sql = "SELECT * FROM user WHERE id = :id";
        $select_stmt = $db->prepare($select_sql);
        $select_stmt->bindParam(':id', $userId);
        $select_stmt->execute();
        $user = $select_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Формируем полное имя для ответа
        $full_name = trim("{$user['familiy']} {$user['imy']} {$user['otchestvo']}");
        
        echo json_encode([
            'success' => true,
            'message' => 'Поздравляем, вы зарегистрировались!',
            'user' => [
                'id' => $user['id'],
                'name' => $full_name,
                'familiy' => $user['familiy'],
                'imy' => $user['imy'],
                'otchestvo' => $user['otchestvo'],
                'status' => $user['status'],
                'phone' => $user['phone'],
                'email' => $user['login'],
                'dataRegistraciy' => $user['dataRegistraciy']
            ]
        ]);
    } else {
        throw new Exception('Не удалось вас зарегистрировать!');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Не удалось вас зарегистрировать!',
        'debug' => $e->getMessage() // Убрать в продакшене
    ]);
}
?>