import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonBadge,
  IonFab,
  IonFabButton,
  ToastController,
  AlertController,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, create, trash, arrowBack, close, shieldCheckmark, addCircleOutline } from 'ionicons/icons';

import { AdminService } from '../services/admin.service';
import { ApiService } from '../services/api.service';
import { Product, Category } from '../models/interfaces';
import { ProductFormModalComponent } from './product-form-modal.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonBadge,
    IonFab,
    IonFabButton
  ]
})
export class AdminPage implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  isModalOpen = false;
  isEditMode = false;
  currentUser: any = null;
  isLoadingCategories = false;
  presentingElement: HTMLElement | null = null;
  
  productForm = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: 0,
    image: ''
  };

  constructor(
    private adminService: AdminService,
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ add, create, trash, arrowBack, close, shieldCheckmark, addCircleOutline });
  }

  ngOnInit() {
    this.checkAdminAccess();
    this.loadProducts();
    this.loadCategories();
    // Set presenting element to avoid aria-hidden conflicts
    this.presentingElement = document.querySelector('ion-router-outlet');
  }

  checkAdminAccess() {
    this.apiService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user || user.role !== 'admin') {
        this.router.navigate(['/tabs/tab3']);
      }
    });
  }

  loadProducts() {
    console.log('Loading products...');
    this.adminService.getAllProducts().subscribe({
      next: (response) => {
        console.log('Products loaded:', response.records);
        this.products = response.records;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadCategories(): Promise<void> {
    console.log('Loading categories...');
    this.isLoadingCategories = true;
    
    return new Promise((resolve, reject) => {
      this.adminService.getCategories().subscribe({
        next: (response) => {
          console.log('Categories loaded:', response);
          this.categories = response.records || [];
          this.isLoadingCategories = false;
          resolve();
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.categories = []; // Set empty array as fallback
          this.isLoadingCategories = false;
          reject(error);
        }
      });
    });
  }

  async openCreateModal() {
    console.log('Opening create modal...');
    
    // Ensure categories are loaded before opening modal
    if (this.categories.length === 0) {
      await this.loadCategories();
    }
    
    const modal = await this.modalController.create({
      component: ProductFormModalComponent,
      componentProps: {
        isEditMode: false,
        productForm: {
          id: 0,
          name: '',
          description: '',
          price: 0,
          stock: 0,
          category_id: 0,
          image: ''
        },
        categories: this.categories,
        isLoadingCategories: this.isLoadingCategories
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'save' && result.data) {
        this.handleSaveProductWithImage(result.data, false);
      }
    });

    await modal.present();
  }

  async openEditModal(product: Product) {
    console.log('Opening edit modal for product:', product);
    // Ensure categories are loaded before opening modal
    if (this.categories.length === 0) {
      await this.loadCategories();
    }
    
    const productForm = { 
      ...product, 
      originalImage: product.image // Store original image for deletion
    };
    
    const modal = await this.modalController.create({
      component: ProductFormModalComponent,
      componentProps: {
        isEditMode: true,
        productForm: productForm,
        categories: this.categories,
        isLoadingCategories: this.isLoadingCategories
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'save' && result.data) {
        this.handleSaveProductWithImage(result.data, true);
      }
    });

    await modal.present();
  }

  closeModal() {
    console.log('Closing modal...');
    this.isModalOpen = false;
  }

  handleSaveProductWithImage(data: any, isEditMode: boolean) {
    console.log('Handling save product with image:', data, 'Edit mode:', isEditMode);
    
    const { productData, imageFile } = data;
    
    if (!productData.name || !productData.price || !productData.category_id) {
      this.showToast('Please fill in all required fields', 'warning');
      return;
    }

    // If there's an image file, upload it first
    if (imageFile) {
      this.uploadImageAndSaveProduct(productData, imageFile, isEditMode);
    } else {
      // Save product without new image
      this.saveProductData(productData, isEditMode);
    }
  }

  uploadImageAndSaveProduct(productData: any, imageFile: File, isEditMode: boolean) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // If updating and there's an old image, delete it first
    if (isEditMode && productData.originalImage && productData.originalImage !== productData.image) {
      this.adminService.deleteProductImage(productData.originalImage).subscribe({
        next: () => console.log('Old image deleted'),
        error: (error) => console.log('Error deleting old image:', error)
      });
    }
    
    // Upload new image
    this.adminService.uploadProductImage(formData).subscribe({
      next: (response: any) => {
        console.log('Image uploaded successfully:', response);
        // Update product data with uploaded image filename
        productData.image = response.filename;
        this.saveProductData(productData, isEditMode);
      },
      error: (error: any) => {
        console.error('Error uploading image:', error);
        this.showToast('Error uploading image: ' + (error.error?.message || 'Unknown error'), 'danger');
      }
    });
  }

  saveProductData(productData: any, isEditMode: boolean) {
    const operation = isEditMode 
      ? this.adminService.updateProduct(productData as Product)
      : this.adminService.createProduct(productData);

    operation.subscribe({
      next: (response) => {
        this.showToast(
          isEditMode ? 'Product updated successfully' : 'Product created successfully',
          'success'
        );
        this.loadProducts();
      },
      error: (error) => {
        this.showToast(
          'Error saving product: ' + (error.error?.message || 'Unknown error'),
          'danger'
        );
      }
    });
  }

  handleSaveProduct(productData: any, isEditMode: boolean) {
    console.log('Handling save product:', productData, 'Edit mode:', isEditMode);
    
    if (!productData.name || !productData.price || !productData.category_id) {
      this.showToast('Please fill in all required fields', 'warning');
      return;
    }

    const operation = isEditMode 
      ? this.adminService.updateProduct(productData as Product)
      : this.adminService.createProduct(productData);

    operation.subscribe({
      next: async (response) => {
        this.showToast(
          isEditMode ? 'Product updated successfully' : 'Product created successfully',
          'success'
        );
        this.loadProducts();
      },
      error: async (error) => {
        this.showToast(
          'Error saving product: ' + (error.error?.message || 'Unknown error'),
          'danger'
        );
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  async saveProduct() {
    if (!this.productForm.name || !this.productForm.price || !this.productForm.category_id) {
      const toast = await this.toastController.create({
        message: 'Please fill in all required fields',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    const operation = this.isEditMode 
      ? this.adminService.updateProduct(this.productForm as Product)
      : this.adminService.createProduct(this.productForm);

    operation.subscribe({
      next: async (response) => {
        const toast = await this.toastController.create({
          message: this.isEditMode ? 'Product updated successfully' : 'Product created successfully',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
        
        this.closeModal();
        this.loadProducts();
      },
      error: async (error) => {
        const toast = await this.toastController.create({
          message: 'Error saving product: ' + (error.error?.message || 'Unknown error'),
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  async deleteProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${product.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            // Delete image first if it exists
            if (product.image) {
              this.adminService.deleteProductImage(product.image).subscribe({
                next: () => console.log('Product image deleted'),
                error: (error) => console.log('Error deleting product image:', error)
              });
            }
            
            // Then delete the product
            this.adminService.deleteProduct(product.id).subscribe({
              next: async (response) => {
                console.log('Product deleted successfully:', response);
                
                // Remove product from local array immediately for instant UI update
                const index = this.products.findIndex(p => p.id === product.id);
                if (index > -1) {
                  this.products.splice(index, 1);
                  // Trigger change detection to update UI immediately
                  this.cdr.detectChanges();
                }
                
                const toast = await this.toastController.create({
                  message: 'Product deleted successfully',
                  duration: 2000,
                  color: 'success',
                  position: 'top'
                });
                await toast.present();
                
                // Reload products as backup to ensure consistency
                this.loadProducts();
              },
              error: async (error) => {
                const toast = await this.toastController.create({
                  message: 'Error deleting product: ' + (error.error?.message || 'Unknown error'),
                  duration: 3000,
                  color: 'danger',
                  position: 'top'
                });
                await toast.present();
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  getProductImage(imageName: string): string {
    if (!imageName) {
      return 'assets/images/no-image.svg';
    }
    return `http://localhost/ionic_php_ecommerce/backend/images/${imageName}`;
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  formatPriceToRupiah(price: number | string): string {
    if (!price) return 'Rp 0';
    
    // Convert to number if string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numPrice)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice);
  }

  goBack() {
    this.router.navigate(['/tabs/tab3']);
  }
}
