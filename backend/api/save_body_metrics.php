<?php
// backend/api/save_body_metrics.php
// Saves body metrics to MySQL body_metrics + MongoDB body_metrics_logs
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

if (!isset($data->member_id)) {
    echo json_encode(["status" => "error", "message" => "Missing member ID"]);
    exit;
}

try {
    $member_id = (int) str_replace('M', '', $data->member_id);
    $weight = isset($data->weight) ? (float)$data->weight : null;
    $height = isset($data->height) ? (int)$data->height : null;
    $target_weight = isset($data->target_weight) ? (float)$data->target_weight : null;

    // Calculate BMI if both height and weight are provided
    $bmi = null;
    if ($height && $weight && $height > 0) {
        $heightM = $height / 100;
        $bmi = round($weight / ($heightM * $heightM), 2);
    }

    // Get member's RFID
    $rfidStmt = $pdo->prepare("SELECT rfid FROM members WHERE member_id = ?");
    $rfidStmt->execute([$member_id]);
    $memberRow = $rfidStmt->fetch(PDO::FETCH_ASSOC);
    $rfid = $memberRow ? $memberRow['rfid'] : 0;

    // 1. Insert into MySQL body_metrics
    $stmt = $pdo->prepare("INSERT INTO body_metrics (member_id, rfid, weight, height, bmi, target_weight, recorded_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
    $stmt->execute([$member_id, $rfid, $weight, $height, $bmi, $target_weight]);

    // 2. Insert into MongoDB body_metrics_logs
    try {
        $collection = $mongoDb->body_metrics_logs;
        $collection->insertOne([
            'member_id' => $member_id,
            'rfid' => (string)$rfid,
            'weight' => $weight,
            'height' => $height,
            'bmi' => $bmi,
            'target_weight' => $target_weight,
            'recorded_at' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        error_log("MongoDB body_metrics_logs write failed: " . $e->getMessage());
    }

    // 3. Audit log to both databases
    logAudit($pdo, $mongoDb, 'UPDATE_BODY_METRICS', 'admin', $rfid,
        "Updated body metrics for member #{$member_id}: H={$height}cm W={$weight}kg BMI={$bmi} Target={$target_weight}kg");

    echo json_encode([
        "status" => "success",
        "message" => "Body metrics saved!",
        "data" => [
            "height" => $height,
            "weight" => $weight,
            "bmi" => $bmi,
            "target_weight" => $target_weight
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
