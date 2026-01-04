const API_BASE_URL = 'http://localhost:3000/api';

// Check authentication
const token = localStorage.getItem('adminToken');
const userStr = localStorage.getItem('adminUser');

if (!token || !userStr) {
    window.location.href = '/html/admin-login.html';
}

let user;
try {
    user = JSON.parse(userStr);
} catch (e) {
    window.location.href = '/html/admin-login.html';
    throw e;
}

if (user.role !== 'admin') {
    if (typeof showError === 'function') {
        showError('شما دسترسی به این صفحه ندارید');
    } else {
        alert('شما دسترسی به این صفحه ندارید');
    }
    window.location.href = '/html/admin-login.html';
}

// Display admin name
document.getElementById('adminName').textContent = `خوش آمدید ${user.name}`;

// State management
let allProductsCurrentPage = 1;
let allProductsTotalPages = 1;
let currentEditingProduct = null;

// Load all products
async function loadAllProducts(page = 1) {
    try {
        const search = document.getElementById('searchInput').value.trim();
        const category = document.getElementById('categoryFilter').value;
        const status = document.getElementById('statusFilter').value;
        
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 30);
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (status) params.append('approved', status);
        
        const response = await fetch(`${API_BASE_URL}/products/admin/all?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                if (typeof showError === 'function') {
                    showError('دسترسی شما منقضی شده است. لطفاً دوباره وارد شوید.');
                } else {
                    alert('دسترسی شما منقضی شده است. لطفاً دوباره وارد شوید.');
                }
                logout();
                return;
            }
            throw new Error('خطا در بارگذاری محصولات');
        }
        
        const data = await response.json();
        const products = data.products || [];
        allProductsCurrentPage = data.pagination?.currentPage || 1;
        allProductsTotalPages = data.pagination?.totalPages || 1;
        
        displayAllProducts(products);
        updateAllProductsPagination();
    } catch (error) {
        document.getElementById('allProductsTable').innerHTML = 
            `<tr><td colspan="7" class="text-center text-danger">${error.message}</td></tr>`;
    }
}

function displayAllProducts(products) {
    const tbody = document.getElementById('allProductsTable');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">محصولی یافت نشد</td></tr>';
        return;
    }
    
    const limit = 30;
    const startNumber = (allProductsCurrentPage - 1) * limit + 1;
    
    tbody.innerHTML = products.map((product, index) => `
        <tr>
            <td class="text-center fw-bold">${startNumber + index}</td>
            <td>${product.name}</td>
            <td>${product.supplier || '-'}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.price.toLocaleString('fa-IR')} تومان</td>
            <td>${product.stock || 0}</td>
            <td>
                ${product.approved ? 
                    '<span class="badge bg-success">تایید شده</span>' : 
                    '<span class="badge bg-warning">در انتظار تایید</span>'
                }
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-info btn-view-product" data-product-id="${product._id}" title="مشاهده">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-primary btn-edit-product" data-product-id="${product._id}" title="ویرایش">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-delete-product" data-product-id="${product._id}" data-product-name="${product.name.replace(/'/g, "&#39;")}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${!product.approved ? 
                        `<button class="btn btn-success btn-approve-product" data-product-id="${product._id}" title="تایید">
                            <i class="fas fa-check"></i>
                        </button>` : ''
                    }
                </div>
            </td>
        </tr>
    `).join('');
}

function updateAllProductsPagination() {
    const paginationContainer = document.getElementById('allProductsPagination');
    if (allProductsTotalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<ul class="pagination justify-content-center">';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${allProductsCurrentPage === 1 ? 'disabled' : ''}">
            <a class="page-link pagination-link" href="#" data-page="${allProductsCurrentPage - 1}">
                <span>&laquo;</span>
            </a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= allProductsTotalPages; i++) {
        if (i === 1 || i === allProductsTotalPages || (i >= allProductsCurrentPage - 2 && i <= allProductsCurrentPage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === allProductsCurrentPage ? 'active' : ''}">
                    <a class="page-link pagination-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        } else if (i === allProductsCurrentPage - 3 || i === allProductsCurrentPage + 3) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${allProductsCurrentPage === allProductsTotalPages ? 'disabled' : ''}">
            <a class="page-link pagination-link" href="#" data-page="${allProductsCurrentPage + 1}">
                <span>&raquo;</span>
            </a>
        </li>
    `;
    
    paginationHTML += '</ul>';
    paginationContainer.innerHTML = paginationHTML;
}

// View product details
async function viewProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('خطا در بارگذاری اطلاعات محصول');
        }
        
        const product = await response.json();
        
        // Display product details
        const modalBody = document.getElementById('viewProductModalBody');
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4 mb-3">
                    ${product.image ? 
                        `<img src="${product.image}" class="img-fluid rounded" alt="${product.name}" style="max-height: 300px; object-fit: cover;">` :
                        `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 300px;">
                            <i class="fas fa-image fa-3x text-muted"></i>
                        </div>`
                    }
                </div>
                <div class="col-md-8">
                    <h4>${product.name}</h4>
                    <hr>
                    <div class="mb-3">
                        <strong>قیمت:</strong> 
                        <span class="text-primary fw-bold">${product.price.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div class="mb-3">
                        <strong>تأمین‌کننده:</strong> ${product.supplier || '-'}
                    </div>
                    <div class="mb-3">
                        <strong>دسته‌بندی:</strong> ${getCategoryName(product.category)}
                    </div>
                    <div class="mb-3">
                        <strong>موجودی:</strong> ${product.stock || 0} عدد
                    </div>
                    <div class="mb-3">
                        <strong>حداقل سفارش:</strong> ${product.minOrder || 1} عدد
                    </div>
                    <div class="mb-3">
                        <strong>وضعیت:</strong> 
                        ${product.approved ? 
                            '<span class="badge bg-success">تایید شده</span>' : 
                            '<span class="badge bg-warning">در انتظار تایید</span>'
                        }
                    </div>
                    ${product.description ? `
                        <div class="mb-3">
                            <strong>توضیحات:</strong>
                            <p class="mt-2">${product.description}</p>
                        </div>
                    ` : ''}
                    <div class="mb-3">
                        <strong>تاریخ ایجاد:</strong> ${new Date(product.createdAt).toLocaleDateString('fa-IR')}
                    </div>
                    ${product.updatedAt ? `
                        <div class="mb-3">
                            <strong>آخرین بروزرسانی:</strong> ${new Date(product.updatedAt).toLocaleDateString('fa-IR')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('viewProductModal'));
        modal.show();
    } catch (error) {
        if (typeof showError === 'function') {
            showError('خطا در بارگذاری اطلاعات محصول: ' + error.message);
        } else {
            alert('خطا در بارگذاری اطلاعات محصول: ' + error.message);
        }
    }
}

// Edit product
async function editProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('خطا در بارگذاری اطلاعات محصول');
        }
        
        const product = await response.json();
        currentEditingProduct = product;
        
        // Fill form
        document.getElementById('editProductId').value = product._id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductSupplier').value = product.supplier || '';
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductStock').value = product.stock || 0;
        document.getElementById('editProductMinOrder').value = product.minOrder || 1;
        document.getElementById('editProductImage').value = product.image || '';
        document.getElementById('editProductDescription').value = product.description || '';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    } catch (error) {
        if (typeof showError === 'function') {
            showError('خطا در بارگذاری اطلاعات محصول: ' + error.message);
        } else {
            alert('خطا در بارگذاری اطلاعات محصول: ' + error.message);
        }
    }
}

// Make editProduct globally accessible
window.editProduct = editProduct;

async function saveProductChanges() {
    try {
        const productId = document.getElementById('editProductId').value;
        const productData = {
            name: document.getElementById('editProductName').value,
            supplier: document.getElementById('editProductSupplier').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            category: document.getElementById('editProductCategory').value,
            stock: parseInt(document.getElementById('editProductStock').value),
            minOrder: parseInt(document.getElementById('editProductMinOrder').value) || 1,
            image: document.getElementById('editProductImage').value,
            description: document.getElementById('editProductDescription').value
        };
        
        const response = await fetch(`${API_BASE_URL}/products/admin/update/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'خطا در ویرایش محصول');
        }
        
        if (typeof showSuccess === 'function') {
            showSuccess('محصول با موفقیت ویرایش شد');
        } else {
            alert('محصول با موفقیت ویرایش شد');
        }
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        modal.hide();
        
        // Reload products
        loadAllProducts(allProductsCurrentPage);
    } catch (error) {
        if (typeof showError === 'function') {
            showError('خطا در ویرایش محصول: ' + error.message);
        } else {
            alert('خطا در ویرایش محصول: ' + error.message);
        }
    }
}

