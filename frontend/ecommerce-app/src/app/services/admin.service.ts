import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, Category, ApiResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getAuthHeadersForUpload(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData - browser will set it automatically
    });
  }

  // Product CRUD operations
  createProduct(product: Partial<Product>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.baseUrl}/products.php`, 
      product, 
      { headers: this.getAuthHeaders() }
    );
  }

  updateProduct(product: Product): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.baseUrl}/products.php`, 
      product, 
      { headers: this.getAuthHeaders() }
    );
  }

  deleteProduct(productId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.baseUrl}/products.php?id=${productId}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  // Get all products for admin management
  getAllProducts(): Observable<{records: Product[]}> {
    return this.http.get<{records: Product[]}>(`${this.baseUrl}/products.php`);
  }

  // Get single product
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products.php?id=${id}`);
  }

  // Get all categories
  getCategories(): Observable<{records: Category[]}> {
    return this.http.get<{records: Category[]}>(`${this.baseUrl}/categories.php`);
  }

  // Upload product image
  uploadProductImage(formData: FormData): Observable<{filename: string, message: string}> {
    const token = localStorage.getItem('token');
    console.log('Upload Image - Token from localStorage:', token);
    
    return this.http.post<{filename: string, message: string}>(
      `${this.baseUrl}/upload_image.php`, 
      formData, 
      { headers: this.getAuthHeadersForUpload() }
    );
  }

  // Delete product image
  deleteProductImage(filename: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(
      `${this.baseUrl}/delete_image.php?filename=${filename}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  // Test auth token
  testAuthToken(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/test_auth.php`, 
      { headers: this.getAuthHeaders() }
    );
  }
}
