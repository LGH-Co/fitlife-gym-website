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

if (!isset($data->member_id) || !isset($data->plan_id)) {
    echo json_encode(["status" => "error", "message" => "Missing member ID or plan ID"]);
    exit;
}

try {
    $raw_id = (int) str_replace('M', '', $data->member_id);
    $plan_id = (int) $data->plan_id;

    // Look up the selected plan's duration
    $planStmt = $pdo->prepare("SELECT membership_plan_id, plan_name, duration_months, price FROM membership_plan WHERE membership_plan_id = ?");
    $planStmt->execute([$plan_id]);
    $plan = $planStmt->fetch(PDO::FETCH_ASSOC);

    if (!$plan) {
        echo json_encode(["status" => "error", "message" => "Invalid plan selected."]);
        exit;
    }

    $duration_months = (int) $plan['duration_months'];
    $new_join_date = date('Y-m-d');
    $new_expiry_date = date('Y-m-d', strtotime("+{$duration_months} months"));

    // Update the member's dates and status
    $stmt = $pdo->prepare("UPDATE members SET join_date = ?, expiry_date = ?, status = 'active' WHERE member_id = ?");
    $stmt->execute([$new_join_date, $new_expiry_date, $raw_id]);

    // Insert or update the membership record for this member
    $msStmt = $pdo->prepare("INSERT INTO membership (member_id, membership_plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, 'active')");
    $msStmt->execute([$raw_id, $plan_id, $new_join_date, $new_expiry_date]);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            "status" => "success", 
            "message" => "Membership renewed with {$plan['plan_name']} plan!",
            "data" => [
                "member_id" => $raw_id,
                "plan" => $plan['plan_name'],
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
