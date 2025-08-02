import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, homeOutline, receiptOutline } from 'ionicons/icons';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.page.html',
  styleUrls: ['./order-success.page.scss'],
  standalone: true,
  imports: [IonList, IonLabel, IonItem, IonIcon, IonButton, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class OrderSuccessPage implements OnInit {
  orderData: any = null;

  constructor(private router: Router) {
    addIcons({
      checkmarkCircleOutline,
      homeOutline,
      receiptOutline
    });
  }

  ngOnInit() {
    // Get order data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.orderData = navigation.extras.state['orderData'];
    }

    // If no order data, redirect to home
    if (!this.orderData) {
      this.router.navigate(['/tabs/tab1']);
    }
  }

  goToHome() {
    this.router.navigate(['/tabs/tab1']);
  }

  goToOrders() {
    this.router.navigate(['/order-history']);
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
        // Try to parse if it's a JSON string
        const parsed = JSON.parse(shippingAddress);
        return this.buildAddressString(parsed);
      } catch {
        // If parsing fails, return as is
        return shippingAddress;
      }
    }
    
    // If it's already an object
    return this.buildAddressString(shippingAddress);
  }

  private buildAddressString(addressObj: any): string {
    const parts = [];
    if (addressObj.name) parts.push(addressObj.name);
    if (addressObj.phone) parts.push(addressObj.phone);
    if (addressObj.address) parts.push(addressObj.address);
    return parts.join('\n');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}
