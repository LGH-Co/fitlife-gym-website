<?php
// backend/api/get_classes.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

try {
    // We added a subquery to count active bookings (ignoring cancelled ones)
    $query = "
        SELECT 
            c.class_id, c.class_name, c.starts_at, c.duration_minutes, c.capacity, c.location,
            t.first_name AS trainer_first, t.last_name AS trainer_last,
            (SELECT COUNT(*) FROM bookings b WHERE b.class_id = c.class_id AND b.status != 'cancelled') AS booked_count
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