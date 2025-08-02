import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';

interface UserProfile {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EditProfilePage implements OnInit {
  userProfile: UserProfile = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  isLoading = false;
  originalProfile: UserProfile = {
    name: '',
    email: ''
  };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      // Load from API if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        const response = await this.apiService.getProfile().toPromise();
        if (response.user) {
          this.userProfile = {
            id: response.user.id,
            name: response.user.name || '',
            email: response.user.email || '',
            phone: response.user.phone || '',
            address: response.user.address || ''
          };
          // Store original profile for reset functionality
          this.originalProfile = { ...this.userProfile };
          return;
        }
      }
    } catch (error) {
      console.log('Failed to load profile from API, using localStorage');
    }

    // Fallback to localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.userProfile = {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      };
      // Store original profile for reset functionality
      this.originalProfile = { ...this.userProfile };
    }
  }

  async updateProfile() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Menyimpan perubahan...'
    });
    await loading.present();

    try {
      // Update profile via API
      const profileData = {
        name: this.userProfile.name,
        email: this.userProfile.email,
        phone: this.userProfile.phone || '',
        address: this.userProfile.address || ''
      };

      await this.apiService.updateProfile(profileData).toPromise();

      // Update both userData and user in localStorage for compatibility
      const userData = JSON.parse(localStorage.getItem('userData') || localStorage.getItem('user') || '{}');
      const updatedUserData = { ...userData, ...profileData };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      // Notify ApiService that profile was updated
      this.apiService.notifyProfileUpdated();

      await this.showToast('Profile berhasil diperbarui!', 'success');
      
      // Update original profile
      this.originalProfile = { ...this.userProfile };
      
      // Navigate back to profile page
      this.router.navigate(['/tabs/tab3']);
      
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Gagal memperbarui profile. Silakan coba lagi.';
      await this.showToast(errorMessage, 'danger');
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  validateForm(): boolean {
    if (!this.userProfile.name.trim()) {
      this.showToast('Nama tidak boleh kosong', 'warning');
      return false;
    }

    if (!this.userProfile.email.trim()) {
      this.showToast('Email tidak boleh kosong', 'warning');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userProfile.email)) {
      this.showToast('Format email tidak valid', 'warning');
      return false;
    }

    return true;
  }

  resetForm() {
    this.userProfile = { ...this.originalProfile };
    this.showToast('Form direset ke data asli', 'primary');
  }

  async showDeleteAccountAlert() {
    const alert = await this.alertController.create({
      header: 'Hapus Akun',
      message: 'Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.deleteAccount();
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteAccount() {
    const loading = await this.loadingController.create({
      message: 'Menghapus akun...'
    });
    await loading.present();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear all user data
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      
      await this.showToast('Akun berhasil dihapus', 'success');
      
      // Navigate to login
      this.router.navigate(['/tabs/tab3']);
      
    } catch (error) {
      await this.showToast('Gagal menghapus akun. Silakan coba lagi.', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}
