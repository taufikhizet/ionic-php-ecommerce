<?php
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
