<?php
// backend/api/get_trainers.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

try {
    // Return all trainers with rate, session counts, and earnings
    $query = "SELECT t.trainer_id, t.rfid, t.first_name, t.last_name, t.phone, t.specialization, t.is_active,
                     t.rate_per_session,
                     (SELECT COUNT(*) FROM sessions s WHERE s.trainer_id = t.trainer_id) AS total_sessions,
                     (SELECT COALESCE(SUM(tp.amount), 0) FROM trainer_payouts tp WHERE tp.trainer_id = t.trainer_id AND tp.status = 'paid') AS total_earnings
              FROM trainers t
              ORDER BY t.trainer_id ASC";
              
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Also fetch per-month session data for each trainer
    $monthStmt = $pdo->prepare("
        SELECT trainer_id,
               YEAR(starts_at) AS yr, MONTH(starts_at) AS mo,
               COUNT(*) AS cnt
        FROM sessions
        GROUP BY trainer_id, YEAR(starts_at), MONTH(starts_at)
    ");
    $monthStmt->execute();
    $monthRows = $monthStmt->fetchAll(PDO::FETCH_ASSOC);
    $monthMap = [];
    foreach ($monthRows as $r) {
        $key = $r['trainer_id'];
        $monthKey = $r['yr'] . '-' . str_pad($r['mo'], 2, '0', STR_PAD_LEFT);
        if (!isset($monthMap[$key])) $monthMap[$key] = [];
        $monthMap[$key][$monthKey] = (int)$r['cnt'];
    }

    // Fetch per-month earnings for each trainer
    $earnStmt = $pdo->prepare("
        SELECT trainer_id,
               YEAR(payout_datetime) AS yr, MONTH(payout_datetime) AS mo,
               SUM(amount) AS total
        FROM trainer_payouts
        WHERE status = 'paid'
        GROUP BY trainer_id, YEAR(payout_datetime), MONTH(payout_datetime)
    ");
    $earnStmt->execute();
    $earnRows = $earnStmt->fetchAll(PDO::FETCH_ASSOC);
    $earnMap = [];
    foreach ($earnRows as $r) {
        $key = $r['trainer_id'];
        $monthKey = $r['yr'] . '-' . str_pad($r['mo'], 2, '0', STR_PAD_LEFT);
        if (!isset($earnMap[$key])) $earnMap[$key] = [];
        $earnMap[$key][$monthKey] = (float)$r['total'];
    }

    $trainers = [];
    foreach ($raw as $t) {
        $tid = $t['trainer_id'];
        $trainers[] = [
            'trainer_id'       => $tid,
            'rfid'             => $t['rfid'],
            'first_name'       => $t['first_name'],
            'last_name'        => $t['last_name'],
            'phone'            => $t['phone'],
            'specialization'   => $t['specialization'],
            'is_active'        => (int)$t['is_active'],
            'rate_per_session'  => $t['rate_per_session'] !== null ? (float)$t['rate_per_session'] : 60,
            'total_sessions'    => (int)$t['total_sessions'],
            'total_earnings'    => (float)$t['total_earnings'],
            'sessions_by_month' => $monthMap[$tid] ?? (object)[],
            'earnings_by_month' => $earnMap[$tid] ?? (object)[],
        ];
    }

    echo json_encode([
        "status" => "success",
        "data" => $trainers
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>