import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  arrowBack, 
  star, 
  starOutline, 
  cartOutline, 
  heart, 
  heartOutline, 
  shareOutline,
  eyeOutline,
  add,
  remove,
  alertCircleOutline,
  cube
} from 'ionicons/icons';

import { ApiService } from '../services/api.service';
import { UrlService } from '../services/url.service';
import { Product } from '../models/interfaces';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProductDetailPage implements OnInit {
  product: Product | null = null;
  productId: number | null = null;
  isLoading: boolean = true;
  quantity: number = 1;
  isLiked: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private urlService: UrlService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ 
      arrowBack, 
      star, 
      starOutline, 
      cartOutline, 
      heart, 
      heartOutline, 
      shareOutline,
      eyeOutline,
      add,
      remove,
      alertCircleOutline,
      cube
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      if (this.productId) {
        this.loadProductDetail();
      }
    });
  }

  loadProductDetail() {
    this.isLoading = true;
    this.apiService.getProductById(this.productId!).subscribe({
      next: (response) => {
        this.product = response.product;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product detail:', error);
        this.isLoading = false;
        this.showErrorAndGoBack();
      }
    });
  }

  async showErrorAndGoBack() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Failed to load product details. Returning to shop.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.goBack();
        }
      }]
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }

  getProductImage(imageName: string): string {
    return this.urlService.getProductImageUrl(imageName);
  }

  onImageError(event: any) {
    (event.target as HTMLImageElement).src = this.urlService.getNoImageUrl();
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

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  toggleLike() {
    this.isLiked = !this.isLiked;
    // Here you can implement API call to save/remove from wishlist
  }

  async addToCart() {
    if (!this.product) return;

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

    this.apiService.addToCart(this.product.id, this.quantity).subscribe({
      next: async (response) => {
        const toast = await this.toastController.create({
          message: `${this.quantity} item(s) added to cart!`,
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
      },
      error: async (error) => {
        const toast = await this.toastController.create({
          message: 'Failed to add to cart. Please try again.',
          duration: 2000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  async shareProduct() {
    if (navigator.share && this.product) {
      try {
        await navigator.share({
          title: this.product.name,
          text: `Check out this product: ${this.product.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const toast = await this.toastController.create({
        message: 'Share feature not supported on this device',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
    }
  }
}
