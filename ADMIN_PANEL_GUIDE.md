# 🛠️ ADMIN PANEL - PRODUCT MANAGEMENT GUIDE

## 📋 **Overview**
Admin panel memungkinkan user dengan role "admin" untuk melakukan Create, Read, Update, Delete (CRUD) operations pada produk e-commerce.

## 🔐 **Access Requirements**
- ✅ **Login Required**: Harus login sebagai admin
- ✅ **Admin Role**: Role user harus "admin"
- ✅ **Valid Token**: Token authentication diperlukan

## 👤 **Admin Credentials**
```
Email: admin@example.com
Password: admin123
Role: admin
```

## 🚀 **How to Access Admin Panel**

### Step 1: Login sebagai Admin
1. Buka aplikasi di http://localhost:8105
2. Pergi ke **Tab Profile** (Tab ketiga)
3. Login dengan credentials admin di atas

### Step 2: Open Admin Panel
1. Setelah login berhasil, akan muncul menu **"Admin Panel"** dengan icon shield
2. Klik **"Admin Panel"** untuk masuk ke halaman management

## 📱 **Admin Panel Features**

### 🖼️ **Product Grid View**
- **Display**: Semua produk dalam grid layout
- **Information**: Nama, harga, kategori, stock status
- **Images**: Preview gambar produk
- **Status Badge**: Warning untuk low stock (≤5 items)

### ➕ **Create New Product**
1. Klik **floating action button (+)** di kanan bawah
2. Fill form dengan data produk:
   - **Product Name*** (Required)
   - **Description** (Optional)
   - **Price*** (Required, dalam USD)
   - **Stock** (Jumlah tersedia)
   - **Category*** (Required, pilih dari dropdown)
   - **Image Filename** (e.g., "product.jpg")
3. Klik **"Create Product"**

### ✏️ **Edit Existing Product**
1. Klik **"Edit"** button pada product card
2. Modal akan terbuka dengan data existing
3. Modify fields yang ingin diubah
4. Klik **"Update Product"**

### 🗑️ **Delete Product**
1. Klik **"Delete"** button pada product card
2. Confirmation dialog akan muncul
3. Klik **"Delete"** untuk confirm atau **"Cancel"** untuk batalkan

## 🔧 **Backend API Endpoints**

### Create Product
```http
POST /backend/api/products.php
Headers: Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "stock": 10,
  "category_id": 1,
  "image": "product.jpg"
}
```

### Update Product
```http
PUT /backend/api/products.php
Headers: Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "id": 1,
  "name": "Updated Name",
  "description": "Updated Description",
  "price": 149.99,
  "stock": 15,
  "category_id": 1,
  "image": "updated.jpg"
}
```

### Delete Product
```http
DELETE /backend/api/products.php?id=1
Headers: Authorization: Bearer {admin_token}
```

## 📊 **Database Schema**

### Products Table
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

## 🎨 **Available Categories**
1. **Electronics** (ID: 1)
2. **Clothing** (ID: 2)
3. **Books** (ID: 3)
4. **Home & Garden** (ID: 4)

## 🛡️ **Security Features**
- ✅ **Token Validation**: Setiap request divalidasi dengan admin token
- ✅ **Role Check**: Hanya user dengan role "admin" yang dapat akses
- ✅ **CORS Protection**: Proper CORS headers untuk cross-origin requests
- ✅ **SQL Injection Prevention**: Prepared statements di backend
- ✅ **Input Validation**: Frontend dan backend validation

## 🚨 **Error Handling**
- **401 Unauthorized**: Token invalid atau bukan admin
- **400 Bad Request**: Data tidak lengkap atau invalid
- **404 Not Found**: Product tidak ditemukan
- **500 Internal Error**: Database atau server error

## 📝 **Form Validation Rules**
- **Product Name**: Required, max 255 characters
- **Price**: Required, positive number
- **Stock**: Non-negative integer
- **Category**: Required, must exist in database
- **Image**: Optional, filename only (actual file upload not implemented)

## 🎯 **Usage Tips**
1. **Stock Management**: Set stock = 0 untuk out-of-stock products
2. **Image Naming**: Gunakan format konsisten (e.g., "product_name.jpg")
3. **Category Selection**: Pilih kategori yang sesuai untuk better filtering
4. **Price Format**: Gunakan format decimal (e.g., 99.99, bukan 99)
5. **Description**: Berikan deskripsi yang informatif untuk customer

## 🔄 **Refresh Data**
Setelah melakukan CRUD operations, product grid akan otomatis refresh untuk menampilkan perubahan terbaru.

---

**🎉 Admin Panel sudah siap digunakan untuk mengelola produk e-commerce!**
