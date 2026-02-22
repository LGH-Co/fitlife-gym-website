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
            COALESCE(m.status, 'active') AS membership_status,
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
        WHERE m.status != 'archived' OR m.status IS NULL  -- SECURITY FIX: Hide soft-deleted members!
        ORDER BY m.member_id
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    // Fetch all the rows as an associative array
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Format the data perfectly for the frontend JavaScript
    $formatted_members = [];
    foreach ($members as $row) {
        
        // Format the date nicely, or flag it if they don't have a membership record yet
        $expiry = 'No Active Plan';
        if (!empty($row['end_date'])) {
            $expiry = date('n/j/Y', strtotime($row['end_date'])); // Turns "2026-03-15" into "3/15/2026"
        }

        $formatted_members[] = [
            "member_id" => $row['member_id'],
            "rfid" => $row['rfid'],
            "first_name" => $row['first_name'],
            "last_name" => $row['last_name'],
            "phone" => $row['phone'],
            "email" => $row['email'],
            "join_date" => $row['join_date'],
            "plan_type" => $row['plan_type'],
            "status" => $row['membership_status'],
            "end_date" => $expiry // Pass the clean formatted date
        ];
    }

    // 5. Output the data as a JSON string
    echo json_encode([
        "status" => "success",
        "count" => count($formatted_members),
        "data" => $formatted_members
    ]);

} catch (Exception $e) {
    // If something goes wrong, output the error safely
    echo json_encode([
        "status" => "error", 
        "message" => "Database query failed: " . $e->getMessage()
    ]);
}
?>