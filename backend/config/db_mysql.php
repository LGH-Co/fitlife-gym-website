<?php
// backend/config/db_mysql.php
date_default_timezone_set('Asia/Manila');

$host = '127.0.0.1';
$port = '3307';         // use port 3307
$db   = 'fitlife_gym';
$user = 'root'; 
$pass = '';     

// Port variable into the connection string
$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, 
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       
    PDO::ATTR_EMULATE_PREPARES   => false, 
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die(json_encode(["error" => "MySQL Connection Failed: " . $e->getMessage()])); 
}
?>