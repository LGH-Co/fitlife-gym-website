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
            p.payment_date AS date,
            p.payment_method AS method,
            p.reference_number AS reference
        FROM payments p
        JOIN members m ON p.member_id = m.member_id
        ORDER BY p.payment_date DESC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $payments]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>