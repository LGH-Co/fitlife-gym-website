<?php
// backend/api/get_member_metrics.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mongo.php';

$raw_member_id = isset($_GET['member_id']) ? $_GET['member_id'] : '';

if (empty($raw_member_id)) {
    echo json_encode(["status" => "error", "message" => "Missing member ID."]);
    exit;
}

try {
    // Strip the 'M' from 'M001' to get the raw integer for MongoDB
    $member_id_int = (int) str_replace('M', '', $raw_member_id);

    // Target your exact collection
    $collection = $mongoDb->health_logs;
    
    // Search using the integer and sort by your 'log_date' field
    $cursor = $collection->find(
        ['member_id' => $member_id_int],
        ['sort' => ['log_date' => -1]]
    );

    $metrics = [];
    foreach ($cursor as $doc) {
        // Format the log_date
        $date = isset($doc['log_date']) ? $doc['log_date'] : '--';
        if (is_string($date) && $date !== '--') {
            $date = date('M d, Y', strtotime($date));
        }

        // Map your exact MongoDB fields
        $metrics[] = [
            'date' => $date,
            'type' => isset($doc['type']) ? $doc['type'] : '--',
            'meal' => isset($doc['pre_workout_meal']) ? $doc['pre_workout_meal'] : '--',
            'fatigue' => isset($doc['fatigue_level']) ? $doc['fatigue_level'] : '--',
            'notes' => isset($doc['notes']) ? $doc['notes'] : '--'
        ];
    }

    echo json_encode(["status" => "success", "data" => $metrics]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "MongoDB error: " . $e->getMessage()]);
}
?>