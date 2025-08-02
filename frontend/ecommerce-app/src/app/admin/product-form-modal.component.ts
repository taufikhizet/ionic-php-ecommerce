import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UrlService } from '../services/url.service';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, trash } from 'ionicons/icons';

@Component({
  selector: 'app-product-form-modal',
  templateUrl: './product-form-modal.component.html',
  styleUrls: ['./product-form-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonSpinner
  ]
})
export class ProductFormModalComponent implements OnInit {
  @Input() isEditMode: boolean = false;
  @Input() productForm: any = {};
  @Input() categories: any[] = [];
  @Input() isLoadingCategories: boolean = false;

  imagePreview: string | null = null;
  selectedFile: File | null = null;
  formattedPrice: string = '';

  constructor(
    private modalController: ModalController,
    private urlService: UrlService
  ) {
    addIcons({ close, trash });
  }

  ngOnInit() {
    // Initialize formatted price when component loads
    if (this.productForm.price) {
      this.formattedPrice = this.formatToRupiah(this.productForm.price);
    }
  }

  // Format number to Rupiah display
  formatToRupiah(amount: number | string): string {
    if (!amount) return '';
    
    // Convert to number if string
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d]/g, '')) : amount;
    
    if (isNaN(numAmount)) return '';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  }

  // Handle price input - allow only numbers and format
  onPriceInput(event: any) {
    const input = event.target.value;
    
    // Remove all non-numeric characters
    const numericValue = input.replace(/[^\d]/g, '');
    
    if (numericValue) {
      // Update the actual price value (numeric)
      this.productForm.price = parseInt(numericValue);
      
      // Update display with Rupiah formatting
      this.formattedPrice = this.formatToRupiah(numericValue);
    } else {
      this.productForm.price = 0;
      this.formattedPrice = '';
    }
  }

  // Format price when user finishes editing
  formatPriceDisplay() {
    if (this.productForm.price) {
      this.formattedPrice = this.formatToRupiah(this.productForm.price);
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Generate filename based on current timestamp
      const timestamp = new Date().getTime();
      const extension = file.name.split('.').pop();
      const filename = `product_${timestamp}.${extension}`;
      this.productForm.image = filename;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.selectedFile = null;
    this.productForm.image = '';
  }

  getImagePath(imageName: string): string {
    return this.urlService.getProductImageUrl(imageName);
  }

  onImageError(event: any) {
    console.log('Image load error:', event);
    event.target.src = this.urlService.getNoImageUrl();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  saveProduct() {
    // Return the form data along with selected file
    const result = {
      productData: this.productForm,
      imageFile: this.selectedFile
    };
    this.modalController.dismiss(result, 'save');
  }
}
