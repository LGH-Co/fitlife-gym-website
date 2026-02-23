<?php
// backend/api/get_payouts.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once '../config/db_mysql.php';

try {
    $query = "
        SELECT 
            tp.payout_id AS id,
            t.name AS trainerName,
            tp.amount,
            'Pending' AS date,
            tp.status
        FROM trainer_payouts tp
        JOIN trainers t ON tp.trainer_id = t.trainer_id
        ORDER BY tp.payout_id DESC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>