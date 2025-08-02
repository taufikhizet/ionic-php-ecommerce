# Ionic E-Commerce App dengan Backend PHP

Aplikasi e-commerce mobile yang dibangun dengan Ionic Framework dan backend PHP dengan MySQL.

## Struktur Proyek

```
ionic_php_ecommerce/
├── backend/              # Backend PHP API
│   ├── api/             # REST API endpoints
│   ├── config/          # Konfigurasi database
│   ├── models/          # Model untuk database
│   └── database.sql     # SQL schema dan sample data
└── frontend/            # Frontend Ionic App
    └── ecommerce-app/   # Aplikasi Ionic
```

## Fitur

### Backend PHP
- REST API dengan JSON response
- Autentikasi user (login/register)
- Manajemen produk dan kategori
- Shopping cart functionality
- CORS enabled untuk akses dari frontend

### Frontend Ionic
- **Tab 1 (Shop)**: Daftar produk dengan search dan filter kategori
- **Tab 2 (Cart)**: Shopping cart dengan update quantity
- **Tab 3 (Profile)**: Login/Register dan profile management

## Setup & Installation

### Prerequisites
- XAMPP/Laragon dengan PHP 7.4+
- Node.js dan npm
- Ionic CLI (`npm install -g @ionic/cli`)

### Backend Setup

1. Copy folder `backend` ke dalam folder web server (htdocs/www)
2. Buat database MySQL:
   ```sql
   CREATE DATABASE ionic_ecommerce;
   ```

3. Import schema dan sample data:
   ```bash
   mysql -u root -p ionic_ecommerce < backend/database.sql
   ```

4. Update konfigurasi database di `backend/config/database.php`:
   ```php
   private $host = "localhost";
   private $db_name = "ionic_ecommerce";
   private $username = "root";
   private $password = "";
   ```

### Frontend Setup

1. Masuk ke direktori frontend:
   ```bash
   cd frontend/ecommerce-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update URL API di `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost/ionic_php_ecommerce/backend/api'
   };
   ```

4. Jalankan aplikasi:
   ```bash
   ionic serve
   ```

## API Endpoints

### Authentication
- `POST /login.php` - User login
- `POST /register.php` - User registration

### Products
- `GET /products.php` - Get all products
- `GET /products.php?id={id}` - Get single product
- `GET /products.php?category_id={id}` - Get products by category
- `GET /products.php?search={query}` - Search products

### Categories
- `GET /categories.php` - Get all categories
- `GET /categories.php?id={id}` - Get single category

### Cart (Requires Authentication)
- `GET /cart.php` - Get user's cart
- `POST /cart.php` - Add item to cart
- `PUT /cart.php` - Update cart item
- `DELETE /cart.php?id={id}` - Remove item from cart

## Database Schema

### Tables
- `users` - User accounts
- `categories` - Product categories
- `products` - Product catalog
- `cart` - Shopping cart items
- `orders` - Order history
- `order_items` - Order details

## Sample Data

Database sudah termasuk sample data:
- 4 categories (Electronics, Clothing, Books, Home & Garden)
- 7 sample products
- 1 admin user (admin@example.com / admin123)

## Security Notes

- Passwords di-hash menggunakan PHP `password_hash()`
- Simple token authentication (untuk production gunakan JWT)
- Input sanitization dan prepared statements

## Development Tips

1. **CORS Issues**: Pastikan header CORS sudah benar di semua API files
2. **Database Connection**: Cek konfigurasi database jika ada error koneksi
3. **Asset Images**: Letakkan gambar produk di `frontend/ecommerce-app/src/assets/images/`

## TODO / Future Enhancements

- [ ] Order management
- [ ] Payment gateway integration
- [ ] Push notifications
- [ ] Admin dashboard
- [ ] Product reviews dan ratings
- [ ] Wishlist functionality
- [ ] Advanced search filters
- [ ] Email notifications

## Troubleshooting

### Common Issues

1. **API tidak bisa diakses**
   - Pastikan web server berjalan
   - Cek CORS headers
   - Verifikasi URL API di environment

2. **Database error**
   - Cek koneksi database
   - Pastikan database dan tables sudah dibuat
   - Verifikasi credentials database

3. **Ionic serve error**
   - Jalankan `npm install` ulang
   - Cek apakah semua dependencies terinstall

## Contact

Untuk pertanyaan atau dukungan, silakan buat issue di repository ini.
