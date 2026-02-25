<?php
// backend/api/restore_member.php
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

if (!isset($data->member_id)) {
    echo json_encode(["status" => "error", "message" => "Missing member ID"]);
    exit;
}

try {
    $raw_id = (int) str_replace('M', '', $data->member_id);

    $stmt = $pdo->prepare("UPDATE members SET status = 'active' WHERE member_id = ?");
    $stmt->execute([$raw_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Member restored successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Member not found or already active."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
