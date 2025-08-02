import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cartOutline, star, searchOutline, bagOutline, eyeOutline, starOutline, storefront } from 'ionicons/icons';

import { ApiService } from '../services/api.service';
import { Category, Product } from '../models/interfaces';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab1Page implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  isLoading: boolean = false;
  cartItemCount: number = 0;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ cartOutline, star, searchOutline, bagOutline, eyeOutline, starOutline, storefront });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.updateCartCount();
  }

  ionViewWillEnter() {
    this.updateCartCount();
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.records;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProducts() {
    this.loadFilteredProducts();
  }

  onCategoryChange(event: any) {
    const categoryId = event.detail.value;
    this.selectedCategory = categoryId;
    this.loadFilteredProducts();
  }

  onCategorySelect(categoryId: string) {
    this.selectedCategory = categoryId;
    this.loadFilteredProducts();
  }

  onSearchChange(event: any) {
    const query = event.target.value;
    this.searchTerm = query;
    this.loadFilteredProducts();
  }

  clearSearch() {
    this.searchTerm = '';
    this.loadFilteredProducts();
  }

  loadFilteredProducts() {
    this.isLoading = true;
    
    // If there's a search term, search with category filter
    if (this.searchTerm.trim() !== '') {
      this.apiService.searchProducts(this.searchTerm).subscribe({
        next: (response) => {
          let filteredProducts = response.records || [];
          
          // Apply category filter to search results
          if (this.selectedCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
              product.category_id?.toString() === this.selectedCategory
            );
          }
          
          this.products = filteredProducts;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error searching products:', error);
          this.products = [];
          this.isLoading = false;
        }
      });
    } else {
      // No search term, load by category
      if (this.selectedCategory === 'all') {
        this.apiService.getProducts().subscribe({
          next: (response) => {
            this.allProducts = response.records;
            this.products = [...this.allProducts];
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading products:', error);
            this.isLoading = false;
          }
        });
      } else {
        this.apiService.getProductsByCategory(parseInt(this.selectedCategory)).subscribe({
          next: (response) => {
            this.products = response.records || [];
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading products by category:', error);
            this.products = [];
            this.isLoading = false;
          }
        });
      }
    }
  }

  async addToCart(product: Product, event: Event) {
    event.stopPropagation();
    
    if (!this.apiService.isLoggedIn()) {
      const alert = await this.alertController.create({
        header: 'Login Required',
        message: 'Please login to add items to cart.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Login',
            handler: () => {
              this.router.navigate(['/tabs/tab3']);
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    this.apiService.addToCart(product.id, 1).subscribe({
      next: async (response) => {
        const toast = await this.toastController.create({
          message: 'Product added to cart!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.updateCartCount();
      },
      error: async (error) => {
        const toast = await this.toastController.create({
          message: 'Failed to add to cart. Please try again.',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  viewProduct(product: Product) {
    // Navigate to product detail page
    this.router.navigate(['/product', product.id]);
  }

  openCart() {
    this.router.navigate(['/tabs/tab2']);
  }

  onImageError(event: any, product: Product) {
    console.log('Image failed to load:', product.image);
    console.log('Attempted path:', this.getProductImage(product.image));
    (event.target as HTMLImageElement).src = 'assets/images/no-image.svg';
  }

  getProductImage(imageName: string): string {
    if (!imageName) {
      return 'assets/images/no-image.svg';
    }
    
    // Handle both relative and full URLs
    if (imageName.startsWith('http')) {
      return imageName;
    }
    
    // If it's just a filename, construct the full URL for Laragon
    if (!imageName.includes('/')) {
      return `http://localhost/ionic_php_ecommerce/backend/images/${imageName}`;
    }
    
    // If it already includes path, use as is with Laragon base URL
    return imageName.startsWith('/') ? `http://localhost/ionic_php_ecommerce/backend${imageName}` : `http://localhost/ionic_php_ecommerce/backend/${imageName}`;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((x, i) => i < rating ? 1 : 0);
  }

  formatRupiah(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  getProductRows() {
    const rows = [];
    for (let i = 0; i < this.products.length; i += 2) {
      rows.push(this.products.slice(i, i + 2));
    }
    return rows;
  }

  updateCartCount() {
    if (this.apiService.isLoggedIn()) {
      this.apiService.getCart().subscribe({
        next: (response) => {
          this.cartItemCount = response.records.length;
        },
        error: (error) => {
          this.cartItemCount = 0;
        }
      });
    } else {
      this.cartItemCount = 0;
    }
  }
}
