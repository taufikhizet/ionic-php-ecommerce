import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  ToastController,
  AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personCircle, 
  personOutline, 
  locationOutline, 
  cardOutline, 
  receiptOutline, 
  settingsOutline, 
  logOutOutline,
  chevronForward,
  shieldOutline
} from 'ionicons/icons';

import { ApiService } from '../services/api.service';
import { User } from '../models/interfaces';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonInput,
    IonTextarea,
    IonButton,
    IonIcon,
    IonSpinner
  ]
})
export class Tab3Page implements OnInit {
  isLoggedIn = false;
  currentUser: User | null = null;
  authMode = 'login';
  isLoading = false;

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  };

  confirmPassword = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ 
      personCircle, 
      personOutline, 
      locationOutline, 
      cardOutline, 
      receiptOutline, 
      settingsOutline, 
      logOutOutline,
      chevronForward,
      shieldOutline
    });
  }

  ngOnInit() {
    this.checkLoginStatus();
    this.subscribeToUserChanges();
  }

  ionViewWillEnter() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    this.isLoggedIn = this.apiService.isLoggedIn();
    this.currentUser = this.apiService.getCurrentUser();
  }

  subscribeToUserChanges() {
    this.apiService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  onAuthModeChange(event: any) {
    this.authMode = event.detail.value;
    this.clearForms();
  }

  clearForms() {
    this.loginData = { email: '', password: '' };
    this.registerData = { name: '', email: '', phone: '', address: '', password: '' };
    this.confirmPassword = '';
  }

  async login() {
    this.isLoading = true;
    
    this.apiService.login(this.loginData.email, this.loginData.password).subscribe({
      next: async (response) => {
        this.apiService.setCurrentUser(response.user, response.token);
        
        const toast = await this.toastController.create({
          message: 'Login successful!',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
        
        this.clearForms();
        this.isLoading = false;
      },
      error: async (error) => {
        const toast = await this.toastController.create({
          message: error.error?.message || 'Login failed',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
        this.isLoading = false;
      }
    });
  }

  async register() {
    if (this.registerData.password !== this.confirmPassword) {
      const toast = await this.toastController.create({
        message: 'Passwords do not match',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;
    
    this.apiService.register(this.registerData).subscribe({
      next: async (response) => {
        const toast = await this.toastController.create({
          message: 'Registration successful! Please login.',
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
        
        this.authMode = 'login';
        this.loginData.email = this.registerData.email;
        this.clearForms();
        this.isLoading = false;
      },
      error: async (error) => {
        const toast = await this.toastController.create({
          message: error.error?.message || 'Registration failed',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
        this.isLoading = false;
      }
    });
  }

  openAdmin() {
    this.router.navigate(['/admin']);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: () => {
            this.apiService.logout();
            this.router.navigate(['/tabs/tab1']);
          }
        }
      ]
    });

    await alert.present();
  }
}
