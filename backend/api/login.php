<?php
// backend/api/login.php

// 1. Allow cross-origin requests from your frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 2. Import your secure MySQL connection
require_once '../config/db_mysql.php';

// 3. Capture the JSON payload sent by JavaScript
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->username) || !isset($data->password)) {
    echo json_encode(["status" => "error", "message" => "Missing credentials"]);
    exit;
}

$username = $data->username;
$password = $data->password;

try {
    // 4. Securely fetch the admin account using prepared statements
    $stmt = $pdo->prepare("SELECT admin_id, username, password, role FROM admin_account WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if ($admin) {
        // SECURITY NOTE: In a production environment, you MUST use password_verify($password, $admin['password']).
        // Because your current sql_data.sql literally uses the string 'hashed_password_here' for dummy data, 
        // we are adding a temporary bypass for 'admin123' just so you can log in today.
        
        $isValid = false;
        if (password_verify($password, $admin['password']) || ($username === 'admin' && $password === 'admin123')) {
            $isValid = true;
        }

        if ($isValid) {
            echo json_encode([
                "status" => "success",
                "data" => [
                    "admin_id" => $admin['admin_id'],
                    "username" => $admin['username'],
                    "role" => $admin['role']
                ]
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Admin not found"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>