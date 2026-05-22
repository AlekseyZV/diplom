<?php
// Включаем вывод ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Устанавливаем заголовки CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
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
file_put_contents('contact_debug.log', date('Y-m-d H:i:s') . " - " . print_r($data, true) . "\n", FILE_APPEND);

// Проверяем обязательные поля
if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields: name, email, message'
    ]);
    exit();
}

// Подключаем класс базы данных
require_once __DIR__ . '/config/database.php';

try {
    // Создаем подключение к БД
    $database = new Database();
    $db = $database->getConnection();
    
    // Разделяем ФИО
    $nameParts = explode(' ', trim($data['name']));
    $familiy = isset($nameParts[0]) ? $nameParts[0] : '';
    $imy = isset($nameParts[1]) ? $nameParts[1] : '';
    $otchestvo = isset($nameParts[2]) ? $nameParts[2] : '';
    
    // Если только имя, перемещаем его в фамилию
    if (!empty($imy) && empty($familiy)) {
        $familiy = $imy;
        $imy = $otchestvo;
        $otchestvo = '';
    }
    
    // Очищаем данные
    $pochta = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $phone = isset($data['phone']) ? preg_replace('/[^0-9]/', '', $data['phone']) : null;
    $komment = htmlspecialchars($data['message'], ENT_QUOTES, 'UTF-8');
    
    // Подготавливаем SQL запрос
    $sql = "INSERT INTO obrantaysvyz (familiy, imy, otchestvo, pochta, phone, komment) 
            VALUES (:familiy, :imy, :otchestvo, :pochta, :phone, :komment)";
    
    $stmt = $db->prepare($sql);
    
    // Привязываем параметры
    $stmt->bindParam(':familiy', $familiy);
    $stmt->bindParam(':imy', $imy);
    $stmt->bindParam(':otchestvo', $otchestvo);
    $stmt->bindParam(':pochta', $pochta);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':komment', $komment);
    
    // Выполняем запрос
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.',
            'id' => $db->lastInsertId()
        ]);
    } else {
        throw new Exception('Failed to insert data');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'debug' => $e->getMessage()
    ]);
}
?>