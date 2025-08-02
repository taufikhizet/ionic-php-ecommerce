import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { LoadingController, AlertController, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  receiptOutline, 
  eyeOutline, 
  starOutline, 
  repeatOutline,
  chevronDownCircleOutline,
  cubeOutline,
  cardOutline,
  locationOutline
} from 'ionicons/icons';
import { OrderDetailModalComponent } from './order-detail-modal.component';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  service_fee: number;
  total: number;
  shipping_address: any;
  notes: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  total_items: number;
  items?: OrderItem[];
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class OrderHistoryPage implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  selectedSegment = 'all';

  constructor(
    public router: Router,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private modalController: ModalController
  ) { 
    addIcons({
      arrowBackOutline,
      receiptOutline,
      eyeOutline,
      starOutline,
      repeatOutline,
      chevronDownCircleOutline,
      cubeOutline,
      cardOutline,
      locationOutline
    });
  }

  async ngOnInit() {
    await this.loadOrders();
  }

  async ionViewWillEnter() {
    // Refresh orders when user enters this page
    await this.loadOrders();
  }

  async doRefresh(event: any) {
    try {
      const response = await this.apiService.getOrders().toPromise();
      if (response && response.records) {
        this.orders = response.records;
      } else {
        this.orders = [];
      }
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    } finally {
      event.target.complete();
    }
  }

  async loadOrders() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Memuat riwayat pesanan...'
    });
    await loading.present();

    try {
      const response = await this.apiService.getOrders().toPromise();
      if (response && response.records) {
        this.orders = response.records;
      } else {
        this.orders = [];
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      this.orders = [];
      await this.showAlert('Error', 'Gagal memuat riwayat pesanan. Silakan coba lagi.');
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  getFilteredOrders(): Order[] {
    if (this.selectedSegment === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.selectedSegment);
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  async viewOrderDetail(order: Order) {
    const modal = await this.modalController.create({
      component: OrderDetailModalComponent,
      componentProps: {
        order: order
      },
      cssClass: 'order-detail-modal'
    });
    return await modal.present();
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Menunggu',
      'processing': 'Diproses',
      'shipped': 'Dikirim',
      'delivered': 'Diterima',
      'cancelled': 'Dibatalkan'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'pending': 'warning',
      'processing': 'primary',
      'shipped': 'secondary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colorMap[status] || 'medium';
  }

  getPaymentMethodName(method: string): string {
    const paymentMethods: { [key: string]: string } = {
      'cod': 'Bayar di Tempat (COD)',
      'bank_transfer': 'Transfer Bank',
      'ewallet': 'E-Wallet'
    };
    return paymentMethods[method] || method;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatShippingAddress(shippingAddress: any): string {
    if (!shippingAddress) return '';
    
    if (typeof shippingAddress === 'string') {
      try {
        const parsed = JSON.parse(shippingAddress);
        return this.buildAddressString(parsed);
      } catch {
        return shippingAddress;
      }
    }
    
    return this.buildAddressString(shippingAddress);
  }

  private buildAddressString(addressObj: any): string {
    const parts = [];
    if (addressObj.name) parts.push(addressObj.name);
    if (addressObj.address) parts.push(addressObj.address);
    return parts.join(', ');
  }

  async reorderItems(order: Order) {
    if (!order.items || order.items.length === 0) {
      await this.showAlert('Info', 'Data item pesanan tidak tersedia untuk pesan ulang.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Pesan Ulang',
      message: `Tambahkan semua item dari pesanan ${order.order_number} ke keranjang?`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Ya, Tambahkan',
          handler: async () => {
            await this.addItemsToCart(order.items!);
          }
        }
      ]
    });
    await alert.present();
  }

  private async addItemsToCart(items: OrderItem[]) {
    const loading = await this.loadingController.create({
      message: 'Menambahkan ke keranjang...'
    });
    await loading.present();

    try {
      for (const item of items) {
        await this.apiService.addToCart(item.product_id, item.quantity).toPromise();
      }
      await loading.dismiss();
      await this.showAlert('Berhasil', 'Item berhasil ditambahkan ke keranjang!');
      this.router.navigate(['/tabs/tab2']); // Navigate to cart
    } catch (error) {
      await loading.dismiss();
      console.error('Failed to add items to cart:', error);
      await this.showAlert('Error', 'Gagal menambahkan item ke keranjang. Silakan coba lagi.');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/tabs/tab3']);
  }
}
