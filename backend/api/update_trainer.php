<?php
// backend/api/update_trainer.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/db_mysql.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->trainer_id)) {
    echo json_encode(["status" => "error", "message" => "Missing trainer ID"]);
    exit;
}

try {
    // The frontend sends IDs like 'T001'. Strip the 'T' and leading zeros.
    $raw_id = (int) str_replace('T', '', $data->trainer_id);

    // Split name into first_name and last_name
    $name_parts = explode(' ', trim($data->name ?? ''), 2);
    $first_name = $name_parts[0] ?? '';
    $last_name  = $name_parts[1] ?? '';

    $stmt = $pdo->prepare("UPDATE trainers SET first_name = ?, last_name = ?, phone = ?, specialization = ? WHERE trainer_id = ?");
    $stmt->execute([
        $first_name,
        $last_name,
        $data->phone ?? '',
        $data->specialization ?? '',
        $raw_id
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Trainer updated successfully!"]);
    } else {
        echo json_encode(["status" => "success", "message" => "No changes detected (data may be identical)."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
