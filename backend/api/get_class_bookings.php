<?php
// backend/api/get_class_bookings.php

// 1. Set security headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 2. Import your secure MySQL connection
require_once '../config/db_mysql.php';

// 3. Grab the class_id from the URL (e.g., ?class_id=1)
$class_id = isset($_GET['class_id']) ? intval($_GET['class_id']) : 0;

if ($class_id <= 0) {
    echo json_encode(["status" => "error", "message" => "Invalid class ID provided."]);
    exit;
}

try {
    // 4. Join the bookings table with the members table
    // FIX: Changed 'booking_date' to 'booked_at' to match your SQL schema
    $query = "
        SELECT 
            b.booking_id,             -- NEW: We need this ID to delete them!
            CONCAT(m.first_name, ' ', m.last_name) AS member_name,
            m.email,
            m.phone,
            b.booked_at, 
            b.status
        FROM bookings b
        JOIN members m ON b.member_id = m.member_id
        WHERE b.class_id = ? AND b.status != 'cancelled'  -- NEW: Hide cancelled members
        ORDER BY b.booked_at ASC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$class_id]);
    
    $bookings = $stmt->fetchAll();

    // 5. Send the data back to your custom JavaScript modal
    echo json_encode([
        "status" => "success",
        "data" => $bookings
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error", 
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>