<?php
// backend/api/add_member.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Includes your database connection
require_once '../config/db_mysql.php';

// Get the posted data from the frontend
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->rfid) &&
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email)
) {
    try {
        $pdo->beginTransaction();

        // Let MySQL AUTO_INCREMENT handle the member_id
        $query = "INSERT INTO members (rfid, first_name, last_name, phone, email, join_date, status, expiry_date) 
          VALUES (:rfid, :first_name, :last_name, :phone, :email, :join_date, :status, :expiry_date)";
        $stmt = $pdo->prepare($query);

        $join_date = $data->join_date ?? date('Y-m-d');
        $expiry_date = date('Y-m-d', strtotime('+1 month', strtotime($join_date)));
        $status = $data->membership_status ?? 'active';

        $stmt->bindParam(':rfid', $data->rfid);
        $stmt->bindParam(':first_name', $data->first_name);
        $stmt->bindParam(':last_name', $data->last_name);
        $stmt->bindParam(':phone', $data->phone);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':join_date', $join_date);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':expiry_date', $expiry_date);

        $stmt->execute();
        $new_id = $pdo->lastInsertId();

        // Also insert into membership table for plan tracking
        $plan = $data->plan ?? 'Silver';
        $plan_map = ['Silver' => 1, 'Gold' => 3];
        $plan_id = $plan_map[$plan] ?? 1;

        $stmt2 = $pdo->prepare("INSERT INTO membership (member_id, membership_plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, 'active')");
        $stmt2->execute([$new_id, $plan_id, $join_date, $expiry_date]);

        $pdo->commit();

        echo json_encode(["status" => "success", "message" => "Member #" . $new_id . " registered successfully.", "member_id" => $new_id]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data provided. Required: RFID, First Name, Last Name, Email."]);
}
?>