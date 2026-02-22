<?php
// backend/api/get_health_logs.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mongo.php';

try {
    $collection = $mongoDb->health_logs; // Targeting the health_logs collection
    $cursor = $collection->find();

    $data = [];
    foreach ($cursor as $document) {
        $data[] = $document;
    }

    echo json_encode(["status" => "success", "count" => count($data), "data" => $data]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "MongoDB query failed: " . $e->getMessage()]);
}
?>