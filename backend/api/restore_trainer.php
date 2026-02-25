<?php
// backend/api/restore_trainer.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/db_mysql.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->trainer_id)) {
    echo json_encode(["status" => "error", "message" => "Missing trainer ID"]);
    exit;
}

try {
    $raw_id = (int) str_replace('T', '', $data->trainer_id);

    $stmt = $pdo->prepare("UPDATE trainers SET is_active = 1 WHERE trainer_id = ?");
    $stmt->execute([$raw_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Trainer restored successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Trainer not found or already active."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
