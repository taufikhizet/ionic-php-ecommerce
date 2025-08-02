<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
include_once '../helpers/auth.php';

// Only allow DELETE method
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Validate admin token
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!validateAdminToken($headers)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Invalid token or not admin']);
    exit();
}

// Get filename from query parameter
$filename = $_GET['filename'] ?? '';

if (empty($filename)) {
    http_response_code(400);
    echo json_encode(['error' => 'Filename parameter required']);
    exit();
}

// Construct full path
$imagePath = '../images/' . $filename;

// Check if file exists and delete it
if (file_exists($imagePath)) {
    if (unlink($imagePath)) {
        http_response_code(200);
        echo json_encode(['message' => 'Image deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete image file']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Image file not found']);
}
?>
