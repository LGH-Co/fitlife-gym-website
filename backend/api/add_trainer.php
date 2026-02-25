<?php
// backend/api/add_trainer.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->name, $data->rfid, $data->phone, $data->email, $data->specialization)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit;
}

$name = trim((string)$data->name);
$rfid = trim((string)$data->rfid);
$phone = trim((string)$data->phone);
$email = trim((string)$data->email);
$specialization = trim((string)$data->specialization);
$hireDate = isset($data->hire_date) && trim((string)$data->hire_date) !== ''
    ? trim((string)$data->hire_date)
    : date('Y-m-d');

if ($name === '' || $rfid === '' || $phone === '' || $email === '' || $specialization === '') {
    echo json_encode(["status" => "error", "message" => "All required fields must be provided."]);
    exit;
}

$nameParts = preg_split('/\s+/', $name);
$firstName = $nameParts[0] ?? '';
$lastName = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : 'N/A';

if ($firstName === '' || $lastName === '') {
    echo json_encode(["status" => "error", "message" => "Trainer name is invalid."]);
    exit;
}

try {
    $dupStmt = $pdo->prepare("SELECT trainer_id FROM trainers WHERE rfid = ? LIMIT 1");
    $dupStmt->execute([$rfid]);
    if ($dupStmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "RFID already exists in the system."]);
        exit;
    }

    $insertStmt = $pdo->prepare("INSERT INTO trainers (rfid, first_name, last_name, phone, email, specialization, hire_date, is_active)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
    $insertStmt->execute([$rfid, $firstName, $lastName, $phone, $email, $specialization, $hireDate]);

    echo json_encode([
        "status" => "success",
        "message" => "Trainer onboarded successfully.",
        "data" => [
            "trainer_id" => (int)$pdo->lastInsertId()
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>