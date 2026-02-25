<?php
// backend/api/get_today_sessions.php
// Returns today's scheduled sessions for a member or trainer
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db_mysql.php';

$member_id = isset($_GET['member_id']) ? (int)$_GET['member_id'] : 0;
$trainer_id = isset($_GET['trainer_id']) ? (int)$_GET['trainer_id'] : 0;

try {
    $results = [];

    if ($member_id > 0) {
        // Get personal training sessions for the member today
        $stmt = $pdo->prepare("
            SELECT s.session_id, s.starts_at, s.duration_minutes, s.status,
                   st.service_name AS program,
                   CONCAT(t.first_name, ' ', t.last_name) AS trainer_name
            FROM sessions s
            JOIN service_type st ON s.service_type_id = st.service_type_id
            JOIN trainers t ON s.trainer_id = t.trainer_id
            WHERE s.member_id = ? AND DATE(s.starts_at) = CURDATE() AND s.status = 'scheduled'
            ORDER BY s.starts_at ASC
        ");
        $stmt->execute([$member_id]);
        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($sessions as $s) {
            $results[] = [
                'program' => $s['program'],
                'time' => date('g:i A', strtotime($s['starts_at'])),
                'trainer' => $s['trainer_name'],
                'status' => $s['status']
            ];
        }

        // Also get class bookings for today
        $classStmt = $pdo->prepare("
            SELECT c.class_name, c.starts_at, c.location,
                   CONCAT(t.first_name, ' ', t.last_name) AS trainer_name
            FROM bookings b
            JOIN classes c ON b.class_id = c.class_id
            LEFT JOIN trainers t ON c.trainer_id = t.trainer_id
            WHERE b.member_id = ? AND DATE(c.starts_at) = CURDATE() AND b.status = 'booked'
            ORDER BY c.starts_at ASC
        ");
        $classStmt->execute([$member_id]);
        $classes = $classStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($classes as $c) {
            $results[] = [
                'program' => $c['class_name'],
                'time' => date('g:i A', strtotime($c['starts_at'])),
                'trainer' => $c['trainer_name'] ?? 'TBA',
                'status' => 'booked',
                'location' => $c['location']
            ];
        }
    }

    if ($trainer_id > 0) {
        // Get personal training sessions for the trainer today
        $stmt = $pdo->prepare("
            SELECT s.session_id, s.starts_at, s.duration_minutes, s.status,
                   st.service_name AS program,
                   CONCAT(m.first_name, ' ', m.last_name) AS client_name
            FROM sessions s
            JOIN service_type st ON s.service_type_id = st.service_type_id
            JOIN members m ON s.member_id = m.member_id
            WHERE s.trainer_id = ? AND DATE(s.starts_at) = CURDATE() AND s.status = 'scheduled'
            ORDER BY s.starts_at ASC
        ");
        $stmt->execute([$trainer_id]);
        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($sessions as $s) {
            $results[] = [
                'program' => $s['program'],
                'time' => date('g:i A', strtotime($s['starts_at'])),
                'client' => $s['client_name'],
                'status' => $s['status']
            ];
        }

        // Also get classes assigned to this trainer today
        $classStmt = $pdo->prepare("
            SELECT c.class_name, c.starts_at, c.location, c.capacity,
                   (SELECT COUNT(*) FROM bookings b WHERE b.class_id = c.class_id AND b.status != 'cancelled') AS booked
            FROM classes c
            WHERE c.trainer_id = ? AND DATE(c.starts_at) = CURDATE() AND c.status = 'active'
            ORDER BY c.starts_at ASC
        ");
        $classStmt->execute([$trainer_id]);
        $classes = $classStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($classes as $c) {
            $results[] = [
                'program' => $c['class_name'],
                'time' => date('g:i A', strtotime($c['starts_at'])),
                'client' => "{$c['booked']}/{$c['capacity']} booked",
                'status' => 'class',
                'location' => $c['location']
            ];
        }
    }

    echo json_encode(["status" => "success", "data" => $results]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
