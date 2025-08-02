export const environment = {
  production: true,
  
  // Base URLs for production
  baseUrl: 'https://your-domain.com/ionic_php_ecommerce',
  apiUrl: 'https://your-domain.com/ionic_php_ecommerce/backend/api',
  imagesUrl: 'https://your-domain.com/ionic_php_ecommerce/backend/images',
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
