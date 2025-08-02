-- ===============================================
-- IONIC PHP ECOMMERCE - DATABASE SCHEMA
-- ===============================================
-- Database: ionic_ecommerce
-- Created: August 3, 2025
-- Version: 1.0
-- Description: Complete database schema for Ionic PHP E-commerce application
-- ===============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `ionic_ecommerce` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `ionic_ecommerce`;

-- Set SQL mode and foreign key checks
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Disable foreign key checks during table creation
SET FOREIGN_KEY_CHECKS = 0;

-- ===============================================
-- TABLE: users
-- Description: Stores user account information
-- ===============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'User full name',
  `email` varchar(100) NOT NULL COMMENT 'User email (unique)',
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `phone` varchar(20) DEFAULT NULL COMMENT 'User phone number',
  `address` text COMMENT 'User address',
  `role` enum('customer','admin') DEFAULT 'customer' COMMENT 'User role',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='User accounts and authentication';

-- ===============================================
-- TABLE: categories
-- Description: Product categories
-- ===============================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'Category name',
  `description` text COMMENT 'Category description',
  `image` varchar(255) DEFAULT NULL COMMENT 'Category image filename',
  `status` enum('active','inactive') DEFAULT 'active' COMMENT 'Category status',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Product categories';

-- ===============================================
-- TABLE: products
-- Description: Product catalog
-- ===============================================
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL COMMENT 'Reference to categories table',
  `name` varchar(200) NOT NULL COMMENT 'Product name',
  `description` text COMMENT 'Product description',
  `price` decimal(10,2) NOT NULL COMMENT 'Product price in IDR',
  `stock` int DEFAULT '0' COMMENT 'Available stock quantity',
  `image` varchar(255) DEFAULT NULL COMMENT 'Main product image filename',
  `images` json DEFAULT NULL COMMENT 'Additional product images (JSON array)',
  `rating` decimal(2,1) DEFAULT '0.0' COMMENT 'Average rating (0.0-5.0)',
  `review_count` int DEFAULT '0' COMMENT 'Number of reviews',
  `status` enum('active','inactive') DEFAULT 'active' COMMENT 'Product status',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `idx_name` (`name`),
  KEY `idx_price` (`price`),
  KEY `idx_stock` (`stock`),
  KEY `idx_status` (`status`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Product catalog';

-- ===============================================
-- TABLE: cart
-- Description: Shopping cart items
-- ===============================================
DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'Reference to users table',
  `product_id` int NOT NULL COMMENT 'Reference to products table',
  `quantity` int NOT NULL COMMENT 'Quantity of items in cart',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Shopping cart items';

-- ===============================================
-- TABLE: orders
-- Description: Customer orders
-- ===============================================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'Reference to users table',
  `order_number` varchar(50) NOT NULL COMMENT 'Unique order number',
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending' COMMENT 'Order status',
  `payment_method` varchar(50) NOT NULL COMMENT 'Payment method (cod, bank_transfer, ewallet)',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending' COMMENT 'Payment status',
  `subtotal` decimal(10,2) NOT NULL COMMENT 'Subtotal before shipping and fees',
  `shipping_cost` decimal(10,2) DEFAULT '0.00' COMMENT 'Shipping cost',
  `service_fee` decimal(10,2) DEFAULT '0.00' COMMENT 'Service fee',
  `total` decimal(10,2) NOT NULL COMMENT 'Total amount (subtotal + shipping + fees)',
  `shipping_address` text NOT NULL COMMENT 'Shipping address (JSON format)',
  `notes` text COMMENT 'Order notes',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer orders';

-- ===============================================
-- TABLE: order_items
-- Description: Items within each order
-- ===============================================
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL COMMENT 'Reference to orders table',
  `product_id` int NOT NULL COMMENT 'Reference to products table',
  `product_name` varchar(255) NOT NULL COMMENT 'Product name at time of order',
  `product_image` varchar(255) DEFAULT NULL COMMENT 'Product image at time of order',
  `price` decimal(10,2) NOT NULL COMMENT 'Product price at time of order',
  `quantity` int NOT NULL COMMENT 'Quantity ordered',
  `subtotal` decimal(10,2) NOT NULL COMMENT 'Price * quantity',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Items within each order';

-- ===============================================
-- OPTIONAL TABLES FOR FUTURE ENHANCEMENTS
-- ===============================================

-- TABLE: order_status_history (for tracking status changes)
DROP TABLE IF EXISTS `order_status_history`;
CREATE TABLE `order_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL COMMENT 'User who made the status change',
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_status_history_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Order status change history';

-- TABLE: product_reviews (for product reviews and ratings)
DROP TABLE IF EXISTS `product_reviews`;
CREATE TABLE `product_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int DEFAULT NULL COMMENT 'Reference to the order this review is for',
  `rating` int NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `review` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_order` (`user_id`, `product_id`, `order_id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  KEY `order_id` (`order_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_status` (`status`),
  CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Product reviews and ratings';

-- TABLE: shipping_addresses (for multiple shipping addresses per user)
DROP TABLE IF EXISTS `shipping_addresses`;
CREATE TABLE `shipping_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'Recipient name',
  `phone` varchar(20) NOT NULL COMMENT 'Recipient phone',
  `address` text NOT NULL COMMENT 'Full address',
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `is_default` boolean DEFAULT FALSE COMMENT 'Is this the default address',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_is_default` (`is_default`),
  CONSTRAINT `shipping_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='User shipping addresses';

-- TABLE: coupons (for discount coupons)
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT 'Coupon code',
  `type` enum('percentage','fixed') NOT NULL COMMENT 'Discount type',
  `value` decimal(10,2) NOT NULL COMMENT 'Discount value',
  `min_order_amount` decimal(10,2) DEFAULT '0.00' COMMENT 'Minimum order amount',
  `max_discount` decimal(10,2) DEFAULT NULL COMMENT 'Maximum discount amount',
  `usage_limit` int DEFAULT NULL COMMENT 'Usage limit per coupon',
  `used_count` int DEFAULT '0' COMMENT 'Number of times used',
  `valid_from` timestamp NOT NULL,
  `valid_until` timestamp NOT NULL,
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_valid_dates` (`valid_from`, `valid_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Discount coupons';

-- ===============================================
-- VIEWS FOR EASIER QUERIES
-- ===============================================

-- View for order details with user information
CREATE OR REPLACE VIEW `order_details_view` AS
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.payment_method,
  o.payment_status,
  o.subtotal,
  o.shipping_cost,
  o.service_fee,
  o.total,
  o.shipping_address,
  o.notes,
  o.created_at,
  o.updated_at,
  u.name as user_name,
  u.email as user_email,
  u.phone as user_phone,
  COUNT(oi.id) as total_items,
  SUM(oi.quantity) as total_quantity
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.id;

-- View for product details with category information
CREATE OR REPLACE VIEW `product_details_view` AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.price,
  p.stock,
  p.image,
  p.images,
  p.rating,
  p.review_count,
  p.status,
  p.created_at,
  p.updated_at,
  c.name as category_name,
  c.description as category_description
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- ===============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ===============================================

-- Additional indexes for better performance
CREATE INDEX idx_products_category_status ON products(category_id, status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);

-- ===============================================
-- SAMPLE DATA INSERTION
-- ===============================================

-- Insert default admin user
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Administrator', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample categories
INSERT INTO `categories` (`name`, `description`, `image`) VALUES
('Electronics', 'Electronic devices and gadgets', 'electronics.jpg'),
('Fashion', 'Clothing and accessories', 'fashion.jpg'),
('Home & Garden', 'Home improvement and garden supplies', 'home-garden.jpg'),
('Books', 'Books and educational materials', 'books.jpg');

-- Insert sample products
INSERT INTO `products` (`category_id`, `name`, `description`, `price`, `stock`, `image`, `rating`, `review_count`) VALUES
(1, 'Smartphone Samsung Galaxy', 'Latest Samsung smartphone with advanced features', 5000000.00, 50, 'samsung-galaxy.jpg', 4.5, 123),
(1, 'Laptop Lenovo ThinkPad', 'Professional laptop for business use', 8500000.00, 25, 'lenovo-thinkpad.jpg', 4.3, 89),
(2, 'T-Shirt Cotton Premium', 'High quality cotton t-shirt', 150000.00, 100, 'tshirt-cotton.jpg', 4.7, 234),
(2, 'Jeans Denim Classic', 'Classic denim jeans for everyday wear', 350000.00, 75, 'jeans-denim.jpg', 4.4, 156),
(3, 'Coffee Maker Deluxe', 'Premium coffee maker for home use', 1200000.00, 30, 'coffee-maker.jpg', 4.6, 67),
(4, 'Programming Book - Advanced PHP', 'Learn advanced PHP programming techniques', 250000.00, 40, 'php-book.jpg', 4.8, 89);

-- ===============================================
-- STORED PROCEDURES
-- ===============================================

-- Procedure to update product rating after new review
DELIMITER //
CREATE PROCEDURE UpdateProductRating(IN p_product_id INT)
BEGIN
    UPDATE products 
    SET rating = (
        SELECT ROUND(AVG(rating), 1) 
        FROM product_reviews 
        WHERE product_id = p_product_id AND status = 'approved'
    ),
    review_count = (
        SELECT COUNT(*) 
        FROM product_reviews 
        WHERE product_id = p_product_id AND status = 'approved'
    )
    WHERE id = p_product_id;
END //
DELIMITER ;

-- Procedure to generate unique order number
DELIMITER //
CREATE PROCEDURE GenerateOrderNumber(OUT order_num VARCHAR(50))
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE temp_num VARCHAR(50);
    DECLARE num_exists INT DEFAULT 1;
    
    WHILE num_exists > 0 DO
        SET temp_num = CONCAT('ORD-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
        SELECT COUNT(*) INTO num_exists FROM orders WHERE order_number = temp_num;
    END WHILE;
    
    SET order_num = temp_num;
END //
DELIMITER ;

-- ===============================================
-- TRIGGERS
-- ===============================================

-- Trigger to automatically update product stock after order
DELIMITER //
CREATE TRIGGER after_order_item_insert
    AFTER INSERT ON order_items
    FOR EACH ROW
BEGIN
    UPDATE products 
    SET stock = stock - NEW.quantity 
    WHERE id = NEW.product_id;
END //
DELIMITER ;

-- Trigger to log order status changes
DELIMITER //
CREATE TRIGGER after_order_status_update
    AFTER UPDATE ON orders
    FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO order_status_history (order_id, status, notes, created_by)
        VALUES (NEW.id, NEW.status, CONCAT('Status changed from ', OLD.status, ' to ', NEW.status), NEW.user_id);
    END IF;
END //
DELIMITER ;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Commit transaction
COMMIT;

-- ===============================================
-- END OF SCHEMA
-- ===============================================

-- Usage Notes:
-- 1. This schema supports a complete e-commerce system
-- 2. All tables have proper indexes for performance
-- 3. Foreign key constraints ensure data integrity
-- 4. Views provide easy access to commonly used data combinations
-- 5. Stored procedures automate common tasks
-- 6. Triggers maintain data consistency
-- 7. Sample data is included for testing
-- 8. Optional tables are included for future enhancements

-- To use this schema:
-- 1. Import this file into MySQL: mysql -u root -p < complete_database_schema.sql
-- 2. Or run each section separately in phpMyAdmin or MySQL Workbench
-- 3. Adjust the sample data as needed for your requirements
