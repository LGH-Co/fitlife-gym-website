<?php
// backend/api/delete_trainer.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->trainer_id)) {
    echo json_encode(["status" => "error", "message" => "Missing trainer ID"]);
    exit;
}

try {
    // Strip the 'T' to get the raw integer
    $raw_id = (int) str_replace('T', '', $data->trainer_id);

    // Set is_active to 0 (false)
    $stmt = $pdo->prepare("UPDATE trainers SET is_active = 0 WHERE trainer_id = ?");
    $stmt->execute([$raw_id]);

    echo json_encode(["status" => "success", "message" => "Trainer securely archived."]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>