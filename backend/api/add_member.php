<?php
// backend/api/add_member.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Includes your database connection
require_once '../config/db_mysql.php';

// Get the posted data from the frontend
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->member_id) &&
    !empty($data->rfid) &&
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email)
) {
    try {
        // Prepare the SQL statement matching your schema
        $query = "INSERT INTO members (member_id, rfid, first_name, last_name, phone, email, join_date, membership_status) 
                  VALUES (:member_id, :rfid, :first_name, :last_name, :phone, :email, :join_date, :status)";

        $stmt = $pdo->prepare($query);

        // Bind the validated values from the UI
        $stmt->bindParam(':member_id', $data->member_id);
        $stmt->bindParam(':rfid', $data->rfid);
        $stmt->bindParam(':first_name', $data->first_name);
        $stmt->bindParam(':last_name', $data->last_name);
        $stmt->bindParam(':phone', $data->phone);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':join_date', $data->join_date);
        $stmt->bindParam(':status', $data->membership_status);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Member #" . $data->member_id . " registered successfully."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Unable to register member."]);
        }
    } catch (PDOException $e) {
        // Forensic error reporting for your demo
        echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data provided."]);
}
?>