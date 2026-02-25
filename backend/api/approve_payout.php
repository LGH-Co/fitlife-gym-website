<?php
// backend/api/approve_payout.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/db_mysql.php';
require_once '../config/db_mongo.php';
require_once '../config/audit_logger.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->payout_id)) {
    echo json_encode(["status" => "error", "message" => "Missing payout ID"]);
    exit;
}

try {
    $payout_id = (int) $data->payout_id;

    $stmt = $pdo->prepare("UPDATE trainer_payouts SET status = 'paid', payout_datetime = NOW() WHERE payout_id = ? AND status = 'pending'");
    $stmt->execute([$payout_id]);

    if ($stmt->rowCount() > 0) {
        // Get payout details for audit log
        $detailStmt = $pdo->prepare("SELECT tp.amount, CONCAT(t.first_name, ' ', t.last_name) AS trainer_name, t.rfid FROM trainer_payouts tp JOIN trainers t ON tp.trainer_id = t.trainer_id WHERE tp.payout_id = ?");
        $detailStmt->execute([$payout_id]);
        $details = $detailStmt->fetch(PDO::FETCH_ASSOC);

        logAudit($pdo, $mongoDb, 'APPROVE_PAYOUT', 'admin', $details['rfid'] ?? null, 
            "Approved payout #{$payout_id} of PHP {$details['amount']} to {$details['trainer_name']}");

        echo json_encode(["status" => "success", "message" => "Payout approved successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Payout not found or already processed."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
