<?php
include_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Test connection
    echo "Database connection: SUCCESS\n";
    
    // Test query users
    $query = "SELECT id, name, email FROM users WHERE email = 'admin@example.com'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "User found: " . print_r($row, true) . "\n";
    } else {
        echo "User not found\n";
    }
    
    // Test password check
    $query = "SELECT password FROM users WHERE email = 'admin@example.com'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stored_password = $row['password'];
        $input_password = 'admin123';
        
        echo "Stored password: " . $stored_password . "\n";
        echo "Input password: " . $input_password . "\n";
        
        if(password_verify($input_password, $stored_password)) {
            echo "Password verification: SUCCESS\n";
        } else {
            echo "Password verification: FAILED\n";
        }
    }
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
