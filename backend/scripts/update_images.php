<?php
include_once '../config/database.php';

// Connect to database
$database = new Database();
$db = $database->getConnection();

try {
    // Get current products with their images
    $query = "SELECT id, name, image FROM products ORDER BY id";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    echo "=== CURRENT PRODUCTS AND IMAGES ===\n";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: {$row['id']} | Name: {$row['name']} | Image: {$row['image']}\n";
    }
    
    // Update product images to remove the old path references
    $updates = [
        ['id' => 1, 'image' => 'laptop_pro.jpg'],
        ['id' => 2, 'image' => 'smartphone_x1.jpg'],
        ['id' => 3, 'image' => 'wireless_headphones.jpg'],
        ['id' => 4, 'image' => 'tshirt_cotton.jpg'],
        ['id' => 5, 'image' => 'jeans_classic.jpg'],
        ['id' => 6, 'image' => 'programming_book.jpg'],
        ['id' => 7, 'image' => 'plant_pot.jpg']
    ];
    
    echo "\n=== UPDATING IMAGES ===\n";
    foreach ($updates as $update) {
        $updateQuery = "UPDATE products SET image = ? WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        if ($updateStmt->execute([$update['image'], $update['id']])) {
            echo "Updated product ID {$update['id']} with image {$update['image']}\n";
        } else {
            echo "Failed to update product ID {$update['id']}\n";
        }
    }
    
    echo "\n=== UPDATED PRODUCTS ===\n";
    $stmt->execute();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: {$row['id']} | Name: {$row['name']} | Image: {$row['image']}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
