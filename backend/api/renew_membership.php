<?php
// backend/api/renew_membership.php
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

if (!isset($data->member_id)) {
    echo json_encode(["status" => "error", "message" => "Missing member ID"]);
    exit;
}

try {
    // Parse the member ID (strip 'M' prefix if present)
    $raw_id = (int) str_replace('M', '', $data->member_id);
    
    // Calculate new dates
    $new_join_date = date('Y-m-d'); // Today
    $new_expiry_date = date('Y-m-d', strtotime('+1 month')); // 1 month from today
    
    // Update the member's join_date, expiry_date, and set status to active
    $stmt = $pdo->prepare("UPDATE members SET join_date = ?, expiry_date = ?, status = 'active' WHERE member_id = ?");
    $stmt->execute([$new_join_date, $new_expiry_date, $raw_id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            "status" => "success", 
            "message" => "Membership renewed successfully!",
            "data" => [
                "member_id" => $raw_id,
                "join_date" => $new_join_date,
                "expiry_date" => $new_expiry_date
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Member not found or no changes made."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
