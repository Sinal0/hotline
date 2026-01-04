// Toast/Alert Helper Functions
function showToast(message, type = 'success') {
    // type: 'success' (green) or 'error' (red)
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const icon = type === 'success' ? '<i class="fas fa-check-circle me-2"></i>' : '<i class="fas fa-exclamation-circle me-2"></i>';
    
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; min-width: 300px; max-width: 500px;';
        document.body.appendChild(toastContainer);
    }
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass} alert-dismissible fade show shadow`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${icon}${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    toastContainer.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 300);
        }
    }, 5000);
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

// Local Storage Management
const Storage = {
    get: (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
    loadPopularProducts();
    checkAuth();
    
    // Update cart count after navbar loads (navbar is loaded dynamically)
    const updateCartCountAfterNavbar = () => {
        const cartCountEl = document.querySelector('.cart-count');
        if (cartCountEl) {
            updateCartCount();
        } else {
            // Retry after a short delay if navbar not loaded yet
            setTimeout(updateCartCountAfterNavbar, 100);
        }
    };
    
    // Try immediately and also after delay
    setTimeout(updateCartCountAfterNavbar, 200);
    
    // Watch for navbar container changes (when navbar is loaded)
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Navbar was loaded, update cart count
                    setTimeout(updateCartCount, 100);
                }
            });
        });
        
        observer.observe(navbarContainer, {
            childList: true,
            subtree: true
        });
    }
});

// Cart Management
let cart = [];

function initializeCart() {
    cart = Storage.get('cart') || [];
    updateCartCount();
}

function addToCart(product) {
    try {
        if (!product) {
            showError('خطا: اطلاعات محصول نامعتبر است');
            return;
        }
        
        const productId = product._id || product.id;
        if (!productId) {
            showError('خطا: شناسه محصول یافت نشد');
            return;
        }
        
        const existingItem = cart.find(item => {
            const itemId = item._id || item.id;
            return String(itemId) === String(productId);
        });
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, id: productId, quantity: 1 });
        }
        
        Storage.set('cart', cart);
        updateCartCount();
        
        // Show success toast
        showSuccess('محصول به سبد خرید اضافه شد');
    } catch (error) {
        console.error('Error in addToCart:', error);
        showError('خطا در افزودن محصول به سبد خرید: ' + error.message);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => {
        const itemId = item._id || item.id;
        return String(itemId) !== String(productId);
    });
    Storage.set('cart', cart);
    updateCartCount();
    // Call loadCartItems if it exists (on cart page)
    if (typeof loadCartItems === 'function') {
        loadCartItems();
    }
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => {
        const itemId = item._id || item.id;
        return String(itemId) === String(productId);
    });
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            Storage.set('cart', cart);
            updateCartCount();
            // Call loadCartItems if it exists (on cart page)
            if (typeof loadCartItems === 'function') {
                loadCartItems();
            }
        }
    }
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Find all cart-count elements (navbar is loaded dynamically)
    const allCartCounts = document.querySelectorAll('.cart-count');
    
    if (allCartCounts.length > 0) {
        allCartCounts.forEach(el => {
            el.textContent = count;
            // Hide badge if count is 0
            if (count === 0) {
                el.style.display = 'none';
            } else {
                el.style.display = '';
            }
        });
    } else {
        // If not found, retry after a short delay (navbar might still be loading)
        setTimeout(() => {
            const retryCartCounts = document.querySelectorAll('.cart-count');
            if (retryCartCounts.length > 0) {
                retryCartCounts.forEach(el => {
                    el.textContent = count;
                    if (count === 0) {
                        el.style.display = 'none';
                    } else {
                        el.style.display = '';
                    }
                });
            }
        }, 200);
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Categories Menu
function categoriesMenu() {
    var x = document.getElementById("myLinks");
    if (x.style.display === "block") {
      x.style.display = "none";
    } else {
      x.style.display = "block";
    } 
  }


// Sample Products Data
const sampleProducts = [
    {
        id: 1,
        name: 'لپ‌تاپ Dell XPS 15',
        supplier: 'شرکت واردات الکترونیک',
        price: 45000000,
        category: 'electronics',
        image: 'laptop',
        description: 'لپ‌تاپ حرفه‌ای با پردازنده Intel Core i7'
    },
    {
        id: 2,
        name: 'تی‌شرت پنبه‌ای مردانه',
        supplier: 'کارخانه پوشاک تهران',
        price: 150000,
        category: 'clothing',
        image: 'tshirt',
        description: 'تی‌شرت با کیفیت بالا، 100% پنبه'
    },
    {
        id: 3,
        name: 'برنج طارم ممتاز',
        supplier: 'شرکت واردات مواد غذایی',
        price: 850000,
        category: 'food',
        image: 'rice',
        description: 'برنج طارم درجه یک، بسته‌بندی 10 کیلویی'
    },
    {
        id: 4,
        name: 'ماشین لباسشویی سامسونگ',
        supplier: 'واردکننده لوازم خانگی',
        price: 25000000,
        category: 'home',
        image: 'washing',
        description: 'ماشین لباسشویی 8 کیلویی، تمام اتوماتیک'
    },
    {
        id: 5,
        name: 'کرم ضد آفتاب SPF 50',
        supplier: 'واردکننده محصولات آرایشی',
        price: 350000,
        category: 'beauty',
        image: 'cream',
        description: 'کرم ضد آفتاب با محافظت بالا'
    },
    {
        id: 6,
        name: 'توپ فوتبال چرمی',
        supplier: 'تولیدکننده لوازم ورزشی',
        price: 450000,
        category: 'sports',
        image: 'ball',
        description: 'توپ فوتبال استاندارد FIFA'
    }
];

// Load Popular Products
async function loadPopularProducts() {
    const container = document.getElementById('popularProducts');
    if (!container) return;

    try {
        const response = await fetch('http://localhost:3000/api/products/popular?limit=4');
        let products = [];
        
        if (response.ok) {
            products = await response.json();
            // Take first 4 products
            products = products.slice(0, 4);
        } else {
            // Try to get latest products as fallback
            const fallbackResponse = await fetch('http://localhost:3000/api/products?limit=4');
            if (fallbackResponse.ok) {
                const data = await fallbackResponse.json();
                products = data.products || data || [];
                products = products.slice(0, 4);
            }
        }
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-box-open text-muted mb-3" style="font-size: 4rem;"></i>
                    <p class="text-muted">در حال حاضر محصولی برای نمایش وجود ندارد</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = products.map(product => {
            const productId = product._id || product.id;
            const productForCart = {
                _id: productId,
                id: productId,
                name: product.name,
                supplier: product.supplier,
                price: product.price,
                category: product.category,
                image: product.image
            };
            return `
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 shadow-sm product-card">
                    <div class="card-body d-flex flex-column align-items-center justify-content-center bg-light" style="min-height: 200px;">
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.name}" class="img-fluid" style="max-height: 180px; object-fit: contain;">` :
                            `<i class="fas fa-${getProductIcon(product.category)} text-muted" style="font-size: 4rem;"></i>`
                        }
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted small mb-2">
                            <i class="fas fa-store me-1"></i>${product.supplier}
                        </p>
                        ${product.description ? `<p class="card-text text-muted small mb-2">${product.description.substring(0, 50)}...</p>` : ''}
                        <p class="card-text text-primary fw-bold fs-5 mb-3">${formatPrice(product.price)} تومان</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary btn-sm flex-fill add-to-cart-btn" 
                                    data-product='${JSON.stringify(productForCart)}'>
                                <i class="fas fa-cart-plus"></i> افزودن
                            </button>
                            <a href="/products.html?id=${productId}" class="btn btn-outline-primary btn-sm">مشاهده</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        }).join('');
        
        // Add event listeners for add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                try {
                    const productData = this.getAttribute('data-product');
                    if (!productData) {
                        console.error('Product data not found');
                        alert('خطا: اطلاعات محصول یافت نشد');
                        return;
                    }
                    const product = JSON.parse(productData);
                    if (typeof addToCart === 'function') {
                        addToCart(product);
                    } else {
                        alert('خطا: تابع افزودن به سبد خرید یافت نشد');
                    }
                } catch (error) {
                    console.error('Error parsing product data:', error);
                    alert('خطا در افزودن محصول به سبد خرید: ' + error.message);
                }
            });
        });
    } catch (error) {
        console.error('Error loading popular products:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    خطا در بارگذاری محصولات پرفروش
                </div>
            </div>
        `;
    }
}

function getProductIcon(category) {
    const icons = {
        electronics: 'laptop',
        clothing: 'tshirt',
        food: 'utensils',
        home: 'home',
        beauty: 'spa',
        sports: 'dumbbell'
    };
    return icons[category] || 'box';
}

function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price);
}

// Filter Category
function filterCategory(category) {
    window.location.href = `/products.html?category=${category}`;
}

// Modal Functions
function openLoginModal() {
    // Redirect to login page instead of showing modal
    window.location.href = '/login.html';
}

function closeLoginModal() {
    const modalElement = document.getElementById('loginModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
}

function switchTab(tab) {
    if (typeof bootstrap === 'undefined') return;
    
    if (tab === 'login') {
        const loginTab = document.getElementById('login-tab');
        if (loginTab) {
            const tabInstance = new bootstrap.Tab(loginTab);
            tabInstance.show();
        }
    } else {
        const registerTab = document.getElementById('register-tab');
        if (registerTab) {
            const tabInstance = new bootstrap.Tab(registerTab);
            tabInstance.show();
        }
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLoginModal();
    }
}

// Send OTP for login
async function sendLoginOTP() {
    const phoneInput = document.getElementById('loginPhone');
    const phone = phoneInput.value.trim();
    const sendOtpBtn = document.getElementById('sendLoginOtpBtn');
    const otpSection = document.getElementById('loginOtpSection');
    
    // Validate phone number (Iranian format)
    const phoneRegex = /^09\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
        showNotification('لطفا شماره تماس معتبر وارد کنید (مثال: 09123456789)', 'error');
        return;
    }
    
    // Disable button and show loading
    sendOtpBtn.disabled = true;
    sendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>در حال ارسال...';
    
    try {
        // Generate 6-digit OTP
        const loginOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const loginOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        
        // Store OTP in localStorage for verification
        Storage.set('pendingLoginOTP', {
            code: loginOtpCode,
            phone: phone,
            expiry: loginOtpExpiry
        });
        
        // In production, send OTP via SMS service
        // For now, show it in console and alert (for testing)
        console.log('Login OTP Code:', loginOtpCode);
        alert(`کد تایید ورود: ${loginOtpCode}\n\n(این فقط برای تست است. در نسخه نهایی به شماره شما پیامک ارسال می‌شود)`);
        
        // Show OTP input section
        otpSection.style.display = 'block';
        document.getElementById('loginOtp').focus();
        
        // Enable button after 60 seconds
        setTimeout(() => {
            sendOtpBtn.disabled = false;
            sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>ارسال مجدد کد';
        }, 60000);
        
        showNotification('کد تایید ارسال شد');
    } catch (error) {
        console.error('Error sending login OTP:', error);
        showNotification('خطا در ارسال کد تایید', 'error');
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>ارسال کد تایید';
    }
}

// Verify OTP for login
function verifyLoginOTP() {
    const otpInput = document.getElementById('loginOtp');
    const enteredOtp = otpInput.value.trim();
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    
    // Get stored OTP
    const storedOTP = Storage.get('pendingLoginOTP');
    
    if (!storedOTP) {
        showNotification('لطفا ابتدا کد تایید را دریافت کنید', 'error');
        return false;
    }
    
    // Check expiry
    if (Date.now() > storedOTP.expiry) {
        showNotification('کد تایید منقضی شده است. لطفا مجددا درخواست کنید', 'error');
        Storage.remove('pendingLoginOTP');
        const otpSection = document.getElementById('loginOtpSection');
        if (otpSection) otpSection.style.display = 'none';
        return false;
    }
    
    // Verify OTP
    if (enteredOtp !== storedOTP.code) {
        if (loginSubmitBtn) {
            loginSubmitBtn.disabled = true;
        }
        showNotification('کد تایید اشتباه است', 'error');
        return false;
    }
    
    // Ensure button exists before enabling
    if (!loginSubmitBtn) {
        return false;
    }
    
    // OTP verified - enable submit button
    loginSubmitBtn.disabled = false;
    return true;
}

// Authentication
function handleLogin(event) {
    event.preventDefault();
    const phone = document.getElementById('loginPhone').value.trim();
    const userType = 'buyer'; // All users are buyers
    const otpInput = document.getElementById('loginOtp');
    
    // Validate OTP
    if (!otpInput || !verifyLoginOTP()) {
        if (otpInput) {
            otpInput.focus();
        }
        return;
    }
    
    // Validate phone number
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
        showNotification('لطفا شماره تماس معتبر وارد کنید', 'error');
        return;
    }
    
    // Check if phone matches OTP phone
    const storedOTP = Storage.get('pendingLoginOTP');
    if (storedOTP && storedOTP.phone !== phone) {
        showNotification('شماره تماس با شماره تایید شده مطابقت ندارد', 'error');
        return;
    }
    
    // Simulate login (in production, verify with backend)
    const email = `${phone}@hotline.local`; // Temporary email for compatibility
    const user = {
        email,
        phone,
        userType,
        name: phone // Use phone as name for now
    };

    Storage.set('currentUser', user);
    Storage.remove('pendingLoginOTP'); // Clear OTP after successful login
    closeLoginModal();
    showNotification('با موفقیت وارد شدید');
    checkAuth();
    
    // Redirect to buyer dashboard (all users are buyers)
    setTimeout(() => {
        window.location.href = '/buyer-dashboard.html';
    }, 1000);
}

// OTP Management
let otpCode = null;
let otpPhone = null;
let otpExpiry = null;

// Send OTP to phone number
async function sendOTP() {
    const phoneInput = document.getElementById('registerPhone');
    const phone = phoneInput.value.trim();
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const otpSection = document.getElementById('otpSection');
    
    // Validate phone number (Iranian format)
    const phoneRegex = /^09\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
        showNotification('لطفا شماره تماس معتبر وارد کنید (مثال: 09123456789)', 'error');
        return;
    }
    
    // Disable button and show loading
    sendOtpBtn.disabled = true;
    sendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>در حال ارسال...';
    
    try {
        // Generate 6-digit OTP
        otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        otpPhone = phone;
        otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        
        // Store OTP in localStorage for verification
        Storage.set('pendingOTP', {
            code: otpCode,
            phone: otpPhone,
            expiry: otpExpiry
        });
        
        // In production, send OTP via SMS service
        // For now, show it in console and alert (for testing)
        console.log('OTP Code:', otpCode);
        alert(`کد تایید: ${otpCode}\n\n(این فقط برای تست است. در نسخه نهایی به شماره شما پیامک ارسال می‌شود)`);
        
        // Show OTP input section
        otpSection.style.display = 'block';
        document.getElementById('registerOtp').focus();
        
        // Enable button after 60 seconds
        setTimeout(() => {
            sendOtpBtn.disabled = false;
            sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>ارسال مجدد کد';
        }, 60000);
        
        showNotification('کد تایید ارسال شد');
    } catch (error) {
        console.error('Error sending OTP:', error);
        showNotification('خطا در ارسال کد تایید', 'error');
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>ارسال کد تایید';
    }
}

// Verify OTP
function verifyOTP() {
    const otpInput = document.getElementById('registerOtp');
    const enteredOtp = otpInput.value.trim();
    const registerSubmitBtn = document.getElementById('registerSubmitBtn');
    
    // Get stored OTP
    const storedOTP = Storage.get('pendingOTP');
    
    if (!storedOTP) {
        showNotification('لطفا ابتدا کد تایید را دریافت کنید', 'error');
        return false;
    }
    
    // Check expiry
    if (Date.now() > storedOTP.expiry) {
        showNotification('کد تایید منقضی شده است. لطفا مجددا درخواست کنید', 'error');
        Storage.remove('pendingOTP');
        otpSection.style.display = 'none';
        return false;
    }
    
    // Verify OTP
    if (enteredOtp !== storedOTP.code) {
        if (registerSubmitBtn) {
            registerSubmitBtn.disabled = true;
        }
        showNotification('کد تایید اشتباه است', 'error');
        return false;
    }
    
    // OTP verified - enable submit button
    if (!registerSubmitBtn) {
        return false;
    }
    registerSubmitBtn.disabled = false;
    return true;
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const userType = 'buyer'; // All users are buyers
    const otpInput = document.getElementById('registerOtp');
    
    // Validate OTP
    if (!otpInput || !verifyOTP()) {
        if (otpInput) {
            otpInput.focus();
        }
        return;
    }
    
    // Validate phone number
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
        showNotification('لطفا شماره تماس معتبر وارد کنید', 'error');
        return;
    }
    
    // Check if phone matches OTP phone
    const storedOTP = Storage.get('pendingOTP');
    if (storedOTP && storedOTP.phone !== phone) {
        showNotification('شماره تماس با شماره تایید شده مطابقت ندارد', 'error');
        return;
    }
    
    // Create user object (email will be generated from phone for compatibility)
    const email = `${phone}@hotline.local`; // Temporary email for backend compatibility
    
    const user = {
        name,
        email,
        phone,
        userType
    };
    
    Storage.set('currentUser', user);
    Storage.remove('pendingOTP'); // Clear OTP after successful registration
    
    closeLoginModal();
    showNotification('ثبت‌نام با موفقیت انجام شد');
    checkAuth();
    
    // Redirect to buyer dashboard (all users are buyers)
    setTimeout(() => {
        window.location.href = '/buyer-dashboard.html';
    }, 1000);
}

// Add event listener for OTP input using event delegation (for dynamically loaded modals)
document.addEventListener('DOMContentLoaded', () => {
    // Use event delegation to handle OTP inputs that are loaded dynamically
    document.addEventListener('input', function(e) {
        // Handle registration OTP
        if (e.target.id === 'registerOtp' && e.target.value.length === 6) {
            verifyOTP();
        }
        // Handle login OTP
        if (e.target.id === 'loginOtp' && e.target.value.length === 6) {
            verifyLoginOTP();
        }
    });
});

function checkAuth() {
    const user = Storage.get('currentUser');
    // Update login button in navbar if it exists
    if (typeof updateLoginButton === 'function') {
        updateLoginButton();
    }
}

// Notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#dc3545' : (type === 'warning' ? '#ffc107' : '#28a745');
    const textColor = type === 'warning' ? '#000' : '#fff';
    const icon = type === 'error' ? '<i class="fas fa-exclamation-circle me-2"></i>' : 
                 type === 'warning' ? '<i class="fas fa-exclamation-triangle me-2"></i>' : 
                 '<i class="fas fa-check-circle me-2"></i>';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: ${textColor};
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideDown 0.3s;
        max-width: 400px;
    `;
    notification.innerHTML = icon + message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, type === 'error' ? 5000 : 3000);
}

// Export functions for use in other pages
window.Storage = Storage;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.updateCartCount = updateCartCount;
window.getCartTotal = getCartTotal;
window.cart = cart;
window.sampleProducts = sampleProducts;
window.formatPrice = formatPrice;
window.filterCategory = filterCategory;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.sendOTP = sendOTP;
window.verifyOTP = verifyOTP;
window.sendLoginOTP = sendLoginOTP;
window.verifyLoginOTP = verifyLoginOTP;
window.showNotification = showNotification;


















