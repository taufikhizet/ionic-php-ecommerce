<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
include_once '../helpers/auth.php';

// Get headers
$headers = getallheaders();
if (!$headers) {
    // Fallback for cases where getallheaders() doesn't work
    $headers = [];
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $headerKey = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
            $headers[$headerKey] = $value;
        }
    }
}

$authHeader = $headers['Authorization'] ?? '';

// Test token validation
$isValid = validateAdminToken($headers);

// Return debug info
echo json_encode([
    'status' => 'Test Auth Endpoint',
    'headers_received' => $headers,
    'auth_header' => $authHeader,
    'token_valid' => $isValid ? true : false,
    'user_id' => $isValid ? $isValid : null,
    'method' => $_SERVER['REQUEST_METHOD']
]);
?>
