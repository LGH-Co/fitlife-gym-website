<?php
// backend/api/get_retention.php
// Calculates monthly retention rate from membership data
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

try {
    $months = [];
    
    // Calculate retention for the last 6 months
    for ($i = 5; $i >= 0; $i--) {
        $monthStart = date('Y-m-01', strtotime("-{$i} months"));
        $monthEnd = date('Y-m-t', strtotime("-{$i} months"));
        $monthLabel = date('M', strtotime("-{$i} months"));

        // Total members who joined on or before this month
        $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM members WHERE join_date <= ?");
        $totalStmt->execute([$monthEnd]);
        $totalMembers = (int) $totalStmt->fetchColumn();

        // Members with active membership overlapping this month
        $activeStmt = $pdo->prepare("SELECT COUNT(DISTINCT member_id) FROM membership WHERE start_date <= ? AND end_date >= ? AND status IN ('active', 'expired')");
        $activeStmt->execute([$monthEnd, $monthStart]);
        $activeMembers = (int) $activeStmt->fetchColumn();

        $rate = $totalMembers > 0 ? round(($activeMembers / $totalMembers) * 100, 1) : 0;

        $months[] = [
            'month' => $monthLabel,
            'rate' => $rate,
            'active' => $activeMembers,
            'total' => $totalMembers
        ];
    }

    echo json_encode(["status" => "success", "data" => $months]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
