let allProducts = [];
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
    checkAuth();
    
    // Check for category filter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const sortFilter = document.getElementById('sortFilter');
    
    if (category && categoryFilter) {
        categoryFilter.value = category;
    }
    if (search && searchInput) {
        searchInput.value = search;
    }
    
    // Add event listeners
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            filterProducts();
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            filterProducts();
        });
    }
    
    // Login form event listener
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof handleLogin === 'function') {
                handleLogin(e);
            }
        });
    }
    
    // Register form event listener
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof handleRegister === 'function') {
                handleRegister(e);
            }
        });
    }
    
    loadProducts();
});

// Make loadProducts available globally
window.loadProducts = async function(page = 1) {
    if (isLoading) return;
    
    isLoading = true;
    const container = document.getElementById('productsGrid');
    if (page === 1) {
        container.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">در حال بارگذاری...</span></div></div>';
    }
    
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const category = document.getElementById('categoryFilter')?.value || urlParams.get('category') || '';
        const search = document.getElementById('searchInput')?.value.trim() || urlParams.get('search') || '';
        
        let apiUrl = 'http://localhost:3000/api/products';
        const params = new URLSearchParams();
        
        if (category) {
            params.append('category', category);
        }
        if (search) {
            params.append('search', search);
        }
        const sort = document.getElementById('sortFilter')?.value || 'newest';
        if (sort) {
            params.append('sort', sort);
        }
        params.append('page', page);
        params.append('limit', 12);
        
        if (params.toString()) {
            apiUrl += '?' + params.toString();
        }
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('خطا در بارگذاری محصولات');
        }
        
        const data = await response.json();
        
        // Handle pagination response
        if (data.products && Array.isArray(data.products)) {
            allProducts = data.products;
            currentPage = data.pagination?.currentPage || 1;
            totalPages = data.pagination?.totalPages || 1;
        } else if (Array.isArray(data)) {
            allProducts = data;
            currentPage = 1;
            totalPages = 1;
        } else {
            allProducts = [];
        }
        
        displayProducts(allProducts);
        updatePagination();
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    خطا در بارگذاری محصولات. لطفا دوباره تلاش کنید.
                </div>
            </div>
        `;
    } finally {
        isLoading = false;
    }
};

// Also keep local reference
const loadProducts = window.loadProducts;

function displayProducts(products) {
    const container = document.getElementById('productsGrid');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-body text-center py-5">
                        <i class="fas fa-box-open text-muted mb-3" style="font-size: 4rem;"></i>
                        <h3>محصولی یافت نشد</h3>
                        <p class="text-muted">لطفا فیلترهای جستجو را تغییر دهید</p>
                    </div>
                </div>
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
                        ${product.stock !== undefined ? `<p class="text-muted small mb-2"><i class="fas fa-box me-1"></i>موجودی: ${product.stock}</p>` : ''}
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary btn-sm flex-fill add-to-cart-btn" 
                                    data-product='${JSON.stringify(productForCart)}'>
                                <i class="fas fa-cart-plus"></i> افزودن
                            </button>
                            <a href="/html/product-details.html?id=${productId}" class="btn btn-outline-primary btn-sm">مشاهده</a>
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
                    if (typeof showError === 'function') {
                        showError('خطا: اطلاعات محصول یافت نشد');
                    } else {
                        alert('خطا: اطلاعات محصول یافت نشد');
                    }
                    return;
                }
                const product = JSON.parse(productData);
                console.log('Add to cart button clicked, product:', product);
                if (typeof addToCart === 'function') {
                    addToCart(product);
                } else {
                    console.error('addToCart function not found');
                    if (typeof showError === 'function') {
                        showError('خطا: تابع افزودن به سبد خرید یافت نشد');
                    } else {
                        alert('خطا: تابع افزودن به سبد خرید یافت نشد');
                    }
                }
            } catch (error) {
                console.error('Error parsing product data:', error);
                if (typeof showError === 'function') {
                    showError('خطا در افزودن محصول به سبد خرید: ' + error.message);
                } else {
                    alert('خطا در افزودن محصول به سبد خرید: ' + error.message);
                }
            }
        });
    });
}

function filterProducts() {
    // Reset to first page when filtering
    currentPage = 1;
    // Update URL without reload
    const urlParams = new URLSearchParams();
    const categoryElement = document.getElementById('categoryFilter');
    const searchElement = document.getElementById('searchInput');
    const sortElement = document.getElementById('sortFilter');
    
    const category = categoryElement?.value || '';
    const search = searchElement?.value.trim() || '';
    const sort = sortElement?.value || 'newest';
    
    if (category) {
        urlParams.set('category', category);
    }
    if (search) {
        urlParams.set('search', search);
    }
    if (sort && sort !== 'newest') {
        urlParams.set('sort', sort);
    }
    
    const newUrl = urlParams.toString() ? `/products.html?${urlParams.toString()}` : '/products.html';
    window.history.pushState({}, '', newUrl);
    
    // Reload products with new filters
    loadProducts(1);
}

// Make filterProducts available globally
window.filterProducts = filterProducts;

// Debounce search input
let productSearchTimeout = null;
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    if (productSearchTimeout) {
        clearTimeout(productSearchTimeout);
    }
    productSearchTimeout = setTimeout(() => {
        filterProducts();
    }, 500);
});

function updatePagination() {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (totalPages <= 1) {
        // Remove existing pagination if any
        const existingPagination = document.getElementById('paginationContainer');
        if (existingPagination) {
            existingPagination.remove();
        }
        return;
    }
    
    // Remove existing pagination
    const existingPagination = document.getElementById('paginationContainer');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'col-12 mt-4';
    paginationContainer.id = 'paginationContainer';
    
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'صفحه‌بندی محصولات');
    
    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.setAttribute('aria-label', 'قبلی');
    prevLink.innerHTML = '<span aria-hidden="true">&laquo;</span>';
    if (currentPage > 1) {
        prevLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadProducts(currentPage - 1);
        });
    }
    prevLi.appendChild(prevLink);
    ul.appendChild(prevLi);
    
    // Page numbers
    for (let page = 1; page <= totalPages; page++) {
        const li = document.createElement('li');
        li.className = `page-item ${page === currentPage ? 'active' : ''}`;
        const link = document.createElement('a');
        link.className = 'page-link';
        link.href = '#';
        link.textContent = page;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadProducts(page);
        });
        li.appendChild(link);
        ul.appendChild(li);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.setAttribute('aria-label', 'بعدی');
    nextLink.innerHTML = '<span aria-hidden="true">&raquo;</span>';
    if (currentPage < totalPages) {
        nextLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadProducts(currentPage + 1);
        });
    }
    nextLi.appendChild(nextLink);
    ul.appendChild(nextLi);
    
    nav.appendChild(ul);
    paginationContainer.appendChild(nav);
    
    // Insert after products grid
    container.insertAdjacentElement('afterend', paginationContainer);
}

// Update modal functions for Bootstrap
function openLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

function closeLoginModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (modal) modal.hide();
}

function switchTab(tab) {
    if (tab === 'login') {
        const loginTab = new bootstrap.Tab(document.getElementById('login-tab'));
        loginTab.show();
    } else {
        const registerTab = new bootstrap.Tab(document.getElementById('register-tab'));
        registerTab.show();
    }
}

