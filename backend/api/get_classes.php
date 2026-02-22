<?php
// backend/api/get_classes.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

try {
    // We use a JOIN to combine the classes table with the trainers table
    $query = "
        SELECT 
            c.class_id, c.class_name, c.starts_at, c.duration_minutes, c.capacity, c.location,
            t.first_name AS trainer_first, t.last_name AS trainer_last
        FROM classes c
        LEFT JOIN trainers t ON c.trainer_id = t.trainer_id
        ORDER BY c.starts_at ASC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $classes = $stmt->fetchAll();

    echo json_encode(["status" => "success", "data" => $classes]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>