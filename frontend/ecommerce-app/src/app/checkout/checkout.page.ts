import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class CheckoutPage implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  shippingAddress: ShippingAddress | null = null;
  selectedPaymentMethod: string = 'cod';
  isLoading = false;
  private currentLoading: any = null; // Keep reference to current loading

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

  async ngOnInit() {
    this.loadCartItems();
    await this.loadShippingAddress(); // Wait for address to load
    this.calculateTotal();
    
    // Subscribe to profile updates to refresh shipping address
    this.apiService.profileUpdated$.subscribe(updated => {
      if (updated) {
        this.loadShippingAddress();
        this.apiService.resetProfileUpdateFlag();
      }
    });
  }

  async ionViewWillEnter() {
    // Refresh shipping address every time user enters this page
    // This is important when user comes back from edit-profile
    await this.loadShippingAddress();
  }

  ngOnDestroy() {
    // Clean up loading if it exists
    if (this.currentLoading) {
      try {
        this.currentLoading.dismiss();
      } catch (error) {
        console.log('Loading already dismissed');
      }
    }
    this.isLoading = false;
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

  async loadShippingAddress() {
    // First try to load from API to get the latest data
    try {
      const response = await this.apiService.getProfile().toPromise();
      if (response && response.user && response.user.name && response.user.address) {
        this.shippingAddress = {
          name: response.user.name,
          phone: response.user.phone || '',
          address: response.user.address
        };
        console.log('Shipping address loaded from API:', this.shippingAddress);
        return; // Exit early if we got data from API
      }
    } catch (error) {
      console.error('Failed to load profile from API:', error);
    }

    // Fallback: Load user's address from localStorage
    const userData = localStorage.getItem('user') || localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.name && user.address) { // Remove phone requirement
          this.shippingAddress = {
            name: user.name,
            phone: user.phone || '',
            address: user.address
          };
          console.log('Shipping address loaded from localStorage:', this.shippingAddress);
        } else {
          console.log('Incomplete user data in localStorage:', user);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    } else {
      console.log('No user data found in localStorage');
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
    this.currentLoading = await this.loadingController.create({
      message: 'Memproses pesanan...'
    });
    await this.currentLoading.present();

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
        
        // Reset loading state and dismiss loading before navigation
        this.isLoading = false;
        try {
          if (this.currentLoading) {
            await this.currentLoading.dismiss();
            this.currentLoading = null;
          }
        } catch (dismissError) {
          // Loading might already be dismissed, ignore error
          console.log('Loading already dismissed or destroyed');
        }
        
        // Navigate to order success page with actual order data
        this.router.navigate(['/order-success'], {
          state: { 
            orderData: response.data
          }
        });
        return; // Exit early to prevent finally block execution
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
      // Check if loading still exists before dismissing
      if (this.currentLoading) {
        try {
          await this.currentLoading.dismiss();
          this.currentLoading = null;
        } catch (dismissError) {
          // Loading might already be dismissed, ignore error
          console.log('Loading already dismissed or destroyed');
        }
      }
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

  goToOrderHistory() {
    this.router.navigate(['/order-history']);
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
