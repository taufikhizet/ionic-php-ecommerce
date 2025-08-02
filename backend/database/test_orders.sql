-- Test data untuk order history
-- Pastikan user dengan id 1 ada (admin@example.com)

INSERT INTO orders (
    user_id, 
    order_number, 
    status, 
    payment_method, 
    payment_status, 
    subtotal, 
    shipping_cost, 
    service_fee, 
    total, 
    shipping_address, 
    notes, 
    created_at, 
    updated_at
) VALUES 
-- Order 1 - Delivered
(1, 'ORD-2025080301', 'delivered', 'cod', 'paid', 150000, 20000, 5000, 175000, 
 '{"name":"John Doe","phone":"081234567890","address":"Jl. Raya No. 123, Jakarta Selatan","city":"Jakarta","postal_code":"12345"}', 
 'Tolong kirim sore hari', 
 '2025-08-01 10:30:00', '2025-08-03 14:20:00'),

-- Order 2 - Processing
(1, 'ORD-2025080302', 'processing', 'bank_transfer', 'pending', 75000, 15000, 3000, 93000,
 '{"name":"John Doe","phone":"081234567890","address":"Jl. Raya No. 123, Jakarta Selatan","city":"Jakarta","postal_code":"12345"}',
 '',
 '2025-08-02 15:45:00', '2025-08-02 16:00:00'),

-- Order 3 - Shipped
(1, 'ORD-2025080303', 'shipped', 'ewallet', 'paid', 250000, 25000, 8000, 283000,
 '{"name":"John Doe","phone":"081234567890","address":"Jl. Raya No. 123, Jakarta Selatan","city":"Jakarta","postal_code":"12345"}',
 'Barang elektronik, hati-hati',
 '2025-08-03 09:15:00', '2025-08-03 10:30:00'),

-- Order 4 - Pending  
(1, 'ORD-2025080304', 'pending', 'cod', 'pending', 120000, 18000, 4000, 142000,
 '{"name":"John Doe","phone":"081234567890","address":"Jl. Raya No. 123, Jakarta Selatan","city":"Jakarta","postal_code":"12345"}',
 '',
 '2025-08-03 16:00:00', '2025-08-03 16:00:00'),

-- Order 5 - Cancelled
(1, 'ORD-2025080305', 'cancelled', 'bank_transfer', 'refunded', 95000, 12000, 3000, 110000,
 '{"name":"John Doe","phone":"081234567890","address":"Jl. Raya No. 123, Jakarta Selatan","city":"Jakarta","postal_code":"12345"}',
 'Batal karena stok habis',
 '2025-08-02 11:20:00', '2025-08-02 14:30:00');

-- Order items untuk testing (pastikan product_id sesuai dengan data products yang ada)
INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
SELECT o.id, 1, 'Sample Product 1', '/images/product1.jpg', 50000, 3, 150000
FROM orders o WHERE o.order_number = 'ORD-2025080301';

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)  
SELECT o.id, 2, 'Sample Product 2', '/images/product2.jpg', 75000, 1, 75000
FROM orders o WHERE o.order_number = 'ORD-2025080302';

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
SELECT o.id, 3, 'Sample Product 3', '/images/product3.jpg', 125000, 2, 250000
FROM orders o WHERE o.order_number = 'ORD-2025080303';

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
SELECT o.id, 1, 'Sample Product 1', '/images/product1.jpg', 60000, 2, 120000
FROM orders o WHERE o.order_number = 'ORD-2025080304';

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
SELECT o.id, 2, 'Sample Product 2', '/images/product2.jpg', 95000, 1, 95000
FROM orders o WHERE o.order_number = 'ORD-2025080305';
