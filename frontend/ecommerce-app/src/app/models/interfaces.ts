export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  rating: number;
  review_count: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
  subtotal: number;
}

export interface CartResponse {
  records: CartItem[];
  total: number;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface ProductDetailResponse {
  product: Product;
  message?: string;
}

export interface ApiResponse {
  message: string;
}

export interface ProductResponse {
  records: Product[];
}

export interface CategoryResponse {
  records: Category[];
}
