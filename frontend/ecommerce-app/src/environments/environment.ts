// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  
  // Base URLs
  baseUrl: 'http://localhost/ionic_php_ecommerce',
  apiUrl: 'http://localhost/ionic_php_ecommerce/backend/api',
  imagesUrl: 'http://localhost/ionic_php_ecommerce/backend/images',
  assetsUrl: 'assets/images',
  
  // API Endpoints
  endpoints: {
    auth: {
      login: '/login.php',
      register: '/register.php',
      profile: '/profile.php'
    },
    products: {
      list: '/products.php',
      detail: '/products.php',
      search: '/products.php',
      byCategory: '/products.php'
    },
    categories: {
      list: '/categories.php',
      detail: '/categories.php'
    },
    cart: {
      list: '/cart.php',
      add: '/cart.php',
      update: '/cart.php',
      remove: '/cart.php',
      clear: '/cart.php'
    },
    orders: {
      create: '/orders.php',
      list: '/orders.php',
      detail: '/orders.php'
    }
  },
  
  // Default images
  defaultImages: {
    noImage: 'no-image.svg',
    placeholder: 'placeholder.jpg'
  },
  
  // App configuration
  app: {
    name: 'Ionic PHP E-commerce',
    version: '1.0.0',
    timeout: 30000,
    retryAttempts: 3
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
