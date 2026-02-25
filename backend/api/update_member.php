<?php
// backend/api/update_member.php
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
    $pdo->beginTransaction();

    $raw_id = (int) $data->member_id;

    // 1. Update the members table (name, phone, email, status)
    $stmt = $pdo->prepare("UPDATE members SET first_name = ?, last_name = ?, phone = ?, email = ?, status = ? WHERE member_id = ?");
    $stmt->execute([
        $data->first_name ?? '',
        $data->last_name ?? '',
        $data->phone ?? '',
        $data->email ?? '',
        $data->status ?? 'active',
        $raw_id
    ]);

    // 2. Update the membership plan if plan was changed
    if (isset($data->plan)) {
        // Map plan name to membership_plan_id (1-month plans)
        $plan_map = [
            'Silver' => 1,  // Silver - 1 Month
            'Gold'   => 3   // Gold - 1 Month
        ];
        $plan_id = $plan_map[$data->plan] ?? 1;

        // Check if an active membership row exists
        $check = $pdo->prepare("SELECT membership_id FROM membership WHERE member_id = ? ORDER BY created_at DESC LIMIT 1");
        $check->execute([$raw_id]);
        $existing = $check->fetch();

        if ($existing) {
            // Update existing membership row
            $stmt2 = $pdo->prepare("UPDATE membership SET membership_plan_id = ? WHERE membership_id = ?");
            $stmt2->execute([$plan_id, $existing['membership_id']]);
        } else {
            // Insert new membership row
            $today = date('Y-m-d');
            $expiry = date('Y-m-d', strtotime('+1 month'));
            $stmt2 = $pdo->prepare("INSERT INTO membership (member_id, membership_plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, 'active')");
            $stmt2->execute([$raw_id, $plan_id, $today, $expiry]);
        }
    }

    $pdo->commit();

    echo json_encode(["status" => "success", "message" => "Member updated successfully!"]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
