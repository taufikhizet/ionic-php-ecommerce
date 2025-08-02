# PowerShell script to download placeholder images for e-commerce app
$imagesPath = "c:\laragon\www\ionic_php_ecommerce\frontend\src\assets\images"

# Create images directory if not exists
if (!(Test-Path $imagesPath)) {
    New-Item -ItemType Directory -Path $imagesPath -Force
}

Write-Host "Downloading placeholder images..." -ForegroundColor Green

# Product images with specific colors and text
$productImages = @(
    @{name="smartphone_x1.jpg"; url="https://dummyimage.com/300x300/007bff/ffffff.jpg?text=Smartphone+X1"},
    @{name="laptop_pro.jpg"; url="https://dummyimage.com/300x300/28a745/ffffff.jpg?text=Laptop+Pro"},
    @{name="wireless_headphones.jpg"; url="https://dummyimage.com/300x300/dc3545/ffffff.jpg?text=Headphones"},
    @{name="tshirt_cotton.jpg"; url="https://dummyimage.com/300x300/fd7e14/ffffff.jpg?text=T-Shirt"},
    @{name="jeans_classic.jpg"; url="https://dummyimage.com/300x300/6610f2/ffffff.jpg?text=Jeans"},
    @{name="programming_book.jpg"; url="https://dummyimage.com/300x300/e83e8c/ffffff.jpg?text=Programming+Book"},
    @{name="plant_pot.jpg"; url="https://dummyimage.com/300x300/20c997/ffffff.jpg?text=Plant+Pot"}
)

# Category images
$categoryImages = @(
    @{name="electronics.jpg"; url="https://dummyimage.com/300x300/007bff/ffffff.jpg?text=Electronics"},
    @{name="clothing.jpg"; url="https://dummyimage.com/300x300/fd7e14/ffffff.jpg?text=Clothing"},
    @{name="books.jpg"; url="https://dummyimage.com/300x300/e83e8c/ffffff.jpg?text=Books"},
    @{name="home.jpg"; url="https://dummyimage.com/300x300/20c997/ffffff.jpg?text=Home+Garden"}
)

# Download function
function Download-Image {
    param($imageInfo, $destinationPath)
    
    try {
        $fullPath = Join-Path $destinationPath $imageInfo.name
        Write-Host "Downloading $($imageInfo.name)..." -ForegroundColor Yellow
        
        Invoke-WebRequest -Uri $imageInfo.url -OutFile $fullPath -UseBasicParsing
        Write-Host "✅ Downloaded: $($imageInfo.name)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to download $($imageInfo.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Download all product images
Write-Host "`n--- Downloading Product Images ---" -ForegroundColor Cyan
foreach ($image in $productImages) {
    Download-Image -imageInfo $image -destinationPath $imagesPath
}

# Download all category images
Write-Host "`n--- Downloading Category Images ---" -ForegroundColor Cyan
foreach ($image in $categoryImages) {
    Download-Image -imageInfo $image -destinationPath $imagesPath
}

Write-Host "`n🎉 All images downloaded successfully!" -ForegroundColor Green
Write-Host "Images saved to: $imagesPath" -ForegroundColor Blue

# List downloaded files
Write-Host "`n--- Downloaded Files ---" -ForegroundColor Cyan
Get-ChildItem -Path $imagesPath -Filter "*.jpg" | ForEach-Object {
    Write-Host "✓ $($_.Name)" -ForegroundColor Green
}
