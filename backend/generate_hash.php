<?php
// Generate password hash for admin123
$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "Plain password: " . $password . "\n";
echo "Hashed password: " . $hash . "\n";

// Test verification
if (password_verify($password, $hash)) {
    echo "Password verification: SUCCESS\n";
} else {
    echo "Password verification: FAILED\n";
}
?>
