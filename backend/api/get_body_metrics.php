<?php
// backend/api/get_body_metrics.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mongo.php';

try {
    $collection = $mongoDb->body_metrics_logs; // Targeting the body_metrics_logs collection
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