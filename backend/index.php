<?php
// index.php - начало файла
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ВАЖНО: CORS заголовки для всех запросов
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=utf-8");

// ОБРАБОТКА OPTIONS ЗАПРОСОВ (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=utf-8");

// Получаем путь запроса
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$script_name = $_SERVER['SCRIPT_NAME'];

// Определяем базовый путь
$base_path = dirname($script_name);
if ($base_path === '/') {
    $base_path = '';
}

// Убираем базовый путь из request_uri
$path = substr($request_uri, strlen($base_path));
$path = trim($path, '/');

// Логируем для отладки
error_log("========================================");
error_log("Request URI: " . $request_uri);
error_log("Script Name: " . $script_name);
error_log("Base Path: " . $base_path);
error_log("Path: " . $path);
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);

// Разбиваем путь на части
$path_parts = explode('/', $path);

error_log("Path parts: " . print_r($path_parts, true));

// Простой роутер
$route_handled = false;

// Обработка API маршрутов
if (count($path_parts) >= 2 && $path_parts[0] === 'api') {
    $route_handled = true;
    $route_name = $path_parts[1];
    
    error_log("API route detected: " . $route_name);
    
    switch ($route_name) {
        case 'products':
            require_once __DIR__ . '/products.php';
            break;
        case 'categories':
            require_once __DIR__ . '/categories.php';
            break;
        case 'checkout':
            require_once __DIR__ . '/checkout.php';
            break;
        case 'contact':
            require_once __DIR__ . '/contact.php';
            break;
        case 'register':
            require_once __DIR__ . '/register.php';
            break;
        case 'login':
            require_once __DIR__ . '/login.php';
            break;
        case 'orders':
            require_once __DIR__ . '/orders.php';
            break;
        case 'profile':
            require_once __DIR__ . '/profile.php';
            break;
        default:
            $route_handled = false;
            break;
    }
}
// Обработка маршрутов админ-панели
if (!$route_handled && count($path_parts) >= 2 && $path_parts[0] === 'admin') {
    $route_handled = true;
    $route_name = $path_parts[1];
    
    error_log("Admin route detected: " . $route_name);
    
    // Проверяем существование файла в папке admin
    $admin_file = __DIR__ . '/admin/' . $route_name . '.php';
    
    if (file_exists($admin_file)) {
        require_once $admin_file;
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Admin route not found',
            'route' => $route_name
        ], JSON_UNESCAPED_UNICODE);
    }
}
// Прямой доступ к файлам (для совместимости)
if (!$route_handled) {
    switch ($path) {
        case 'products.php':
            error_log("Direct products.php request");
            require_once __DIR__ . '/products.php';
            $route_handled = true;
            break;
        case 'categories.php':
            error_log("Direct categories.php request");
            require_once __DIR__ . '/categories.php';
            $route_handled = true;
            break;
        case 'checkout.php':
            error_log("Direct checkout.php request");
            require_once __DIR__ . '/checkout.php';
            $route_handled = true;
            break;
        case 'contact.php':
            error_log("Direct contact.php request");
            require_once __DIR__ . '/contact.php';
            $route_handled = true;
            break;
        case 'register.php':
            error_log("Direct register.php request");
            require_once __DIR__ . '/register.php';
            $route_handled = true;
            break;
        case 'login.php':
            error_log("Direct login.php request");
            require_once __DIR__ . '/login.php';
            $route_handled = true;
            break;
        case 'orders.php':
            error_log("Direct orders.php request");
            require_once __DIR__ . '/orders.php';
            $route_handled = true;
            break;
        case 'profile.php':
            error_log("Direct profile.php request");
            require_once __DIR__ . '/profile.php';
            $route_handled = true;
            break;
        // Прямой доступ к admin файлам
        case strpos($path, 'admin/') === 0:
            error_log("Direct admin file request: " . $path);
            $admin_file = __DIR__ . '/' . $path;
            if (file_exists($admin_file)) {
                require_once $admin_file;
                $route_handled = true;
            }
            break;

    }
}

// Если ни один маршрут не подошел - 404
if (!$route_handled) {
    error_log("404 - Route not found: " . $path);
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Маршрут не найден',
        'path' => $path,
        'available_routes' => [
            '/api/products',
            '/api/categories', 
            '/api/checkout',
            '/api/contact',
            '/api/register',
            '/api/login',
            '/api/orders',
            '/api/profile',
            
            '/admin/stats',
            '/admin/users',
            '/admin/products',
            '/admin/orders',
            '/admin/feedback'
            
            '/products.php',
            '/categories.php',
            '/checkout.php',
            '/contact.php',
            '/orders.php',
            '/login.php',
            '/register.php',
            '/profile.php'
        ]
    ], JSON_UNESCAPED_UNICODE);
}
?>