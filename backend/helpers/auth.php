<?php
// Helper function to get bearer token from headers
function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        return str_replace('Bearer ', '', $headers['Authorization']);
    }
    return null;
}

// Helper function to validate token and return user ID
function validateToken($token) {
    if (!$token) {
        return false;
    }
    
    $decoded = base64_decode($token);
    $parts = explode(':', $decoded);
    
    if (count($parts) !== 2) {
        return false;
    }
    
    return $parts[0]; // Return user ID
}

// Helper function to validate admin token
function validateAdminToken($headers) {
    if(!isset($headers['Authorization'])) {
        return false;
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $decoded = base64_decode($token);
    $parts = explode(':', $decoded);
    
    if(count($parts) !== 2) {
        return false;
    }
    
    $userId = $parts[0];
    
    // Get user from database to check role
    include_once '../config/database.php';
    include_once '../models/User.php';
    
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);
    $user->id = $userId;
    
    if($user->readOne() && $user->role === 'admin') {
        return $userId;
    }
    
    return false;
}
?>