// Delete product
async function deleteProduct(productId, productName) {
    if (!confirm(`آیا از حذف محصول "${productName}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/admin/delete/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('خطا در حذف محصول');
        }
        
        if (typeof showSuccess === 'function') {
            showSuccess('محصول با موفقیت حذف شد');
        } else {
            alert('محصول با موفقیت حذف شد');
        }
        loadAllProducts(allProductsCurrentPage);
    } catch (error) {
        if (typeof showError === 'function') {
            showError('خطا در حذف محصول: ' + error.message);
        } else {
            alert('خطا در حذف محصول: ' + error.message);
        }
    }
}

// Load pending products
async function loadPendingProducts() {
    try {
        const apiUrl = `${API_BASE_URL}/products/admin/pending`;
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                if (typeof showError === 'function') {
                    showError('دسترسی شما منقضی شده است. لطفاً دوباره وارد شوید.');
                } else {
                    alert('دسترسی شما منقضی شده است. لطفاً دوباره وارد شوید.');
                }
                logout();
                return;
            }
            throw new Error('خطا در بارگذاری محصولات');
        }
        
        const data = await response.json();
        
        // Handle pagination response
        let products = [];
        if (data.products && Array.isArray(data.products)) {
            products = data.products;
        } else if (Array.isArray(data)) {
            products = data;
        }
        
        displayPendingProducts(products);
    } catch (error) {
        document.getElementById('pendingProducts').innerHTML = 
            `<div class="alert alert-danger">${error.message}</div>`;
    }
}

function displayPendingProducts(products) {
    const productsList = document.getElementById('pendingProducts');
    
    if (products.length === 0) {
        productsList.innerHTML = '<div class="col-12 text-center text-muted">هیچ محصولی در انتظار تایید نیست</div>';
        return;
    }
    
    productsList.innerHTML = products.map((product, index) => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card product-card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title mb-0">${product.name}</h6>
                        <span class="badge bg-secondary">${index + 1}</span>
                    </div>
                    <p class="card-text text-muted small">${product.description || 'بدون توضیحات'}</p>
                    <div class="mb-2">
                        <span class="badge bg-warning pending-badge">
                            <i class="fas fa-clock me-1"></i>در انتظار تایید
                        </span>
                    </div>
                    <div class="mb-2">
                        <span class="text-primary fw-bold">${product.price.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div class="small text-muted mb-3">
                        <div><strong>تامین‌کننده:</strong> ${product.supplier}</div>
                        <div><strong>دسته‌بندی:</strong> ${getCategoryName(product.category)}</div>
                        <div><strong>موجودی:</strong> ${product.stock}</div>
                        <div><strong>حداقل سفارش:</strong> ${product.minOrder}</div>
                        <div><strong>تاریخ:</strong> ${new Date(product.createdAt).toLocaleDateString('fa-IR')}</div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-success btn-sm flex-fill btn-approve-pending" data-product-id="${product._id}">
                            <i class="fas fa-check me-1"></i>تایید
                        </button>
                        <button class="btn btn-danger btn-sm flex-fill btn-reject-pending" data-product-id="${product._id}">
                            <i class="fas fa-times me-1"></i>رد
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

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

async function approveProduct(productId) {
    if (!confirm('آیا از تایید این محصول اطمینان دارید؟')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/admin/approve/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('خطا در تایید محصول');
        }
        
        if (typeof showSuccess === 'function') {
            showSuccess('محصول با موفقیت تایید شد');
        } else {
            alert('محصول با موفقیت تایید شد');
        }
        loadPendingProducts();
        loadAllProducts(allProductsCurrentPage);
    } catch (error) {
        if (typeof showError === 'function') {
            showError(error.message);
        } else {
            alert(error.message);
        }
    }
}

async function rejectProduct(productId) {
    if (!confirm('آیا از رد این محصول اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/admin/reject/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('خطا در رد محصول');
        }
        
        if (typeof showSuccess === 'function') {
            showSuccess('محصول رد شد و حذف گردید');
        } else {
            alert('محصول رد شد و حذف گردید');
        }
        loadPendingProducts();
        loadAllProducts(allProductsCurrentPage);
    } catch (error) {
        if (typeof showError === 'function') {
            showError(error.message);
        } else {
            alert(error.message);
        }
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/html/admin-login.html';
}

// Initialize event listeners when DOM is ready
function initializeEventListeners() {
    // Tab change handler
    const allProductsTab = document.getElementById('all-products-tab');
    if (allProductsTab) {
        allProductsTab.addEventListener('shown.bs.tab', () => {
            loadAllProducts(1);
        });
    }

    const pendingProductsTab = document.getElementById('pending-products-tab');
    if (pendingProductsTab) {
        pendingProductsTab.addEventListener('shown.bs.tab', () => {
            loadPendingProducts();
        });
    }

    // Search input enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadAllProducts(1);
            }
        });
    }

    // Filter change handlers
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            loadAllProducts(1);
        });
    }

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            loadAllProducts(1);
        });
    }

    // Event delegation for product action buttons
    const allProductsTable = document.getElementById('allProductsTable');
    if (allProductsTable) {
        allProductsTable.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            if (target.classList.contains('btn-view-product')) {
                const productId = target.getAttribute('data-product-id');
                if (productId) viewProduct(productId);
            } else if (target.classList.contains('btn-edit-product')) {
                const productId = target.getAttribute('data-product-id');
                if (productId) editProduct(productId);
            } else if (target.classList.contains('btn-delete-product')) {
                const productId = target.getAttribute('data-product-id');
                const productName = target.getAttribute('data-product-name');
                if (productId) deleteProduct(productId, productName);
            } else if (target.classList.contains('btn-approve-product')) {
                const productId = target.getAttribute('data-product-id');
                if (productId) approveProduct(productId);
            }
        });
    }

    // Event delegation for pending products buttons
    const pendingProducts = document.getElementById('pendingProducts');
    if (pendingProducts) {
        pendingProducts.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            if (target.classList.contains('btn-approve-pending')) {
                const productId = target.getAttribute('data-product-id');
                if (productId) approveProduct(productId);
            } else if (target.classList.contains('btn-reject-pending')) {
                const productId = target.getAttribute('data-product-id');
                if (productId) rejectProduct(productId);
            }
        });
    }

    // Save product changes button
    const saveProductChangesBtn = document.getElementById('saveProductChangesBtn');
    if (saveProductChangesBtn) {
        saveProductChangesBtn.addEventListener('click', () => {
            saveProductChanges();
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }

    // Search button
    const searchProductsBtn = document.getElementById('searchProductsBtn');
    if (searchProductsBtn) {
        searchProductsBtn.addEventListener('click', () => {
            loadAllProducts(1);
        });
    }

    // Pagination links
    const allProductsPagination = document.getElementById('allProductsPagination');
    if (allProductsPagination) {
        allProductsPagination.addEventListener('click', (e) => {
            const target = e.target.closest('.pagination-link');
            if (!target) return;
            e.preventDefault();
            const page = parseInt(target.getAttribute('data-page'));
            if (page && !isNaN(page)) {
                loadAllProducts(page);
            }
        });
    }
}

// Make loadAllProducts globally accessible
window.loadAllProducts = loadAllProducts;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
    initializeEventListeners();
}

// Load products on page load
loadAllProducts();

