# Environment Configuration Guide

## 📁 File Structure
```
src/
├── environments/
│   ├── environment.ts         # Development environment
│   └── environment.prod.ts    # Production environment
├── app/
│   ├── config/
│   │   └── app.config.ts      # App configuration utility
│   └── services/
│       ├── api.service.ts     # API service with environment URLs
│       └── url.service.ts     # URL utility service
```

## 🛠️ Configuration Files

### 1. Environment Files

#### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  
  // Base URLs
  baseUrl: 'http://localhost/ionic_php_ecommerce',
  apiUrl: 'http://localhost/ionic_php_ecommerce/backend/api',
  imagesUrl: 'http://localhost/ionic_php_ecommerce/backend/images',
  assetsUrl: 'assets/images',
  
  // API Endpoints (relative paths)
  endpoints: {
    auth: {
      login: '/login.php',
      register: '/register.php',
      profile: '/profile.php'
    },
    // ... other endpoints
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
```

#### Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  
  // Production URLs - Update these for your server
  baseUrl: 'https://your-domain.com/ionic_php_ecommerce',
  apiUrl: 'https://your-domain.com/ionic_php_ecommerce/backend/api',
  imagesUrl: 'https://your-domain.com/ionic_php_ecommerce/backend/images',
  // ... same structure as development
};
```

## 🚀 Usage Examples

### 1. In Services

#### API Service
```typescript
import { environment } from '../../environments/environment';

@Injectable()
export class ApiService {
  private baseUrl = environment.apiUrl;
  private endpoints = environment.endpoints;

  login(email: string, password: string) {
    return this.http.post(`${this.baseUrl}${this.endpoints.auth.login}`, {
      email, password
    });
  }
}
```

#### URL Service
```typescript
import { environment } from '../../environments/environment';

@Injectable()
export class UrlService {
  getProductImageUrl(imageName: string): string {
    if (!imageName) {
      return `${environment.assetsUrl}/${environment.defaultImages.noImage}`;
    }
    return `${environment.imagesUrl}/${imageName}`;
  }
}
```

### 2. In Components

```typescript
import { UrlService } from '../services/url.service';

@Component({...})
export class ProductComponent {
  constructor(private urlService: UrlService) {}

  getProductImage(imageName: string): string {
    return this.urlService.getProductImageUrl(imageName);
  }
}
```

### 3. Using App Config Utility

```typescript
import { AppConfig } from '../config/app.config';

// Get API URL
const apiUrl = AppConfig.getApiUrl('/products.php');

// Get image URL
const imageUrl = AppConfig.getImageUrl('product.jpg');

// Check environment
if (AppConfig.isProduction) {
  console.log('Running in production');
}
```

## 🔧 How to Change URLs

### For Local Development (Laragon/XAMPP)
1. Open `src/environments/environment.ts`
2. Update the URLs:
   ```typescript
   baseUrl: 'http://localhost/your-project-name',
   apiUrl: 'http://localhost/your-project-name/backend/api',
   imagesUrl: 'http://localhost/your-project-name/backend/images',
   ```

### For Production Deployment
1. Open `src/environments/environment.prod.ts`
2. Update the URLs:
   ```typescript
   baseUrl: 'https://your-domain.com/project-path',
   apiUrl: 'https://your-domain.com/project-path/backend/api',
   imagesUrl: 'https://your-domain.com/project-path/backend/images',
   ```

### For Different Ports
```typescript
// If your backend runs on different port
apiUrl: 'http://localhost:8080/api',

// If using different protocol
apiUrl: 'https://localhost:8443/api',
```

## 📋 Complete URL Management

### All URLs are now centralized in environment files:

✅ **API Endpoints**: All API calls use `environment.apiUrl` + `environment.endpoints`
✅ **Product Images**: Use `environment.imagesUrl`
✅ **Asset Images**: Use `environment.assetsUrl`
✅ **Default Images**: Use `environment.defaultImages`
✅ **Base URLs**: Use `environment.baseUrl`

### Services Updated:
- ✅ `ApiService`: All API endpoints
- ✅ `UrlService`: All image URLs
- ✅ All page components: Using UrlService for images

### Components Updated:
- ✅ `Tab1Page`: Product listing images
- ✅ `Tab2Page`: Cart images
- ✅ `ProductDetailPage`: Product detail images
- ✅ `CheckoutPage`: Order item images

## 🏗️ Build for Different Environments

### Development Build
```bash
ionic build
# Uses environment.ts
```

### Production Build
```bash
ionic build --prod
# Uses environment.prod.ts
```

### Custom Environment Build
```bash
ionic build --configuration=staging
# You can create environment.staging.ts
```

## 🔍 Debugging URLs

### Check Current Environment
```typescript
import { environment } from '../environments/environment';
console.log('Current environment:', environment);
```

### Debug Image URLs
```typescript
// In component
onImageError(event: any) {
  console.log('Failed image URL:', event.target.src);
  console.log('Environment images URL:', environment.imagesUrl);
}
```

## 📝 Best Practices

1. **Never hardcode URLs** in components or services
2. **Always use environment variables** for different environments
3. **Use UrlService** for consistent image URL handling
4. **Test both development and production** configurations
5. **Update environment.prod.ts** before deployment
6. **Use relative paths** in endpoints configuration
7. **Keep default images** in assets folder

## 🚀 Quick Setup for New Environment

1. Copy `environment.ts` to `environment.newenv.ts`
2. Update URLs in the new file
3. Add configuration to `angular.json`:
   ```json
   "configurations": {
     "newenv": {
       "fileReplacements": [
         {
           "replace": "src/environments/environment.ts",
           "with": "src/environments/environment.newenv.ts"
         }
       ]
     }
   }
   ```
4. Build with: `ionic build --configuration=newenv`

## 🔗 Related Files

- `src/environments/environment.ts` - Development config
- `src/environments/environment.prod.ts` - Production config
- `src/app/services/api.service.ts` - API service
- `src/app/services/url.service.ts` - URL utility service
- `src/app/config/app.config.ts` - Configuration utility

---

**Note**: Remember to update the production URLs in `environment.prod.ts` before deploying to your live server!
