<?php
// backend/api/save_health_history.php
// Saves health history to MySQL (health_history) + MongoDB (health_logs) — dual-write, append-only (insertOne)
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

if (!isset($data->member_id) || !isset($data->type)) {
    echo json_encode(["status" => "error", "message" => "Missing member ID or type"]);
    exit;
}

try {
    $member_id       = (int) str_replace('M', '', $data->member_id);
    $type            = trim((string) $data->type);
    $notes           = isset($data->notes) ? trim((string) $data->notes) : '';
    $log_date        = isset($data->log_date) && $data->log_date !== '' ? $data->log_date : date('Y-m-d');
    $pre_workout_meal = isset($data->pre_workout_meal) ? trim((string) $data->pre_workout_meal) : '';
    $fatigue_level   = isset($data->fatigue_level) ? (int) $data->fatigue_level : null;

    // Get member's RFID
    $rfidStmt = $pdo->prepare("SELECT rfid FROM members WHERE member_id = ?");
    $rfidStmt->execute([$member_id]);
    $memberRow = $rfidStmt->fetch(PDO::FETCH_ASSOC);

    if (!$memberRow) {
        echo json_encode(["status" => "error", "message" => "Member not found."]);
        exit;
    }

    $rfid = $memberRow['rfid'];

    // 1. INSERT into MySQL health_history
    $stmt = $pdo->prepare("INSERT INTO health_history (member_id, rfid, log_date, type, notes) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$member_id, $rfid, $log_date, $type, $notes]);

    // 2. INSERT into MongoDB health_logs (append-only, insertOne)
    try {
        if ($mongoDb) {
            $mongoDb->health_logs->insertOne([
                'member_id'        => $member_id,
                'rfid'             => (string) $rfid,
                'log_date'         => $log_date,
                'type'             => $type,
                'pre_workout_meal' => $pre_workout_meal,
                'fatigue_level'    => $fatigue_level,
                'notes'            => $notes,
                'last_log_date'    => date('Y-m-d')
            ]);
        }
    } catch (Exception $e) {
        error_log("MongoDB health_logs insertOne failed: " . $e->getMessage());
    }

    // 3. Audit log (dual-write)
    logAudit($pdo, $mongoDb, 'ADD_HEALTH_HISTORY', 'admin', $rfid,
        json_encode(["member_id" => $member_id, "type" => $type, "log_date" => $log_date]));

    echo json_encode([
        "status"  => "success",
        "message" => "Health history saved to MySQL & MongoDB!"
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
