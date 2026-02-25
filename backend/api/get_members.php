<?php
// backend/api/get_members.php
error_reporting(0); // Silences raw PHP warnings
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

try {
    // JOIN membership tables to get the actual plan for each member
    $query = "SELECT m.member_id, m.rfid, m.first_name, m.last_name, m.phone, m.email, m.join_date, m.status, m.expiry_date,
                     mt.type_name AS plan_name
              FROM members m
              LEFT JOIN membership ms ON ms.member_id = m.member_id
                AND ms.membership_id = (
                    SELECT MAX(ms2.membership_id) FROM membership ms2 WHERE ms2.member_id = m.member_id
                )
              LEFT JOIN membership_plan mp ON ms.membership_plan_id = mp.membership_plan_id
              LEFT JOIN membership_type mt ON mp.membership_type_id = mt.membership_type_id
              ORDER BY m.member_id ASC";
    
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
            "status"           => $row['status'] ?? 'active',
            "joinDate"         => $row['join_date'] ?? date('Y-m-d'),
            "expiry"           => $row['expiry_date'] ?? '2026-03-01',
            "plan"             => $row['plan_name'] ?? 'Silver',
            "height"           => 170,
            "weight"           => 70,
            "bmi"              => 24.2,
            "targetWeight"     => 65,
            "loggedIn"         => false,
            "loginTime"        => null,
        ];
    }

    echo json_encode(["status" => "success", "data" => $mapped_members]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database query failed: " . $e->getMessage()]);
}
?>