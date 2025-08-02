import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string;
}

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface OrderData {
  items: CartItem[];
  shipping_address: ShippingAddress;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  service_fee: number;
  total: number;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CheckoutPage implements OnInit {
  cartItems: CartItem[] = [];
  shippingAddress: ShippingAddress | null = null;
  selectedPaymentMethod: string = 'cod';
  isLoading = false;

  // Payment methods
  paymentMethods: PaymentMethod[] = [
    {
      id: 'cod',
      name: 'Bayar di Tempat (COD)',
      description: 'Bayar saat barang diterima',
      icon: 'cash-outline'
    }
  ];

  // Pricing
  subtotal = 0;
  shippingCost = 10000; // Default shipping cost
  serviceFee = 2000; // Service fee
  grandTotal = 0;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadCartItems();
    this.loadShippingAddress();
    this.calculateTotal();
  }

  loadCartItems() {
    // Get cart items from previous page or service
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state && navigation.extras.state['cartItems']) {
      this.cartItems = navigation.extras.state['cartItems'];
    } else {
      // Fallback: load from API or localStorage
      this.loadCartFromAPI();
    }
  }

  async loadCartFromAPI() {
    try {
      const response = await this.apiService.getCart().toPromise();
      if (response && response.records) {
        this.cartItems = response.records;
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Redirect back to cart if no items
      this.router.navigate(['/tabs/tab2']);
    }
  }

  loadShippingAddress() {
    // Load user's address from profile
    const userData = localStorage.getItem('user') || localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.name && user.phone && user.address) {
          this.shippingAddress = {
            name: user.name,
            phone: user.phone,
            address: user.address
          };
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }

  calculateTotal() {
    this.subtotal = this.cartItems.reduce((total, item) => total + item.subtotal, 0);
    this.grandTotal = this.subtotal + this.shippingCost + this.serviceFee;
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getProductImage(imagePath: string): string {
    if (!imagePath) {
      return 'assets/images/no-image.svg';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost/ionic_php_ecommerce/backend/images/${imagePath}`;
  }

  onImageError(event: any, item: CartItem) {
    console.log('Image failed to load:', item.image);
    console.log('Attempted path:', this.getProductImage(item.image));
    (event.target as HTMLImageElement).src = 'assets/images/no-image.svg';
  }

  formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  }

  canPlaceOrder(): boolean {
    return this.cartItems.length > 0 && 
           this.shippingAddress !== null && 
           this.selectedPaymentMethod !== '';
  }

  addAddress() {
    // Navigate to add address page or show modal
    this.router.navigate(['/edit-profile'], {
      queryParams: { returnTo: 'checkout' }
    });
  }

  editAddress() {
    // Navigate to edit address
    this.router.navigate(['/edit-profile'], {
      queryParams: { returnTo: 'checkout' }
    });
  }

  async placeOrder() {
    if (!this.canPlaceOrder()) {
      await this.showToast('Lengkapi informasi pengiriman terlebih dahulu', 'warning');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Memproses pesanan...'
    });
    await loading.present();

    try {
      const orderData: OrderData = {
        items: this.cartItems,
        shipping_address: this.shippingAddress!,
        payment_method: this.selectedPaymentMethod,
        subtotal: this.subtotal,
        shipping_cost: this.shippingCost,
        service_fee: this.serviceFee,
        total: this.grandTotal
      };

      // Call API to create order
      const response = await this.apiService.createOrder(orderData).toPromise();
      
      if (response.success) {
        await this.showToast('Pesanan berhasil dibuat!', 'success');
        
        // Clear cart after successful order
        await this.clearCart();
        
        // Navigate to order success page with actual order data
        this.router.navigate(['/order-success'], {
          state: { 
            orderData: response.data
          }
        });
      } else {
        throw new Error(response.message || 'Gagal membuat pesanan');
      }

    } catch (error: any) {
      console.error('Order creation failed:', error);
      await this.showToast(
        error.message || 'Gagal membuat pesanan. Silakan coba lagi.',
        'danger'
      );
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async clearCart() {
    try {
      // Clear cart via API
      await this.apiService.clearCart().toPromise();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  }

  goBack() {
    this.router.navigate(['/tabs/tab2']);
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
