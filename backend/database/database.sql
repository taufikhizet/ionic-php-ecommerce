CREATE DATABASE IF NOT EXISTS ionic_ecommerce;
USE ionic_ecommerce;

-- Table untuk kategori produk
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table untuk produk
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(12,0) NOT NULL COMMENT 'Price in Indonesian Rupiah (IDR)',
    stock INT DEFAULT 0,
    image VARCHAR(255),
    images JSON,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Table untuk user
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table untuk cart
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Table untuk orders
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(12,0) NOT NULL COMMENT 'Total amount in Indonesian Rupiah (IDR)',
    shipping_address TEXT NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table untuk order items
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(12,0) NOT NULL COMMENT 'Price in Indonesian Rupiah (IDR)',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert sample categories
INSERT INTO categories (name, description, image) VALUES
('Electronics', 'Electronic devices and gadgets', 'electronics.jpg'),
('Clothing', 'Fashion and apparel', 'clothing.jpg'),
('Books', 'Books and educational materials', 'books.jpg'),
('Home & Garden', 'Home improvement and garden supplies', 'home.jpg');

-- Insert sample products dengan harga dalam Rupiah
INSERT INTO products (category_id, name, description, price, stock, image, rating) VALUES
(1, 'Smartphone X1', 'Smartphone terbaru dengan fitur canggih', 8999000, 50, 'phone1.jpg', 4.5),
(1, 'Laptop Pro', 'Laptop performa tinggi untuk profesional', 19499000, 30, 'laptop1.jpg', 4.8),
(1, 'Wireless Headphones', 'Headphone premium noise-cancelling', 2999000, 100, 'headphones1.jpg', 4.3),
(2, 'T-Shirt Cotton', 'Kaos katun yang nyaman', 374000, 200, 'tshirt1.jpg', 4.2),
(2, 'Jeans Classic', 'Celana jeans classic fit', 899000, 150, 'jeans1.jpg', 4.0),
(3, 'Programming Book', 'Belajar dasar-dasar programming', 599000, 80, 'book1.jpg', 4.7),
(4, 'Garden Tools Set', 'Set lengkap peralatan kebun', 1349000, 25, 'tools1.jpg', 4.4);

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
