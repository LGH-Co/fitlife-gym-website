<?php
// backend/api/add_class.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

// Capture the JSON payload sent by JavaScript
$data = json_decode(file_get_contents("php://input"));

// Verify that all required fields were sent
if (!isset($data->class_name) || !isset($data->trainer_id) || !isset($data->starts_at)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

try {
    // We hardcode service_type_id to 3 (which is 'Group Class' in your SQL dummy data)
    $query = "INSERT INTO classes (class_name, service_type_id, trainer_id, starts_at, duration_minutes, capacity, location) 
              VALUES (?, 3, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        $data->class_name,
        $data->trainer_id,
        $data->starts_at,
        $data->duration_minutes,
        $data->capacity,
        $data->location
    ]);

    echo json_encode(["status" => "success", "message" => "Class added successfully"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>