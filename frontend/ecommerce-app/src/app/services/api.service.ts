import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Category, 
  Product, 
  User, 
  CartResponse, 
  LoginResponse, 
  ApiResponse, 
  ProductResponse, 
  CategoryResponse,
  ProductDetailResponse 
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private profileUpdatedSubject = new BehaviorSubject<boolean>(false);
  public profileUpdated$ = this.profileUpdatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // Auth methods
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login.php`, {
      email,
      password
    });
  }

  register(userData: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/register.php`, userData);
  }

  setCurrentUser(user: User, token: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private loadCurrentUser(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  updateCurrentUserData(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Categories
  getCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.baseUrl}/categories.php`);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/categories.php?id=${id}`);
  }

  // Products
  getProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/products.php`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products.php?id=${id}`);
  }

  getProductById(id: number): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.baseUrl}/products.php?id=${id}`);
  }

  getProductsByCategory(categoryId: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/products.php?category_id=${categoryId}`);
  }

  searchProducts(query: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/products.php?search=${encodeURIComponent(query)}`);
  }

  // Cart
  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseUrl}/cart.php`, {
      headers: this.getAuthHeaders()
    });
  }

  addToCart(productId: number, quantity: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/cart.php`, {
      product_id: productId,
      quantity
    }, {
      headers: this.getAuthHeaders()
    });
  }

  updateCartItem(itemId: number, quantity: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/cart.php`, {
      id: itemId,
      quantity
    }, {
      headers: this.getAuthHeaders()
    });
  }

  removeFromCart(itemId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/cart.php?id=${itemId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Profile methods
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/profile.php`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(profileData: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/profile.php`, profileData, {
      headers: this.getAuthHeaders()
    });
  }

  notifyProfileUpdated(): void {
    this.profileUpdatedSubject.next(true);
  }

  resetProfileUpdateFlag(): void {
    this.profileUpdatedSubject.next(false);
  }
}
