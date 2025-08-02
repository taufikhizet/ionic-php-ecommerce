import { environment } from '../../environments/environment';

/**
 * Configuration service for managing application URLs and endpoints
 * This service provides centralized URL management for the entire application
 */
export class AppConfig {
  
  /**
   * Get the current environment configuration
   */
  static get environment() {
    return environment;
  }

  /**
   * API Configuration
   */
  static get api() {
    return {
      baseUrl: environment.apiUrl,
      endpoints: environment.endpoints,
      timeout: environment.app.timeout,
      retryAttempts: environment.app.retryAttempts
    };
  }

  /**
   * Images Configuration
   */
  static get images() {
    return {
      baseUrl: environment.imagesUrl,
      assetsUrl: environment.assetsUrl,
      defaultImages: environment.defaultImages
    };
  }

  /**
   * App Configuration
   */
  static get app() {
    return environment.app;
  }

  /**
   * Check if running in production mode
   */
  static get isProduction(): boolean {
    return environment.production;
  }

  /**
   * Get full URL for any endpoint
   */
  static getApiUrl(endpoint: string): string {
    return `${environment.apiUrl}${endpoint}`;
  }

  /**
   * Get full URL for images
   */
  static getImageUrl(imageName: string): string {
    if (!imageName || imageName.trim() === '') {
      return `${environment.assetsUrl}/${environment.defaultImages.noImage}`;
    }
    
    // If it's already a full URL, return as is
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    
    // If it's an asset image, use assets URL
    if (imageName.startsWith('assets/')) {
      return imageName;
    }
    
    // Otherwise, use images URL
    return `${environment.imagesUrl}/${imageName}`;
  }

  /**
   * Get base URLs for different environments
   */
  static get urls() {
    return {
      base: environment.baseUrl,
      api: environment.apiUrl,
      images: environment.imagesUrl,
      assets: environment.assetsUrl
    };
  }
}
