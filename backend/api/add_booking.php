<?php
// backend/api/add_booking.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->member_id) || !isset($data->class_id)) {
    echo json_encode(["status" => "error", "message" => "Missing member or class ID"]);
    exit;
}

try {
    // Strip the 'M' from 'M001' to get the raw integer for MySQL
    $raw_member_id = (int) str_replace('M', '', $data->member_id);
    $class_id = (int) $data->class_id;

    // SECURITY CHECK: Ensure they aren't already booked in this exact class
    $checkStmt = $pdo->prepare("SELECT booking_id FROM bookings WHERE member_id = ? AND class_id = ?");
    $checkStmt->execute([$raw_member_id, $class_id]);
    
    if ($checkStmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "Member is already booked for this class."]);
        exit;
    }

    // Insert the new booking
    $stmt = $pdo->prepare("INSERT INTO bookings (member_id, class_id, booked_at, status) VALUES (?, ?, NOW(), 'booked')");
    $stmt->execute([$raw_member_id, $class_id]);

    echo json_encode(["status" => "success", "message" => "Class successfully booked!"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>