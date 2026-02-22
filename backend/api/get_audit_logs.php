<?php
// backend/api/get_audit_logs.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mongo.php';

try {
    // Make sure this matches your exact collection name in Compass!
    $collection = $mongoDb->admin_audit_logs; 
    
    // Fetch logs, newest first
    $cursor = $collection->find([], [
        'sort' => ['timestamp' => -1],
        'limit' => 100
    ]);

    $logs = [];
    foreach ($cursor as $doc) {
        // 1. Handle ISO 8601 Timestamp ("2026-02-21T08:10:00Z")
        $date = $doc['timestamp'] ?? '--';
        if (is_string($date) && $date !== '--') {
            $date = date('M d, Y h:i A', strtotime($date));
        }

        // 2. Handle nested Object for "details" safely
        $details = $doc['details'] ?? '--';
        if (is_object($details) || is_array($details)) {
            // Convert the object into a clean string for the frontend table
            $details = json_encode($details); 
        }

        // 3. Map to your EXACT Compass keys
        $logs[] = [
            'admin' => $doc['actor_id'] ?? 'System',
            'action' => $doc['action'] ?? 'Unknown Action',
            'target' => $doc['target_rfid'] ?? '--',
            'details' => $details,
            'timestamp' => $date
        ];
    }

    echo json_encode(["status" => "success", "data" => $logs]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "MongoDB error: " . $e->getMessage()]);
}
?>