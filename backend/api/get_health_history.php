<?php
// backend/api/get_health_history.php
// Reads health history from MySQL (health_history) + MongoDB (health_logs) for a member
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';
require_once '../config/db_mongo.php';

$raw_member_id = isset($_GET['member_id']) ? $_GET['member_id'] : '';

if (empty($raw_member_id)) {
    echo json_encode(["status" => "error", "message" => "Missing member ID."]);
    exit;
}

$member_id = (int) str_replace('M', '', $raw_member_id);

try {
    // 1. Fetch from MySQL health_history
    $mysqlData = [];
    $stmt = $pdo->prepare("SELECT health_history_id, member_id, rfid, log_date, type, notes, created_at FROM health_history WHERE member_id = ? ORDER BY log_date DESC");
    $stmt->execute([$member_id]);
    $mysqlData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Fetch from MongoDB health_logs
    $mongoData = [];
    try {
        if ($mongoDb) {
            $cursor = $mongoDb->health_logs->find(
                ['member_id' => $member_id],
                ['sort' => ['log_date' => -1]]
            );
            foreach ($cursor as $doc) {
                $mongoData[] = [
                    'log_date'         => isset($doc['log_date']) ? (string)$doc['log_date'] : '--',
                    'type'             => isset($doc['type']) ? (string)$doc['type'] : '--',
                    'pre_workout_meal' => isset($doc['pre_workout_meal']) ? (string)$doc['pre_workout_meal'] : '--',
                    'fatigue_level'    => isset($doc['fatigue_level']) ? (int)$doc['fatigue_level'] : null,
                    'notes'            => isset($doc['notes']) ? (string)$doc['notes'] : '--'
                ];
            }
        }
    } catch (Exception $e) {
        error_log("MongoDB health_logs read failed: " . $e->getMessage());
    }

    echo json_encode([
        "status" => "success",
        "mysql" => $mysqlData,
        "mongo" => $mongoData
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
