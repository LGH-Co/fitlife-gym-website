<?php
// backend/api/get_attendance.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mongo.php';

try {
    // Target the specific collection inside your FitLife database
    $collection = $mongoDb->attendance_logs;
    
    // Fetch all documents in the collection
    $cursor = $collection->find();

    $attendanceData = [];
    foreach ($cursor as $document) {
        $attendanceData[] = $document;
    }

    echo json_encode([
        "status" => "success",
        "count" => count($attendanceData),
        "data" => $attendanceData
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error", 
        "message" => "MongoDB query failed: " . $e->getMessage()
    ]);
}
?>