const API_BASE_URL = 'http://localhost:3000/api';
let currentProduct = null;

// Get product ID from URL
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Get category name in Farsi
function getCategoryName(category) {
    const categories = {
        'electronics': 'الکترونیک',
        'clothing': 'پوشاک',
        'food': 'مواد غذایی',
        'home': 'خانه و آشپزخانه',
        'beauty': 'زیبایی و سلامت',
        'sports': 'ورزش و سرگرمی',
    };
    return categories[category] || category;
}

// Format price
function formatPrice(price) {
    return price.toLocaleString('fa-IR');
}

// Load product details
async function loadProductDetails() {
    const productId = getProductIdFromURL();
    
    if (!productId) {
        if (typeof showError === 'function') {
            showError('شناسه محصول یافت نشد');
        } else {
            alert('شناسه محصول یافت نشد');
        }
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('محصول یافت نشد');
            }
            throw new Error('خطا در بارگذاری اطلاعات محصول');
        }

        const product = await response.json();
        currentProduct = product;
        displayProductDetails(product);
    } catch (error) {
        console.error('Error loading product:', error);
        if (typeof showError === 'function') {
            showError(error.message);
        } else {
            alert(error.message);
        }
    }
}

// Display product details
function displayProductDetails(product) {
    // Hide loading, show product details
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('productDetails').style.display = 'block';

    // Set product name
    document.getElementById('productName').textContent = product.name;
    document.getElementById('breadcrumbProductName').textContent = product.name;

    // Set price
    document.getElementById('productPrice').textContent = formatPrice(product.price);

    // Set supplier
    document.getElementById('productSupplier').textContent = product.supplier || '-';

    // Set category
    document.getElementById('productCategory').textContent = getCategoryName(product.category);

    // Set stock
    const stock = product.stock || 0;
    document.getElementById('productStock').textContent = stock > 0 ? `${stock} عدد` : 'ناموجود';
    if (stock === 0) {
        document.getElementById('productStock').classList.add('text-danger');
    }

    // Set min order
    const minOrder = product.minOrder || 1;
    document.getElementById('productMinOrder').textContent = `${minOrder} عدد`;
    document.getElementById('productQuantity').min = minOrder;
    document.getElementById('productQuantity').value = minOrder;
    document.getElementById('quantityHelper').textContent = `حداقل سفارش: ${minOrder} عدد`;

    // Set description
    const description = product.description || 'توضیحاتی برای این محصول ثبت نشده است.';
    document.getElementById('productDescription').textContent = description;

    // Set image
    const productImage = document.getElementById('productImage');
    const productImagePlaceholder = document.getElementById('productImagePlaceholder');
    
    // Hide placeholder initially
    productImagePlaceholder.style.display = 'none';
    productImage.style.display = 'none';
    
    if (product.image && product.image.trim() !== '') {
        // Handle both absolute and relative URLs
        let imageUrl = product.image.trim();
        
        // If it's a relative path starting with /, keep it as is
        // If it's a relative path without /, add /
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
            imageUrl = '/' + imageUrl;
        }
        
        console.log('Loading product image:', imageUrl);
        
        productImage.alt = product.name;
        
        // Handle image load error
        productImage.onerror = function() {
            console.error('Failed to load image:', imageUrl);
            productImage.style.display = 'none';
            productImagePlaceholder.style.display = 'block';
        };
        
        // Handle image load success
        productImage.onload = function() {
            console.log('Image loaded successfully:', imageUrl);
            productImage.style.display = 'block';
            productImagePlaceholder.style.display = 'none';
        };
        
        // Set src after setting up event handlers
        productImage.src = imageUrl;
    } else {
        console.log('No image URL provided for product');
        productImage.style.display = 'none';
        productImagePlaceholder.style.display = 'block';
    }

    // Update add to cart button state
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (stock === 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.innerHTML = '<i class="fas fa-times me-2"></i>ناموجود';
        addToCartBtn.classList.remove('btn-primary');
        addToCartBtn.classList.add('btn-secondary');
    } else {
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = '<i class="fas fa-cart-plus me-2"></i>افزودن به سبد خرید';
        addToCartBtn.classList.remove('btn-secondary');
        addToCartBtn.classList.add('btn-primary');
    }
}

// Show error
function showError(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

// Add to cart
function handleAddToCart() {
    if (!currentProduct) return;

    const quantity = parseInt(document.getElementById('productQuantity').value) || 1;
    const minOrder = currentProduct.minOrder || 1;

    if (quantity < minOrder) {
        if (typeof showError === 'function') {
            showError(`حداقل سفارش ${minOrder} عدد است`);
        } else {
            alert(`حداقل سفارش ${minOrder} عدد است`);
        }
        return;
    }

    const stock = currentProduct.stock || 0;
    if (quantity > stock) {
        if (typeof showError === 'function') {
            showError(`موجودی محصول ${stock} عدد است`);
        } else {
            alert(`موجودی محصول ${stock} عدد است`);
        }
        return;
    }

    const productForCart = {
        _id: currentProduct._id,
        id: currentProduct._id,
        name: currentProduct.name,
        supplier: currentProduct.supplier,
        price: currentProduct.price,
        category: currentProduct.category,
        image: currentProduct.image,
        quantity: quantity
    };

    if (typeof addToCart === 'function') {
        addToCart(productForCart);
        if (typeof showSuccess === 'function') {
            showSuccess('محصول به سبد خرید اضافه شد');
        } else {
            alert('محصول به سبد خرید اضافه شد');
        }
    } else {
        if (typeof showError === 'function') {
            showError('خطا: تابع افزودن به سبد خرید یافت نشد');
        } else {
            alert('خطا: تابع افزودن به سبد خرید یافت نشد');
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
    checkAuth();
    loadProductDetails();

    // Add to cart button
    document.getElementById('addToCartBtn').addEventListener('click', handleAddToCart);

    // Back to products button
    document.getElementById('backToProductsBtn').addEventListener('click', () => {
        window.location.href = '/html/products.html';
    });

    // Quantity input validation
    document.getElementById('productQuantity').addEventListener('change', (e) => {
        const quantity = parseInt(e.target.value) || 1;
        const minOrder = currentProduct?.minOrder || 1;
        const stock = currentProduct?.stock || 0;

        if (quantity < minOrder) {
            e.target.value = minOrder;
            if (typeof showError === 'function') {
                showError(`حداقل سفارش ${minOrder} عدد است`);
            } else {
                alert(`حداقل سفارش ${minOrder} عدد است`);
            }
        } else if (quantity > stock && stock > 0) {
            e.target.value = stock;
            if (typeof showError === 'function') {
                showError(`موجودی محصول ${stock} عدد است`);
            } else {
                alert(`موجودی محصول ${stock} عدد است`);
            }
        }
    });
});

