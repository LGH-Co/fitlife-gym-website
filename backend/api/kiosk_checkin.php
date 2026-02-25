<?php
date_default_timezone_set('Asia/Manila');
require 'vendor/autoload.php'; // MongoDB PHP Library

// 1. Connection Setup
$client = new MongoDB\Client("mongodb+srv://kmronquillo:kmronquillo@cluster0.ii3ntr8.mongodb.net/?appName=Cluster0");
$db = $client->fitlife_gym;

// 2. Incoming Data (Captured from your UI/Scanner)
$rfid_scanned = $_POST['rfid']; // Example: "2024140997"
$member_id = $_POST['member_id'];
$current_time = date('Y-m-d\TH:i:s\Z'); 
$current_date = date('Y-m-d');

try {
    // --- STEP A: Create Attendance Log ---
    // Matches the format: member_id, action, timestamp, status, rfid
    $attendanceLog = [
        "member_id" => (int)$member_id,
        "action"    => "Logged In",
        "timestamp" => $current_time,
        "status"    => "Access Granted",
        "rfid"      => (string)$rfid_scanned
    ];
    $db->attendance_logs->insertOne($attendanceLog);

    // --- STEP B: Update Current Body Metrics Date ---
    // Updates the log_date to the current tap date
    $db->body_metrics_logs->updateOne(
        ['rfid' => (string)$rfid_scanned],
        ['$set' => ['log_date' => $current_date]]
    );

    echo json_encode(["status" => "success", "message" => "Tap recorded and metrics updated"]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>