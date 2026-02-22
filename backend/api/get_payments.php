<?php
// backend/api/get_payments.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once '../config/db_mysql.php';

try {
    $query = "
        SELECT 
            p.payment_id, 
            CONCAT(m.first_name, ' ', m.last_name) AS member_name, 
            p.amount, 
            p.payment_date, 
            p.payment_method, 
            p.reference_number
        FROM payments p
        JOIN members m ON p.member_id = m.member_id
        ORDER BY p.payment_date DESC
    ";
    $stmt = $pdo->query($query);
    $payments = $stmt->fetchAll();
    echo json_encode(["status" => "success", "data" => $payments]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>