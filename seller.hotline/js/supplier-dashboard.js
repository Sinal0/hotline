(function() {
    const API_BASE_URL = 'http://localhost:3001/api';

    // Check authentication
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        window.location.href = '/html/login.html';
        return;
    }
    
    let user;
    try {
        user = JSON.parse(userStr);
    } catch (e) {
        console.error('Error parsing user:', e);
        window.location.href = '/html/login.html';
        return;
    }
    
    if (user.role !== 'supplier') {
        if (typeof showError === 'function') {
            showError('شما دسترسی به این صفحه ندارید');
        } else {
            alert('شما دسترسی به این صفحه ندارید');
        }
        window.location.href = '/html/login.html';
        return;
    }

    // Display supplier name
    document.getElementById('supplierName').textContent = `خوش آمدید ${user.name}`;

    // Load products
    async function loadProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products/supplier/my-products`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('خطا در بارگذاری محصولات');
            }
            
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            document.getElementById('productsList').innerHTML = 
                `<div class="alert alert-danger">${error.message}</div>`;
        }
    }

    function displayProducts(products) {
        const productsList = document.getElementById('productsList');
        
        if (products.length === 0) {
            productsList.innerHTML = '<div class="col-12 text-center text-muted">هنوز محصولی اضافه نکرده‌اید</div>';
            return;
        }
        
        productsList.innerHTML = products.map(product => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card product-card h-100">
                    <div class="card-body">
                        <h6 class="card-title">${product.name}</h6>
                        <p class="card-text text-muted small">${product.description || 'بدون توضیحات'}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-${product.approved ? 'success' : 'warning'} status-badge">
                                ${product.approved ? 'تایید شده' : 'در انتظار تایید'}
                            </span>
                            <span class="text-primary fw-bold">${product.price.toLocaleString()} تومان</span>
                        </div>
                        <div class="small text-muted mb-3">
                            <div>دسته‌بندی: ${getCategoryName(product.category)}</div>
                            <div>موجودی: ${product.stock}</div>
                            <div>حداقل سفارش: ${product.minOrder}</div>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-warning flex-fill btn-edit-product" data-product-id="${product._id}">
                                <i class="fas fa-edit me-1"></i>ویرایش
                            </button>
                            <button class="btn btn-sm btn-danger flex-fill btn-delete-product" data-product-id="${product._id}">
                                <i class="fas fa-trash me-1"></i>حذف
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.btn-edit-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                if (productId) editProduct(productId);
            });
        });
        
        document.querySelectorAll('.btn-delete-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                if (productId) deleteProduct(productId);
            });
        });
    }

    // Load orders
    async function loadOrders() {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/supplier/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('خطا در بارگذاری سفارشات');
            }
            
            const orders = await response.json();
            displayOrders(orders);
        } catch (error) {
            document.getElementById('ordersList').innerHTML = 
                `<div class="alert alert-danger">${error.message}</div>`;
        }
    }

    function displayOrders(orders) {
        const ordersList = document.getElementById('ordersList');
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<div class="text-center text-muted">هنوز سفارشی ثبت نشده است</div>';
            return;
        }
        
        ordersList.innerHTML = orders.map(order => `
            <div class="card order-card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h6 class="mb-1">سفارش #${order._id.toString().substring(0, 8)}</h6>
                            <small class="text-muted">تاریخ: ${new Date(order.createdAt).toLocaleDateString('fa-IR')}</small>
                            <div class="mt-2">
                                <strong>مشتری:</strong> ${order.userId ? order.userId.name : 'نامشخص'}
                            </div>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-${getStatusColor(order.status)} status-badge">
                                ${getStatusName(order.status)}
                            </span>
                            <div class="mt-2">
                                <strong class="text-success">${order.totalAmount.toLocaleString()} تومان</strong>
                            </div>
                        </div>
                    </div>
                    <div class="mb-2">
                        <strong>آدرس ارسال:</strong> ${order.shippingAddress}
                    </div>
                    <hr>
                    <h6>محصولات:</h6>
                    <ul class="list-unstyled">
                        ${order.items.map(item => `
                            <li class="mb-2">
                                <div class="d-flex justify-content-between">
                                    <span>${item.productId ? item.productId.name : 'محصول حذف شده'} × ${item.quantity}</span>
                                    <span>${(item.price * item.quantity).toLocaleString()} تومان</span>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
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

    function getStatusName(status) {
        const statuses = {
            'pending': 'در انتظار',
            'processing': 'در حال پردازش',
            'shipped': 'ارسال شده',
            'delivered': 'تحویل داده شده',
            'cancelled': 'لغو شده',
        };
        return statuses[status] || status;
    }

    function getStatusColor(status) {
        const colors = {
            'pending': 'warning',
            'processing': 'info',
            'shipped': 'primary',
            'delivered': 'success',
            'cancelled': 'danger',
        };
        return colors[status] || 'secondary';
    }

    // Add product form
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formMessage = document.getElementById('formMessage');
        formMessage.classList.add('d-none');
        
        const productData = {
            name: document.getElementById('productName').value,
            price: parseInt(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            stock: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value,
            minOrder: parseInt(document.getElementById('productMinOrder').value) || 1,
        };
        
        try {
            const authHeader = `Bearer ${token}`;
            
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader,
                },
                body: JSON.stringify(productData),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'خطا در افزودن محصول');
            }
            
            formMessage.textContent = 'محصول با موفقیت اضافه شد. منتظر تایید اپراتور باشید.';
            formMessage.classList.remove('d-none', 'alert-danger');
            formMessage.classList.add('alert-success');
            
            // Reset form
            document.getElementById('addProductForm').reset();
            
            // Reload products
            loadProducts();
        } catch (error) {
            formMessage.textContent = error.message;
            formMessage.classList.remove('d-none', 'alert-success');
            formMessage.classList.add('alert-danger');
        }
    });

    // Edit product
    async function editProduct(productId) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('خطا در بارگذاری محصول');
            }
            
            const product = await response.json();
            
            document.getElementById('editProductId').value = product._id;
            document.getElementById('editProductName').value = product.name;
            document.getElementById('editProductPrice').value = product.price;
            document.getElementById('editProductCategory').value = product.category;
            document.getElementById('editProductStock').value = product.stock;
            document.getElementById('editProductDescription').value = product.description || '';
            document.getElementById('editProductImage').value = product.image || '';
            document.getElementById('editProductMinOrder').value = product.minOrder || 1;
            
            const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
            editModal.show();
        } catch (error) {
            if (typeof showError === 'function') {
                showError(error.message);
            } else {
                alert(error.message);
            }
        }
    }

    // Make editProduct globally accessible
    window.editProduct = editProduct;

    // Save product edit
    async function saveProductEdit() {
        const productId = document.getElementById('editProductId').value;
        const editFormMessage = document.getElementById('editFormMessage');
        editFormMessage.classList.add('d-none');
        
        const productData = {
            name: document.getElementById('editProductName').value,
            price: parseInt(document.getElementById('editProductPrice').value),
            category: document.getElementById('editProductCategory').value,
            stock: parseInt(document.getElementById('editProductStock').value),
            description: document.getElementById('editProductDescription').value,
            image: document.getElementById('editProductImage').value,
            minOrder: parseInt(document.getElementById('editProductMinOrder').value) || 1,
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(productData),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'خطا در ویرایش محصول');
            }
            
            editFormMessage.textContent = 'محصول با موفقیت ویرایش شد. منتظر تایید مجدد اپراتور باشید.';
            editFormMessage.classList.remove('d-none', 'alert-danger');
            editFormMessage.classList.add('alert-success');
            
            setTimeout(() => {
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
                editModal.hide();
                loadProducts();
            }, 1500);
        } catch (error) {
            editFormMessage.textContent = error.message;
            editFormMessage.classList.remove('d-none', 'alert-success');
            editFormMessage.classList.add('alert-danger');
        }
    }

    // Make saveProductEdit globally accessible
    window.saveProductEdit = saveProductEdit;

    // Delete product
    async function deleteProduct(productId) {
        if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'خطا در حذف محصول');
            }
            
            if (typeof showSuccess === 'function') {
                showSuccess('محصول با موفقیت حذف شد');
            } else {
                alert('محصول با موفقیت حذف شد');
            }
            loadProducts();
        } catch (error) {
            if (typeof showError === 'function') {
                showError(error.message);
            } else {
                alert(error.message);
            }
        }
    }

    // Make deleteProduct globally accessible
    window.deleteProduct = deleteProduct;

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/html/login.html';
    }

    // Make logout globally accessible
    window.logout = logout;

    // Initialize event listeners
    function initializeEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        // Save product edit button
        const saveProductEditBtn = document.getElementById('saveProductEditBtn');
        if (saveProductEditBtn) {
            saveProductEditBtn.addEventListener('click', saveProductEdit);
        }

        // Load data when tab is shown
        const manageProductsTab = document.getElementById('manage-products-tab');
        if (manageProductsTab) {
            manageProductsTab.addEventListener('shown.bs.tab', function () {
                loadProducts();
            });
        }

        const salesTab = document.getElementById('sales-tab');
        if (salesTab) {
            salesTab.addEventListener('shown.bs.tab', function () {
                loadOrders();
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEventListeners);
    } else {
        initializeEventListeners();
    }

    // Load products on page load if on manage products tab
    const activeTab = document.querySelector('#dashboardTabs button.active');
    if (activeTab && activeTab.id === 'manage-products-tab') {
        loadProducts();
    }
})(); // End IIFE

