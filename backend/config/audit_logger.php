<?php
// backend/config/audit_logger.php
// Dual-write audit logger: writes to BOTH MySQL admin_audit_logs AND MongoDB admin_audit_logs

function logAudit($pdo, $mongoDb, $action, $actor, $target_rfid, $details) {
    $audit_id = uniqid('AUD_', true);
    $timestamp = date('Y-m-d H:i:s');

    // 1. Write to MySQL admin_audit_logs
    try {
        $stmt = $pdo->prepare("INSERT INTO admin_audit_logs (audit_id, timestamp, actor_id, action, target_rfid, details) VALUES (?, ?, ?, ?, ?, ?)");
        // details MUST be valid JSON (CHECK constraint), so wrap strings in JSON
        if (is_string($details)) {
            $detailsJson = json_encode(["message" => $details]);
        } else {
            $detailsJson = json_encode($details);
        }
        // target_rfid is BIGINT - pass null if not numeric
        $rfidVal = ($target_rfid !== null && is_numeric($target_rfid)) ? $target_rfid : null;
        $stmt->execute([$audit_id, $timestamp, $actor, $action, $rfidVal, $detailsJson]);
    } catch (Exception $e) {
        error_log("MySQL audit log failed: " . $e->getMessage());
    }

    // 2. Write to MongoDB admin_audit_logs
    try {
        if ($mongoDb) {
            $collection = $mongoDb->admin_audit_logs;
            $collection->insertOne([
                'audit_id' => $audit_id,
                'timestamp' => $timestamp,
                'actor_id' => $actor,
                'action' => $action,
                'target_rfid' => $target_rfid,
                'details' => is_string($details) ? $details : json_encode($details)
            ]);
        }
    } catch (Exception $e) {
        error_log("MongoDB audit log failed: " . $e->getMessage());
    }
}

function logAttendance($pdo, $mongoDb, $role, $memberId, $trainerId, $rfid, $action, $status) {
    $timestamp = date('Y-m-d H:i:s');

    // 1. Write to MySQL attendance_logs
    try {
        $stmt = $pdo->prepare("INSERT INTO attendance_logs (role, member_id, trainer_id, rfid, action, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$role, $memberId, $trainerId, $rfid, $action, $status, $timestamp]);
    } catch (Exception $e) {
        error_log("MySQL attendance log failed: " . $e->getMessage());
    }

    // 2. Write to MongoDB attendance_logs
    try {
        if ($mongoDb) {
            $collection = $mongoDb->attendance_logs;
            $collection->insertOne([
                'role' => $role,
                'member_id' => $memberId ? (int)$memberId : null,
                'trainer_id' => $trainerId ? (int)$trainerId : null,
                'rfid' => (string)$rfid,
                'action' => $action,
                'status' => $status,
                'timestamp' => $timestamp
            ]);
        }
    } catch (Exception $e) {
        error_log("MongoDB attendance log failed: " . $e->getMessage());
    }
}
?>
