<?php

// Устанавливаем заголовки CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Обработка OPTIONS запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // ===== ПОЛУЧЕНИЕ ОДНОГО ТОВАРА ПО ID =====
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = intval($_GET['id']);
        
        $query = "SELECT 
                    t.id,
                    t.Name as name,
                    t.opisanie,
                    t.kolichestvo,
                    t.idKategoriy,
                    t.cena,
                    t.image,
                    k.Name as category_name
                  FROM tovar t
                  LEFT JOIN kategoriy k ON t.idKategoriy = k.id
                  WHERE t.id = :id 
                  AND ( t.isDeleted = 0 OR t.isDeleted IS NULL )";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($product) {
            // Обработка изображения
            if (!empty($product['image'])) {
                $product['image'] = '/images/products/' . basename($product['image']);
            } else {
                $product['image'] = '/images/products/picture.png';
            }
            
            // Очистка данных
            $product['name'] = htmlspecialchars($product['name'], ENT_QUOTES, 'UTF-8');
            if ($product['opisanie']) {
                $product['opisanie'] = htmlspecialchars($product['opisanie'], ENT_QUOTES, 'UTF-8');
            }
            
            // Форматирование цены
            if ($product['cena'] !== null && $product['cena'] > 0) {
                $product['price'] = floatval($product['cena']);
                $product['formatted_price'] = number_format($product['price'], 2, '.', ' ') . ' ₽';
            } else {
                $product['price'] = 0;
                $product['formatted_price'] = 'Цена не указана';
            }
            
            echo json_encode([
                'success' => true,
                'data' => $product
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Товар не найден'
            ], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }
    
    // ===== СПИСОК ТОВАРОВ (если нет id) =====
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $category = isset($_GET['category']) ? $_GET['category'] : 'all';
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 24;
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $offset = ($page - 1) * $limit;
    
    // Базовый запрос с фильтром по isDeleted
    $query = "SELECT 
                t.id,
                t.Name as name,
                t.opisanie,
                t.kolichestvo,
                t.idKategoriy,
                t.cena,
                t.image,
                k.Name as category_name
              FROM tovar t
              LEFT JOIN kategoriy k ON t.idKategoriy = k.id
              WHERE (t.isDeleted = 0 OR t.isDeleted IS NULL)
              AND (t.kolichestvo != 0)";
    
    $params = [];
    
    // Фильтр по поиску
    if (!empty($search)) {
        $query .= " AND t.Name LIKE :search";
        $params[':search'] = '%' . $search . '%';
    }
    
    // Фильтр по категории
    if ($category !== 'all') {
        if (is_numeric($category)) {
            $query .= " AND t.idKategoriy = :category_id";
            $params[':category_id'] = intval($category);
        } else {
            $query .= " AND k.Name = :category_name";
            $params[':category_name'] = $category;
        }
    }
    
    $query .= " ORDER BY t.id ASC LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Подсчет общего количества (только неудаленные товары)
    $countQuery = "SELECT COUNT(*) as total 
                   FROM tovar t
                   WHERE (t.kolichestvo != 0 and t.isDeleted = 0 OR t.isDeleted IS NULL)";
    
    if (!empty($search)) {
        $countQuery .= " AND t.Name LIKE :search";
    }
    if ($category !== 'all' && is_numeric($category)) {
        $countQuery .= " AND t.idKategoriy = :category_id";
    }
    
    $countStmt = $db->prepare($countQuery);
    if (!empty($search)) {
        $countStmt->bindValue(':search', '%' . $search . '%');
    }
    if ($category !== 'all' && is_numeric($category)) {
        $countStmt->bindValue(':category_id', intval($category));
    }
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Обработка данных
    foreach ($products as &$product) {
        $product['name'] = htmlspecialchars($product['name'], ENT_QUOTES, 'UTF-8');
        
        if (!empty($product['image'])) {
            $product['image'] = '/images/products/' . basename($product['image']);
        } else {
            $product['image'] = '/images/products/picture.png';
        }
        
        if ($product['cena'] !== null && $product['cena'] > 0) {
            $product['price'] = floatval($product['cena']);
            $product['formatted_price'] = number_format($product['price'], 2, '.', ' ') . ' ₽';
        } else {
            $product['price'] = 0;
            $product['formatted_price'] = 'Цена не указана';
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'products' => $products,
            'pagination' => [
                'total' => (int)$total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка сервера: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>