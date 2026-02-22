<?php
// backend/api/get_trainers.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

try {
    // SECURITY UPDATE: Soft Delete Filter added to WHERE clause
    $query = "SELECT trainer_id, rfid, first_name, last_name, phone, specialization 
              FROM trainers 
              WHERE is_active = 1";
              
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    $trainers = $stmt->fetchAll();

    echo json_encode([
        "status" => "success",
        "data" => $trainers
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>