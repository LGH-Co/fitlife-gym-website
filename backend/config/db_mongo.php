<?php
// backend/config/db_mongo.php

// 1. Load the Composer autoloader
require_once __DIR__ . '/../vendor/autoload.php'; 

use MongoDB\Client;

try {
    // 2. Connects to  MongoDB Atlas Cloud cluster
    $mongoUri = "mongodb+srv://kmronquillo:kmronquillo@cluster0.ii3ntr8.mongodb.net/";
    $mongoClient = new Client($mongoUri);
    
    // 3. Select the exact database name from Compass dashboard
    $mongoDb = $mongoClient->selectDatabase('FitLife');
    
} catch (Exception $e) {
    die(json_encode([
        "status" => "error", 
        "message" => "MongoDB Cloud Connection Failed: " . $e->getMessage()
    ]));
}
?>