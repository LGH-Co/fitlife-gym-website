<?php
// backend/api/cancel_booking.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->booking_id)) {
    echo json_encode(["status" => "error", "message" => "Missing booking ID"]);
    exit;
}

try {
    $booking_id = (int) $data->booking_id;

    // Soft delete: Update status to 'cancelled' to free up capacity
    $stmt = $pdo->prepare("UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?");
    $stmt->execute([$booking_id]);

    echo json_encode(["status" => "success", "message" => "Member successfully unenrolled."]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>