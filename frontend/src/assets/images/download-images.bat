@echo off
echo Downloading placeholder images for e-commerce app...

cd /d "c:\laragon\www\ionic_php_ecommerce\frontend\src\assets\images"

echo.
echo Downloading product images...
curl -s -o smartphone_x1.jpg "https://dummyimage.com/300x300/007bff/ffffff.jpg?text=Smartphone+X1"
echo Downloaded smartphone_x1.jpg

curl -s -o laptop_pro.jpg "https://dummyimage.com/300x300/28a745/ffffff.jpg?text=Laptop+Pro"
echo Downloaded laptop_pro.jpg

curl -s -o wireless_headphones.jpg "https://dummyimage.com/300x300/dc3545/ffffff.jpg?text=Headphones"
echo Downloaded wireless_headphones.jpg

curl -s -o tshirt_cotton.jpg "https://dummyimage.com/300x300/fd7e14/ffffff.jpg?text=T-Shirt"
echo Downloaded tshirt_cotton.jpg

curl -s -o jeans_classic.jpg "https://dummyimage.com/300x300/6610f2/ffffff.jpg?text=Jeans"
echo Downloaded jeans_classic.jpg

curl -s -o programming_book.jpg "https://dummyimage.com/300x300/e83e8c/ffffff.jpg?text=Programming+Book"
echo Downloaded programming_book.jpg

curl -s -o plant_pot.jpg "https://dummyimage.com/300x300/20c997/ffffff.jpg?text=Plant+Pot"
echo Downloaded plant_pot.jpg

echo.
echo Downloading category images...
curl -s -o electronics.jpg "https://dummyimage.com/300x300/007bff/ffffff.jpg?text=Electronics"
echo Downloaded electronics.jpg

curl -s -o clothing.jpg "https://dummyimage.com/300x300/fd7e14/ffffff.jpg?text=Clothing"
echo Downloaded clothing.jpg

curl -s -o books.jpg "https://dummyimage.com/300x300/e83e8c/ffffff.jpg?text=Books"
echo Downloaded books.jpg

curl -s -o home.jpg "https://dummyimage.com/300x300/20c997/ffffff.jpg?text=Home+Garden"
echo Downloaded home.jpg

echo.
echo All images downloaded successfully!
echo.
echo Downloaded files:
dir *.jpg /b

pause
