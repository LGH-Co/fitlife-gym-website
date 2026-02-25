<?php
// backend/api/delete_class.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/db_mysql.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->class_id)) {
    echo json_encode(["status" => "error", "message" => "Missing class ID"]);
    exit;
}

try {
    $class_id = (int) $data->class_id;

    // Soft delete: set status to 'archived' instead of removing the row
    $stmt = $pdo->prepare("UPDATE classes SET status = 'archived' WHERE class_id = ?");
    $stmt->execute([$class_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Class securely archived."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Class not found or already archived."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
