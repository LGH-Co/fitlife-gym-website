<?php
// backend/api/get_payouts.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once '../config/db_mysql.php';

try {
    $query = "
        SELECT 
            tp.payout_id, 
            CONCAT(t.first_name, ' ', t.last_name) AS trainer_name, 
            tp.amount, 
            tp.payout_date, 
            tp.status
        FROM trainer_payouts tp
        JOIN trainers t ON tp.trainer_id = t.trainer_id
        ORDER BY tp.payout_date DESC
    ";
    $stmt = $pdo->query($query);
    $payouts = $stmt->fetchAll();
    echo json_encode(["status" => "success", "data" => $payouts]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>