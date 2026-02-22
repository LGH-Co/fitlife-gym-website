<?php
// backend/api/get_members.php

// 1. Set headers so the browser knows this is JSON data
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 2. Import your secure MySQL connection
require_once '../config/db_mysql.php';

try {
    // 3. Prepare and execute the SQL query based on your schema
    $query = "SELECT member_id, rfid, first_name, last_name, email, join_date FROM members";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    // Fetch all the rows as an associative array
    $members = $stmt->fetchAll();

    // 4. Output the data as a JSON string
    echo json_encode([
        "status" => "success",
        "count" => count($members),
        "data" => $members
    ]);

} catch (Exception $e) {
    // If something goes wrong, output the error safely
    echo json_encode([
        "status" => "error", 
        "message" => "Database query failed: " . $e->getMessage()
    ]);
}
?>