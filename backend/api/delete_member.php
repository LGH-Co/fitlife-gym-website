<?php
// backend/api/delete_member.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->member_id)) {
    echo json_encode(["status" => "error", "message" => "Missing member ID"]);
    exit;
}

try {
    // The frontend sends IDs like 'M001'. We strip the 'M' to get the raw integer for MySQL.
    $raw_id = (int) str_replace('M', '', $data->member_id);

    // Securely update the status instead of dropping the row
    $stmt = $pdo->prepare("UPDATE members SET status = 'archived' WHERE member_id = ?");
    $stmt->execute([$raw_id]);

    echo json_encode(["status" => "success", "message" => "Member securely archived."]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>