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
  private endpoints = environment.endpoints;
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
    return this.http.post<LoginResponse>(`${this.baseUrl}${this.endpoints.auth.login}`, {
      email,
      password
    });
  }

  register(userData: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}${this.endpoints.auth.register}`, userData);
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
    return this.http.get<CategoryResponse>(`${this.baseUrl}${this.endpoints.categories.list}`);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}${this.endpoints.categories.detail}?id=${id}`);
  }

  // Products
  getProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}${this.endpoints.products.list}`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}${this.endpoints.products.detail}?id=${id}`);
  }

  getProductById(id: number): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.baseUrl}${this.endpoints.products.detail}?id=${id}`);
  }

  getProductsByCategory(categoryId: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}${this.endpoints.products.byCategory}?category_id=${categoryId}`);
  }

  searchProducts(query: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}${this.endpoints.products.search}?search=${encodeURIComponent(query)}`);
  }

  // Cart
  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseUrl}${this.endpoints.cart.list}`, {
      headers: this.getAuthHeaders()
    });
  }

  addToCart(productId: number, quantity: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}${this.endpoints.cart.add}`, {
      product_id: productId,
      quantity
    }, {
      headers: this.getAuthHeaders()
    });
  }

  updateCartItem(itemId: number, quantity: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}${this.endpoints.cart.update}`, {
      id: itemId,
      quantity
    }, {
      headers: this.getAuthHeaders()
    });
  }

  removeFromCart(itemId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}${this.endpoints.cart.remove}?id=${itemId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Profile methods
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoints.auth.profile}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(profileData: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}${this.endpoints.auth.profile}`, profileData, {
      headers: this.getAuthHeaders()
    });
  }

  // Order methods
  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${this.endpoints.orders.create}`, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  getOrders(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoints.orders.list}`, {
      headers: this.getAuthHeaders()
    });
  }

  getOrder(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoints.orders.detail}?id=${orderId}`, {
      headers: this.getAuthHeaders()
    });
  }

  clearCart(): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}${this.endpoints.cart.clear}?clear=all`, {
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
