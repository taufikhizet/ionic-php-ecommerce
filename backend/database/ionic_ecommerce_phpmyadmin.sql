-- ===============================================
-- IONIC PHP ECOMMERCE - DATABASE SCHEMA
-- ===============================================
-- Database: ionic_ecommerce
-- Created: August 3, 2025
-- Version: 1.0
-- Description: Complete database schema for Ionic PHP E-commerce application
-- Ready for direct import into phpMyAdmin
-- ===============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ===============================================
-- CREATE DATABASE
-- ===============================================
CREATE DATABASE IF NOT EXISTS `ionic_ecommerce` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ionic_ecommerce`;

-- ===============================================
-- TABLE STRUCTURE
-- ===============================================

-- -----------------------------------------------
-- Table structure for table `users`
-- -----------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'User full name',
  `email` varchar(100) NOT NULL COMMENT 'User email address (unique)',
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `phone` varchar(20) DEFAULT NULL COMMENT 'User phone number',
  `address` text DEFAULT NULL COMMENT 'User address',
  `role` enum('customer','admin') NOT NULL DEFAULT 'customer' COMMENT 'User role',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User accounts and authentication';

-- -----------------------------------------------
-- Table structure for table `categories`
-- -----------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'Category name',
  `description` text DEFAULT NULL COMMENT 'Category description',
  `image` varchar(255) DEFAULT NULL COMMENT 'Category image filename',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'Category status',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Product categories';

-- -----------------------------------------------
-- Table structure for table `products`
-- -----------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL COMMENT 'Reference to categories table',
  `name` varchar(200) NOT NULL COMMENT 'Product name',
  `description` text DEFAULT NULL COMMENT 'Product description',
  `price` decimal(12,2) NOT NULL COMMENT 'Product price in IDR',
  `stock` int(11) NOT NULL DEFAULT 0 COMMENT 'Available stock quantity',
  `image` varchar(255) DEFAULT NULL COMMENT 'Main product image filename',
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Additional product images (JSON array)' CHECK (json_valid(`images`)),
  `rating` decimal(2,1) NOT NULL DEFAULT 0.0 COMMENT 'Average rating (0.0-5.0)',
  `review_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of reviews',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'Product status',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `idx_name` (`name`),
  KEY `idx_price` (`price`),
  KEY `idx_stock` (`stock`),
  KEY `idx_status` (`status`),
  KEY `idx_rating` (`rating`),
  KEY `idx_category_status` (`category_id`,`status`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Product catalog';

-- -----------------------------------------------
-- Table structure for table `cart`
-- -----------------------------------------------
DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'Reference to users table',
  `product_id` int(11) NOT NULL COMMENT 'Reference to products table',
  `quantity` int(11) NOT NULL COMMENT 'Quantity of items in cart',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Shopping cart items';

-- -----------------------------------------------
-- Table structure for table `orders`
-- -----------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'Reference to users table',
  `order_number` varchar(50) NOT NULL COMMENT 'Unique order number',
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Order status',
  `payment_method` varchar(50) NOT NULL COMMENT 'Payment method (cod, bank_transfer, ewallet)',
  `payment_status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending' COMMENT 'Payment status',
  `subtotal` decimal(12,2) NOT NULL COMMENT 'Subtotal before shipping and fees',
  `shipping_cost` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Shipping cost',
  `service_fee` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Service fee',
  `total` decimal(12,2) NOT NULL COMMENT 'Total amount (subtotal + shipping + fees)',
  `shipping_address` longtext NOT NULL COMMENT 'Shipping address (JSON format)',
  `notes` text DEFAULT NULL COMMENT 'Order notes',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_status` (`user_id`,`status`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Customer orders';

-- -----------------------------------------------
-- Table structure for table `order_items`
-- -----------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL COMMENT 'Reference to orders table',
  `product_id` int(11) NOT NULL COMMENT 'Reference to products table',
  `product_name` varchar(255) NOT NULL COMMENT 'Product name at time of order',
  `product_image` varchar(255) DEFAULT NULL COMMENT 'Product image at time of order',
  `price` decimal(12,2) NOT NULL COMMENT 'Product price at time of order',
  `quantity` int(11) NOT NULL COMMENT 'Quantity ordered',
  `subtotal` decimal(12,2) NOT NULL COMMENT 'Price * quantity',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_order_product` (`order_id`,`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Items within each order';

-- ===============================================
-- SAMPLE DATA INSERTION
-- ===============================================

-- Insert admin user (password: admin123)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `address`, `role`) VALUES
(1, 'Administrator', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567890', 'Jl. Admin No. 1, Jakarta', 'admin'),
(2, 'John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567891', 'Jl. Customer No. 2, Jakarta', 'customer');

-- Insert categories
INSERT INTO `categories` (`id`, `name`, `description`, `image`, `status`) VALUES
(1, 'Electronics', 'Electronic devices, gadgets, and accessories', 'electronics.jpg', 'active'),
(2, 'Fashion', 'Clothing, shoes, and fashion accessories', 'fashion.jpg', 'active'),
(3, 'Home & Living', 'Home improvement, furniture, and living essentials', 'home-living.jpg', 'active'),
(4, 'Books & Education', 'Books, educational materials, and stationery', 'books.jpg', 'active'),
(5, 'Sports & Outdoor', 'Sports equipment and outdoor activities', 'sports.jpg', 'active');

-- Insert products
INSERT INTO `products` (`id`, `category_id`, `name`, `description`, `price`, `stock`, `image`, `images`, `rating`, `review_count`, `status`) VALUES
(1, 1, 'Smartphone Samsung Galaxy A54', 'Smartphone Samsung Galaxy A54 5G with 128GB storage, 6GB RAM, and triple camera system', 4500000.00, 50, 'samsung-a54.jpg', '["samsung-a54-1.jpg", "samsung-a54-2.jpg", "samsung-a54-3.jpg"]', 4.5, 128, 'active'),
(2, 1, 'Laptop ASUS VivoBook 14', 'ASUS VivoBook 14 with Intel Core i5, 8GB RAM, 512GB SSD, perfect for work and study', 8500000.00, 25, 'asus-vivobook.jpg', '["asus-vivobook-1.jpg", "asus-vivobook-2.jpg"]', 4.3, 89, 'active'),
(3, 1, 'Wireless Earbuds TWS', 'Premium wireless earbuds with active noise cancellation and long battery life', 350000.00, 100, 'earbuds-tws.jpg', '["earbuds-1.jpg", "earbuds-2.jpg", "earbuds-3.jpg"]', 4.7, 245, 'active'),
(4, 2, 'T-Shirt Cotton Premium', 'High quality 100% cotton t-shirt, comfortable and durable for daily wear', 125000.00, 150, 'tshirt-cotton.jpg', '["tshirt-1.jpg", "tshirt-2.jpg"]', 4.6, 234, 'active'),
(5, 2, 'Jeans Denim Classic', 'Classic denim jeans with modern fit, perfect for casual and semi-formal occasions', 295000.00, 75, 'jeans-denim.jpg', '["jeans-1.jpg", "jeans-2.jpg", "jeans-3.jpg"]', 4.4, 156, 'active'),
(6, 2, 'Sneakers Running Sport', 'Comfortable running sneakers with advanced cushioning technology', 450000.00, 60, 'sneakers-sport.jpg', '["sneakers-1.jpg", "sneakers-2.jpg"]', 4.8, 189, 'active'),
(7, 3, 'Coffee Maker Deluxe', 'Premium coffee maker with programmable settings and thermal carafe', 1250000.00, 30, 'coffee-maker.jpg', '["coffee-maker-1.jpg", "coffee-maker-2.jpg"]', 4.6, 67, 'active'),
(8, 3, 'Table Lamp LED Modern', 'Modern LED table lamp with adjustable brightness and USB charging port', 185000.00, 80, 'table-lamp.jpg', '["lamp-1.jpg", "lamp-2.jpg", "lamp-3.jpg"]', 4.5, 98, 'active'),
(9, 4, 'Programming Book - Advanced PHP', 'Comprehensive guide to advanced PHP programming and web development', 275000.00, 40, 'php-book.jpg', '["book-1.jpg"]', 4.8, 92, 'active'),
(10, 4, 'Notebook Premium A5', 'Premium quality notebook with dotted pages, perfect for planning and note-taking', 45000.00, 200, 'notebook-a5.jpg', '["notebook-1.jpg", "notebook-2.jpg"]', 4.7, 156, 'active'),
(11, 5, 'Yoga Mat Anti-Slip', 'High-quality yoga mat with anti-slip surface and carrying strap', 165000.00, 45, 'yoga-mat.jpg', '["yoga-mat-1.jpg", "yoga-mat-2.jpg"]', 4.6, 87, 'active'),
(12, 5, 'Water Bottle Stainless', 'Insulated stainless steel water bottle, keeps drinks cold for 24h or hot for 12h', 125000.00, 90, 'water-bottle.jpg', '["bottle-1.jpg", "bottle-2.jpg", "bottle-3.jpg"]', 4.5, 134, 'active');

-- Insert sample cart items
INSERT INTO `cart` (`user_id`, `product_id`, `quantity`) VALUES
(2, 1, 1),
(2, 3, 2),
(2, 4, 1);

-- Insert sample orders
INSERT INTO `orders` (`id`, `user_id`, `order_number`, `status`, `payment_method`, `payment_status`, `subtotal`, `shipping_cost`, `service_fee`, `total`, `shipping_address`, `notes`) VALUES
(1, 2, 'ORD-20250803-001', 'delivered', 'cod', 'paid', 4975000.00, 25000.00, 15000.00, 5015000.00, '{"name":"John Doe","phone":"081234567891","address":"Jl. Customer No. 2, Jakarta Selatan","city":"Jakarta","postal_code":"12345"}', 'Please deliver in the afternoon'),
(2, 2, 'ORD-20250803-002', 'processing', 'bank_transfer', 'paid', 825000.00, 15000.00, 8000.00, 848000.00, '{"name":"John Doe","phone":"081234567891","address":"Jl. Customer No. 2, Jakarta Selatan","city":"Jakarta","postal_code":"12345"}', ''),
(3, 2, 'ORD-20250803-003', 'shipped', 'ewallet', 'paid', 290000.00, 12000.00, 5000.00, 307000.00, '{"name":"John Doe","phone":"081234567891","address":"Jl. Customer No. 2, Jakarta Selatan","city":"Jakarta","postal_code":"12345"}', 'Handle with care');

-- Insert sample order items
INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `product_image`, `price`, `quantity`, `subtotal`) VALUES
(1, 1, 'Smartphone Samsung Galaxy A54', 'samsung-a54.jpg', 4500000.00, 1, 4500000.00),
(1, 3, 'Wireless Earbuds TWS', 'earbuds-tws.jpg', 350000.00, 1, 350000.00),
(1, 4, 'T-Shirt Cotton Premium', 'tshirt-cotton.jpg', 125000.00, 1, 125000.00),
(2, 3, 'Wireless Earbuds TWS', 'earbuds-tws.jpg', 350000.00, 2, 700000.00),
(2, 4, 'T-Shirt Cotton Premium', 'tshirt-cotton.jpg', 125000.00, 1, 125000.00),
(3, 5, 'Jeans Denim Classic', 'jeans-denim.jpg', 295000.00, 1, 295000.00);

-- ===============================================
-- AUTO INCREMENT VALUES
-- ===============================================
ALTER TABLE `users` AUTO_INCREMENT = 3;
ALTER TABLE `categories` AUTO_INCREMENT = 6;
ALTER TABLE `products` AUTO_INCREMENT = 13;
ALTER TABLE `cart` AUTO_INCREMENT = 4;
ALTER TABLE `orders` AUTO_INCREMENT = 4;
ALTER TABLE `order_items` AUTO_INCREMENT = 7;

-- ===============================================
-- VIEWS FOR EASIER QUERIES
-- ===============================================

-- View for order details with user information
CREATE OR REPLACE VIEW `v_order_details` AS
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
GROUP BY o.id, u.id, u.name, u.email, u.phone;

-- View for product details with category information
CREATE OR REPLACE VIEW `v_product_details` AS
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
    c.description as category_description,
    c.image as category_image
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- View for cart details with product information
CREATE OR REPLACE VIEW `v_cart_details` AS
SELECT 
    c.id,
    c.user_id,
    c.quantity,
    c.created_at,
    p.id as product_id,
    p.name as product_name,
    p.description as product_description,
    p.price,
    p.image as product_image,
    p.stock,
    (c.quantity * p.price) as subtotal,
    cat.name as category_name
FROM cart c
LEFT JOIN products p ON c.product_id = p.id
LEFT JOIN categories cat ON p.category_id = cat.id;

-- ===============================================
-- STORED PROCEDURES
-- ===============================================

DELIMITER //

-- Procedure to generate unique order number
CREATE PROCEDURE `sp_generate_order_number`(OUT order_num VARCHAR(50))
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

-- Procedure to update product stock
CREATE PROCEDURE `sp_update_product_stock`(
    IN p_product_id INT,
    IN p_quantity INT,
    IN p_operation VARCHAR(10) -- 'add' or 'subtract'
)
BEGIN
    DECLARE current_stock INT DEFAULT 0;
    
    SELECT stock INTO current_stock FROM products WHERE id = p_product_id;
    
    IF p_operation = 'add' THEN
        UPDATE products SET stock = stock + p_quantity WHERE id = p_product_id;
    ELSEIF p_operation = 'subtract' THEN
        IF current_stock >= p_quantity THEN
            UPDATE products SET stock = stock - p_quantity WHERE id = p_product_id;
        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock';
        END IF;
    END IF;
END //

-- Procedure to calculate order total
CREATE PROCEDURE `sp_calculate_order_total`(
    IN p_order_id INT,
    OUT p_total DECIMAL(12,2)
)
BEGIN
    SELECT SUM(subtotal) INTO p_total FROM order_items WHERE order_id = p_order_id;
END //

DELIMITER ;

-- ===============================================
-- TRIGGERS
-- ===============================================

DELIMITER //

-- Trigger to automatically update product stock after order item insert
CREATE TRIGGER `tr_after_order_item_insert`
    AFTER INSERT ON `order_items`
    FOR EACH ROW
BEGIN
    UPDATE products 
    SET stock = stock - NEW.quantity 
    WHERE id = NEW.product_id AND stock >= NEW.quantity;
END //

-- Trigger to validate cart quantity before insert/update
CREATE TRIGGER `tr_before_cart_insert`
    BEFORE INSERT ON `cart`
    FOR EACH ROW
BEGIN
    DECLARE available_stock INT DEFAULT 0;
    SELECT stock INTO available_stock FROM products WHERE id = NEW.product_id;
    
    IF NEW.quantity > available_stock THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Requested quantity exceeds available stock';
    END IF;
END //

CREATE TRIGGER `tr_before_cart_update`
    BEFORE UPDATE ON `cart`
    FOR EACH ROW
BEGIN
    DECLARE available_stock INT DEFAULT 0;
    SELECT stock INTO available_stock FROM products WHERE id = NEW.product_id;
    
    IF NEW.quantity > available_stock THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Requested quantity exceeds available stock';
    END IF;
END //

DELIMITER ;

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- Additional composite indexes for better performance
CREATE INDEX `idx_products_category_status_stock` ON `products` (`category_id`, `status`, `stock`);
CREATE INDEX `idx_orders_user_date` ON `orders` (`user_id`, `created_at`);
CREATE INDEX `idx_order_items_product_date` ON `order_items` (`product_id`, `created_at`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ===============================================
-- IMPORT INSTRUCTIONS
-- ===============================================
-- 
-- Cara import ke phpMyAdmin:
-- 1. Buka phpMyAdmin di browser (http://localhost/phpmyadmin)
-- 2. Login dengan username: root, password: (kosong)
-- 3. Klik tab "Import" di menu atas
-- 4. Klik "Choose File" dan pilih file ini
-- 5. Pastikan format file "SQL"
-- 6. Klik "Go" untuk mengimport
-- 
-- Database "ionic_ecommerce" akan dibuat otomatis beserta:
-- ✅ 6 tabel utama (users, categories, products, cart, orders, order_items)
-- ✅ Sample data lengkap untuk testing
-- ✅ 3 views untuk query yang mudah
-- ✅ 3 stored procedures untuk automasi
-- ✅ 3 triggers untuk validasi data
-- ✅ Indexes untuk performa optimal
-- ✅ Foreign key constraints untuk integritas data
-- 
-- Admin Login:
-- Email: admin@example.com
-- Password: admin123
-- 
-- Customer Login:
-- Email: john@example.com  
-- Password: admin123
-- ===============================================
