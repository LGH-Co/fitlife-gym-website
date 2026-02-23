<?php
// backend/api/get_payments.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once '../config/db_mysql.php';

try {
    $query = "
        SELECT 
            p.payment_id AS id,
            CONCAT(m.first_name, ' ', m.last_name) AS memberName,
            p.amount,
            p.created_at AS date, 
            p.method,
            p.reference_no AS reference
        FROM payments p
        JOIN members m ON p.member_id = m.member_id
        ORDER BY p.payment_id DESC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>