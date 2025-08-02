import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  receiptOutline,
  cubeOutline,
  cardOutline,
  locationOutline,
  timeOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

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
  selector: 'app-order-detail-modal',
  templateUrl: './order-detail-modal.component.html',
  styleUrls: ['./order-detail-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class OrderDetailModalComponent {
  @Input() order!: Order;

  constructor(private modalController: ModalController) {
    addIcons({
      closeOutline,
      receiptOutline,
      cubeOutline,
      cardOutline,
      locationOutline,
      timeOutline,
      checkmarkCircleOutline
    });
  }

  dismiss() {
    this.modalController.dismiss();
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
    if (addressObj.phone) parts.push(`Tel: ${addressObj.phone}`);
    if (addressObj.address) parts.push(addressObj.address);
    if (addressObj.city) parts.push(addressObj.city);
    if (addressObj.postal_code) parts.push(addressObj.postal_code);
    return parts.join(', ');
  }
}
