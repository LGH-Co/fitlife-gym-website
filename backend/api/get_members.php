<?php
// backend/api/get_members.php

// 1. Set headers so the browser knows this is JSON data
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 2. Import your secure MySQL connection
require_once '../config/db_mysql.php';

try {
    // 3. Prepare and execute the SQL query based on your schema
    $query = "
        SELECT
            m.member_id,
            m.rfid,
            m.first_name,
            m.last_name,
            m.phone,
            m.email,
            m.join_date,
            COALESCE(mt.type_name, 'Silver') AS plan_type,
            COALESCE(ms.status, 'active') AS membership_status,
            ms.end_date
        FROM members m
        LEFT JOIN membership ms
            ON ms.membership_id = (
                SELECT m2.membership_id
                FROM membership m2
                WHERE m2.member_id = m.member_id
                ORDER BY m2.start_date DESC, m2.membership_id DESC
                LIMIT 1
            )
        LEFT JOIN membership_plan mp
            ON mp.membership_plan_id = ms.membership_plan_id
        LEFT JOIN membership_type mt
            ON mt.membership_type_id = mp.membership_type_id
        ORDER BY m.member_id
    ";
    
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