<?php
// backend/api/get_member_metrics.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Import your MongoDB connection (Make sure this path matches your setup!)
require_once '../config/db_mongo.php';

$member_id = isset($_GET['member_id']) ? $_GET['member_id'] : '';

if (empty($member_id)) {
    echo json_encode(["status" => "error", "message" => "Missing member ID."]);
    exit;
}

try {
    // Access the body_metrics_logs collection from your MongoDB database instance
    $collection = $mongoDb->body_metrics_logs;
    
    // Find logs for this specific member, sorting by date descending (newest first)
    $cursor = $collection->find(
        ['member_id' => $member_id],
        ['sort' => ['recorded_at' => -1]]
    );

    $metrics = [];
    foreach ($cursor as $doc) {
        // Handle MongoDB's tricky date objects safely
        $date = isset($doc['recorded_at']) ? $doc['recorded_at'] : '--';
        if (is_object($date) && method_exists($date, 'toDateTime')) {
            $date = $date->toDateTime()->format('M d, Y');
        } elseif (is_string($date)) {
            $date = date('M d, Y', strtotime($date));
        }

        $metrics[] = [
            'weight' => isset($doc['weight']) ? $doc['weight'] : '--',
            'bmi' => isset($doc['bmi']) ? $doc['bmi'] : '--',
            'notes' => isset($doc['notes']) ? $doc['notes'] : '--',
            'recorded_at' => $date
        ];
    }

    echo json_encode(["status" => "success", "data" => $metrics]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "MongoDB error: " . $e->getMessage()]);
}
?>