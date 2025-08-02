import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonThumbnail,
  IonImg,
  IonLabel,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLoading,
  ToastController,
  AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, add, remove, trash, bag, trashOutline } from 'ionicons/icons';

import { ApiService } from '../services/api.service';
import { CartItem } from '../models/interfaces';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonThumbnail,
    IonImg,
    IonLabel,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonLoading
  ]
})
export class Tab2Page implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  isLoading = false;
  isLoggedIn = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ cartOutline, add, remove, trash, bag, trashOutline });
  }

  ngOnInit() {
    this.checkLoginStatus();
  }

  ionViewWillEnter() {
    this.checkLoginStatus();
    if (this.isLoggedIn) {
      this.loadCart();
    }
  }

  checkLoginStatus() {
    this.isLoggedIn = this.apiService.isLoggedIn();
  }

  loadCart() {
    this.isLoading = true;
    this.apiService.getCart().subscribe({
      next: (response) => {
        this.cartItems = response.records;
        this.cartTotal = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.isLoading = false;
      }
    });
  }

  async increaseQuantity(item: CartItem) {
    if (item.quantity >= item.stock) {
      const toast = await this.toastController.create({
        message: 'Maximum stock reached',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    const newQuantity = item.quantity + 1;
    this.updateItemQuantity(item, newQuantity);
  }

  decreaseQuantity(item: CartItem) {
    const newQuantity = item.quantity - 1;
    
    // Jika quantity akan menjadi 0, hapus item dari cart
    if (newQuantity <= 0) {
      this.removeItemWithConfirm(item);
      return;
    }

    this.updateItemQuantity(item, newQuantity);
  }

  updateItemQuantity(item: CartItem, newQuantity: number) {
    this.apiService.updateCartItem(item.id, newQuantity).subscribe({
      next: async (response) => {
        // Update local item
        item.quantity = newQuantity;
        item.subtotal = item.price * newQuantity;
        
        // Recalculate total
        this.cartTotal = this.cartItems.reduce((total, cartItem) => 
          total + cartItem.subtotal, 0);
      },
      error: async (error) => {
        const toast = await this.toastController.create({
          message: 'Failed to update quantity',
          duration: 2000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  async removeItemWithConfirm(item: CartItem) {
    const alert = await this.alertController.create({
      header: 'Hapus Produk',
      message: `Apakah Anda yakin ingin menghapus "${item.name}" dari keranjang?`,
      subHeader: 'Quantity akan menjadi 0 dan produk akan dihapus.',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.confirmRemoveItem(item);
          }
        }
      ]
    });

    await alert.present();
  }

  async removeItem(item: CartItem) {
    const alert = await this.alertController.create({
      header: 'Remove Item',
      message: 'Are you sure you want to remove this item from your cart?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.confirmRemoveItem(item);
          }
        }
      ]
    });

    await alert.present();
  }

  confirmRemoveItem(item: CartItem) {
    this.apiService.removeFromCart(item.id).subscribe({
      next: async (response) => {
        // Remove item from local array
        this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== item.id);
        
        // Recalculate total
        this.cartTotal = this.cartItems.reduce((total, cartItem) => 
          total + cartItem.subtotal, 0);

        const toast = await this.toastController.create({
          message: 'Item removed from cart',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
      },
      error: async (error) => {
        const toast = await this.toastController.create({
          message: 'Failed to remove item',
          duration: 2000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  formatRupiah(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  getProductImage(imageName: string): string {
    if (!imageName) {
      return 'assets/images/no-image.svg';
    }
    return `http://localhost/ionic_php_ecommerce/backend/images/${imageName}`;
  }

  goToLogin() {
    this.router.navigate(['/tabs/tab3']);
  }

  continueShopping() {
    this.router.navigate(['/tabs/tab1']);
  }

  async proceedToCheckout() {
    if (!this.isLoggedIn) {
      const alert = await this.alertController.create({
        header: 'Login Required',
        message: 'Please login to proceed with checkout.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Login',
            handler: () => {
              this.goToLogin();
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    if (this.cartItems.length === 0) {
      const toast = await this.toastController.create({
        message: 'Your cart is empty',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    // Navigate to checkout page with cart items
    this.router.navigate(['/checkout'], {
      state: { cartItems: this.cartItems }
    });
  }

  async clearCart() {
    const alert = await this.alertController.create({
      header: 'Clear Cart',
      message: 'Are you sure you want to remove all items from your cart?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear',
          role: 'destructive',
          handler: () => {
            this.confirmClearCart();
          }
        }
      ]
    });
    await alert.present();
  }

  confirmClearCart() {
    // For now, just clear locally - you can implement API call later
    this.cartItems = [];
    this.cartTotal = 0;
    this.toastController.create({
      message: 'Cart cleared successfully',
      duration: 2000,
      color: 'success',
      position: 'top'
    }).then(toast => toast.present());
  }
}
