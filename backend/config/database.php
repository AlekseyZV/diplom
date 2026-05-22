<?php
class Database {
    private $host = "localhost";
    private $db_name = "yrprodsnabservis_db_kurs";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username, 
                $this->password,
                [
                    PDO::ATTR_EMULATE_PREPARES => false, 
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]
            );
            return $this->conn;
        } catch(PDOException $e) {
            // Логируем ошибку
            error_log("Ошибка подключения к БД: " . $e->getMessage());
            die(json_encode([
                'success' => false,
                'error' => 'Ошибка подключения к базе данных'
            ]));
        }
    }
}
?>