import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  
  constructor() { }

  /**
   * Get the full URL for product images
   * @param imageName - The image filename
   * @returns Full image URL or default no-image URL
   */
  getProductImageUrl(imageName: string): string {
    if (!imageName || imageName.trim() === '') {
      return `${environment.assetsUrl}/${environment.defaultImages.noImage}`;
    }
    return `${environment.imagesUrl}/${imageName}`;
  }

  /**
   * Get the full URL for category images
   * @param imageName - The image filename
   * @returns Full image URL or default no-image URL
   */
  getCategoryImageUrl(imageName: string): string {
    if (!imageName || imageName.trim() === '') {
      return `${environment.assetsUrl}/${environment.defaultImages.noImage}`;
    }
    return `${environment.imagesUrl}/${imageName}`;
  }

  /**
   * Get default no-image URL
   * @returns Default no-image URL
   */
  getNoImageUrl(): string {
    return `${environment.assetsUrl}/${environment.defaultImages.noImage}`;
  }

  /**
   * Get placeholder image URL
   * @returns Placeholder image URL
   */
  getPlaceholderUrl(): string {
    return `${environment.assetsUrl}/${environment.defaultImages.placeholder}`;
  }

  /**
   * Get base API URL
   * @returns Base API URL
   */
  getApiUrl(): string {
    return environment.apiUrl;
  }

  /**
   * Get base images URL
   * @returns Base images URL
   */
  getImagesUrl(): string {
    return environment.imagesUrl;
  }

  /**
   * Get full API endpoint URL
   * @param endpoint - The endpoint path
   * @returns Full endpoint URL
   */
  getApiEndpoint(endpoint: string): string {
    return `${environment.apiUrl}${endpoint}`;
  }

  /**
   * Get environment configuration
   * @returns Environment object
   */
  getEnvironment() {
    return environment;
  }

  /**
   * Check if URL is external
   * @param url - URL to check
   * @returns True if external, false if internal
   */
  isExternalUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Build URL with query parameters
   * @param baseUrl - Base URL
   * @param params - Query parameters object
   * @returns URL with query parameters
   */
  buildUrlWithParams(baseUrl: string, params: { [key: string]: any }): string {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key].toString());
      }
    });
    return url.toString();
  }
}
