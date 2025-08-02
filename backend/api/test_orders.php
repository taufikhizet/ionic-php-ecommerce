<?php
// Test API orders endpoint
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

try {
    echo json_encode(array(
        "status" => "success",
        "message" => "API is working",
        "timestamp" => date('Y-m-d H:i:s')
    ));
} catch (Exception $e) {
    echo json_encode(array(
        "status" => "error", 
        "message" => $e->getMessage()
    ));
}
?>
