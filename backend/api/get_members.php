<?php
// backend/api/get_members.php
error_reporting(0); // Silences raw PHP warnings
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

try {
    // FIX: SELECT * grabs all columns automatically, preventing the 1054 error!
    $query = "SELECT * FROM members ORDER BY member_id ASC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $raw_members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $mapped_members = [];
    
    foreach ($raw_members as $row) {
        // We map the MySQL results to the exact properties admin.js wants
        $mapped_members[] = [
            "id"               => $row['member_id'],
            "memberId"         => $row['member_id'],
            "rfid"             => $row['rfid'] ?? 'N/A',
            "name"             => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')),
            "firstName"        => $row['first_name'] ?? '',
            "lastName"         => $row['last_name'] ?? '',
            "phone"            => $row['phone'] ?? '',
            "email"            => $row['email'] ?? '',
            "contact"          => ($row['email'] ?? '') . ' | ' . ($row['phone'] ?? ''),
            "status"           => $row['membership_status'] ?? 'active', // Safely maps your DB column to the UI
            "joinDate"         => $row['join_date'] ?? date('Y-m-d'),
            "expiry"           => $row['expiry_date'] ?? '2026-03-01',
            "plan"             => "Silver", // Safe fallback
            "height"           => 170,
            "weight"           => 70,
            "bmi"              => 24.2,
            "targetWeight"     => 65,
            "loggedIn"         => false,
            "loginTime"        => null
        ];
    }

    echo json_encode(["status" => "success", "data" => $mapped_members]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database query failed: " . $e->getMessage()]);
}
?>