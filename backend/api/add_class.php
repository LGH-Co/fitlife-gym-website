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
    $trainerId = (int)$data->trainer_id;
    $trainerCheckStmt = $pdo->prepare("SELECT trainer_id, specialization FROM trainers WHERE trainer_id = ? LIMIT 1");
    $trainerCheckStmt->execute([$trainerId]);
    $trainerRow = $trainerCheckStmt->fetch(PDO::FETCH_ASSOC);
    if (!$trainerRow) {
        echo json_encode(["status" => "error", "message" => "Selected trainer does not exist in database. Please refresh trainers first."]);
        exit;
    }

    $specialization = trim((string)($trainerRow['specialization'] ?? ''));
    if ($specialization === '') {
        echo json_encode(["status" => "error", "message" => "Selected trainer has no specialization. Please update trainer profile first."]);
        exit;
    }

    $serviceTypeStmt = $pdo->prepare("SELECT service_type_id FROM service_type WHERE service_name = ? LIMIT 1");
    $serviceTypeStmt->execute([$specialization]);
    $serviceTypeId = (int)($serviceTypeStmt->fetch(PDO::FETCH_ASSOC)['service_type_id'] ?? 0);

    if ($serviceTypeId <= 0) {
        $createServiceTypeStmt = $pdo->prepare("INSERT INTO service_type (service_name, description, base_monthly_price)
                                                VALUES (?, ?, ?)");
        $createServiceTypeStmt->execute([
            $specialization,
            'Auto-generated from trainer specialization',
            500.00
        ]);
        $serviceTypeId = (int)$pdo->lastInsertId();
    }

    $query = "INSERT INTO classes (class_name, service_type_id, trainer_id, starts_at, duration_minutes, capacity, location) 
              VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        $data->class_name,
        $serviceTypeId,
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