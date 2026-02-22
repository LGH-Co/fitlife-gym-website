<?php
// backend/api/get_trainers.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

try {
    $query = "SELECT trainer_id, rfid, first_name, last_name, specialization FROM trainers";
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