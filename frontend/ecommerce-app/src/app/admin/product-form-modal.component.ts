import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
export class ProductFormModalComponent {
  @Input() isEditMode: boolean = false;
  @Input() productForm: any = {};
  @Input() categories: any[] = [];
  @Input() isLoadingCategories: boolean = false;

  imagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(private modalController: ModalController) {
    addIcons({ close, trash });
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
    if (!imageName) return '';
    return `http://localhost/ionic_php_ecommerce/backend/images/${imageName}`;
  }

  onImageError(event: any) {
    console.log('Image load error:', event);
    // Set a default image
    event.target.src = 'assets/images/no-image.svg';
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
