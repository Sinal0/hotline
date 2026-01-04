// Load navbar HTML into the page
async function loadNavbar() {
    const navbarPath = '/html/navbar.html';
    try {
        const response = await fetch(navbarPath);
        const html = await response.text();
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.innerHTML = html;
            
            // Initialize navbar functionalities
            setupNavbarScroll();
            setupThemeToggle();
            setupSearchBar();
            updateLoginButton();
            setActiveNavItem();
            
            // Update cart count after navbar is loaded
            // Use setTimeout to ensure DOM is fully updated
            setTimeout(() => {
                if (typeof updateCartCount === 'function') {
                    updateCartCount();
                } else if (typeof window.updateCartCount === 'function') {
                    window.updateCartCount();
                }
            }, 50);
        }
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

// Setup scroll-based navbar hide/show for second row only (menu)
function setupNavbarScroll() {
    let lastScrollTop = 0;
    let scrollTimeout = null;
    let rafId = null;
    let toggleCooldown = false;
    const navbarSecondRow = document.getElementById('navbar-second-row');
    
    if (!navbarSecondRow) return;
    
    // Initialize second row as visible
    navbarSecondRow.classList.add('navbar-row-show');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollingDown = scrollTop > lastScrollTop;
        const scrollingUp = scrollTop < lastScrollTop;
        const shouldHide = scrollingUp && scrollTop > 100;
        const shouldShow = scrollingDown;
        const currentHasHide = navbarSecondRow.classList.contains('navbar-row-hide');
        
        // Skip if in cooldown period
        if (toggleCooldown) {
            return;
        }
        
        // Show navbar immediately when scrolling down (no debounce)
        if (shouldShow && currentHasHide) {
            toggleCooldown = true;
            setTimeout(() => {
                toggleCooldown = false;
                lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            }, 175);
            
            // Cancel any pending hide operations
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
                scrollTimeout = null;
            }
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            
            navbarSecondRow.classList.remove('navbar-row-hide');
            navbarSecondRow.classList.add('navbar-row-show');
            return;
        }
        
        // Cancel previous timeout
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        // Cancel previous RAF
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        
        // Debounce scroll handling for hiding only
        scrollTimeout = setTimeout(() => {
            rafId = requestAnimationFrame(() => {
                const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollDelta = Math.abs(currentScrollTop - lastScrollTop);
                
                // Only process if scroll delta is significant (prevents micro-movements)
                if (scrollDelta < 10) {
                    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
                    scrollTimeout = null;
                    rafId = null;
                    return;
                }
                
                const stillScrollingUp = currentScrollTop < lastScrollTop;
                const stillShouldHide = stillScrollingUp && currentScrollTop > 100;
                const stillHasHide = navbarSecondRow.classList.contains('navbar-row-hide');
                
                if (stillShouldHide && !stillHasHide) {
                    toggleCooldown = true;
                    setTimeout(() => {
                        toggleCooldown = false;
                        lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    }, 175);
                    
                    navbarSecondRow.classList.add('navbar-row-hide');
                    navbarSecondRow.classList.remove('navbar-row-show');
                } else {
                    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
                }
                
                scrollTimeout = null;
                rafId = null;
            });
        }, 16); // ~1 frame debounce (16ms)
    }, { passive: true });
}

// Setup theme toggle functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    if (!themeToggle || !themeIcon) return;
    
    // Apply saved theme or system preference
    applyTheme();
    
    themeToggle.addEventListener('click', toggleTheme);
}

function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Setup search functionality
let allProductsForSearch = [];
let searchTimeout = null;
let currentSearchRequest = null;
let selectedResultIndex = -1;

// Load products for initial search (fallback)
async function loadProductsForSearch() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (response.ok) {
            const data = await response.json();
            // Handle pagination response or direct array
            if (Array.isArray(data)) {
                allProductsForSearch = data;
            } else if (data.products && Array.isArray(data.products)) {
                allProductsForSearch = data.products;
            } else if (data.data && Array.isArray(data.data)) {
                allProductsForSearch = data.data;
            } else {
                allProductsForSearch = [];
            }
        }
    } catch (error) {
        console.error('Error loading products for search:', error);
        allProductsForSearch = [];
    }
}

// Live search using API
async function performLiveSearch(query) {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) return;
    
    // Show loading state
    dropdown.innerHTML = `
        <div class="p-3 text-center">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">در حال جستجو...</span>
            </div>
            <div class="mt-2 text-muted small">در حال جستجو...</div>
        </div>
    `;
    dropdown.style.display = 'block';
    
    try {
        // Cancel previous request if exists
        if (currentSearchRequest) {
            currentSearchRequest.abort();
        }
        
        // Create new abort controller
        const abortController = new AbortController();
        currentSearchRequest = abortController;
        
        // Search using API
        const response = await fetch(`http://localhost:3000/api/products/search/${encodeURIComponent(query)}`, {
            signal: abortController.signal
        });
        
        if (response.ok) {
            const data = await response.json();
            // Handle pagination response or direct array
            let results = [];
            if (Array.isArray(data)) {
                results = data;
            } else if (data.products && Array.isArray(data.products)) {
                results = data.products;
            } else if (data.data && Array.isArray(data.data)) {
                results = data.data;
            }
            showSearchResults(results, query);
        } else {
            // Fallback to local search
            const results = allProductsForSearch.filter(product =>
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            );
            showSearchResults(results, query);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            return; // Request was cancelled
        }
        console.error('Error performing live search:', error);
        // Fallback to local search
        const results = allProductsForSearch.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
        showSearchResults(results, query);
    } finally {
        currentSearchRequest = null;
    }
}

function showSearchResults(results, query = '') {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) return;
    
    if (results.length === 0) {
        dropdown.innerHTML = `
            <div class="p-3 text-center text-muted">
                <i class="fas fa-search mb-2"></i>
                <div>نتیجه‌ای یافت نشد</div>
                <small>برای "${query}"</small>
            </div>
        `;
        dropdown.style.display = 'block';
        return;
    }
    
    // Category names in Persian
    const categoryNames = {
        'electronics': 'الکترونیک',
        'clothing': 'پوشاک',
        'food': 'مواد غذایی',
        'home': 'خانه و آشپزخانه',
        'beauty': 'زیبایی و سلامت',
        'sports': 'ورزش و سرگرمی'
    };
    
    dropdown.innerHTML = results.slice(0, 10).map((product, index) => {
        const categoryName = categoryNames[product.category] || product.category;
        const highlightedName = highlightMatch(product.name, query);
        return `
            <a href="/products.html?id=${product._id}" 
               class="search-result-item d-block p-3 text-decoration-none border-bottom ${index === selectedResultIndex ? 'bg-light' : ''}" 
               data-index="${index}"
               onmouseenter="selectedResultIndex = ${index}; updateSelectedResult()"
               onclick="document.getElementById('searchResultsDropdown').style.display = 'none';">
                <div class="d-flex align-items-center gap-3">
                    <div class="flex-grow-1">
                        <div class="fw-bold">${highlightedName}</div>
                        <small class="text-muted">
                            <i class="fas fa-tag me-1"></i>${categoryName}
                            ${product.supplier ? `<span class="me-2">•</span><i class="fas fa-store me-1"></i>${product.supplier}` : ''}
                        </small>
                    </div>
                    <div class="text-primary fw-bold">${product.price.toLocaleString('fa-IR')} تومان</div>
                </div>
            </a>
        `;
    }).join('');
    
    // Add "View all results" link if more than 10 results
    if (results.length > 10) {
        dropdown.innerHTML += `
            <div class="p-2 border-top bg-light text-center">
                <a href="/products.html?search=${encodeURIComponent(query)}" 
                   class="text-decoration-none text-primary fw-bold"
                   onclick="document.getElementById('searchResultsDropdown').style.display = 'none';">
                    مشاهده همه نتایج (${results.length})
                </a>
            </div>
        `;
    }
    
    dropdown.style.display = 'block';
    selectedResultIndex = -1;
}

// Highlight matching text
function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Update selected result styling
function updateSelectedResult() {
    const items = document.querySelectorAll('.search-result-item');
    items.forEach((item, index) => {
        if (index === selectedResultIndex) {
            item.classList.add('bg-light');
        } else {
            item.classList.remove('bg-light');
        }
    });
}

function setupSearchBar() {
    const searchInput = document.getElementById('navbarSearchInput');
    const searchForm = document.getElementById('searchForm');
    
    if (!searchInput || !searchForm) return;
    
    // Load products for fallback search
    loadProductsForSearch();
    
    // Live search on input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        if (query.length < 2) {
            const dropdown = document.getElementById('searchResultsDropdown');
            if (dropdown) dropdown.style.display = 'none';
            selectedResultIndex = -1;
            return;
        }
        
        // Debounce search
        searchTimeout = setTimeout(() => {
            performLiveSearch(query);
        }, 300);
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        const dropdown = document.getElementById('searchResultsDropdown');
        if (!dropdown || dropdown.style.display === 'none') return;
        
        const items = document.querySelectorAll('.search-result-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedResultIndex = Math.min(selectedResultIndex + 1, items.length - 1);
            updateSelectedResult();
            items[selectedResultIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedResultIndex = Math.max(selectedResultIndex - 1, -1);
            updateSelectedResult();
        } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
            e.preventDefault();
            const selectedItem = items[selectedResultIndex];
            if (selectedItem) {
                window.location.href = selectedItem.href;
            }
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
            selectedResultIndex = -1;
        }
    });
    
    // Form submit
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `/products.html?search=${encodeURIComponent(query)}`;
        }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('searchResultsDropdown');
        if (dropdown && !searchForm.contains(e.target)) {
            dropdown.style.display = 'none';
            selectedResultIndex = -1;
        }
    });
    
    // Focus on input when clicking search area
    searchInput.addEventListener('focus', () => {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            const dropdown = document.getElementById('searchResultsDropdown');
            if (!dropdown || dropdown.style.display === 'none') {
                performLiveSearch(query);
            }
        }
    });
    
    // Clear search on blur (with delay to allow clicking results)
    let blurTimeout = null;
    searchInput.addEventListener('blur', () => {
        blurTimeout = setTimeout(() => {
            const dropdown = document.getElementById('searchResultsDropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
                selectedResultIndex = -1;
            }
        }, 200);
    });
    
    // Cancel blur timeout if clicking on dropdown
    const dropdown = document.getElementById('searchResultsDropdown');
    if (dropdown) {
        dropdown.addEventListener('mousedown', (e) => {
            if (blurTimeout) {
                clearTimeout(blurTimeout);
                blurTimeout = null;
            }
        });
    }
}

// Update login button based on authentication status
function updateLoginButton() {
    const loginButton = document.querySelector('#navbar-container #loginRegisterBtn');
    if (!loginButton) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (currentUser) {
        loginButton.textContent = 'حساب کاربری';
        loginButton.href = '/buyer-dashboard.html';
    } else {
        loginButton.textContent = 'ورود / ثبت‌نام';
        loginButton.href = '/login.html';
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    updateLoginButton();
    window.location.href = '/index.html';
}

// Export handleLogout to window for global access
window.handleLogout = handleLogout;

// Set active nav item based on current page
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('#navbar-container .nav-link[data-nav]');
    
    navLinks.forEach(link => {
        const navValue = link.getAttribute('data-nav');
        link.classList.remove('active');
        
        if (currentPath.includes(`${navValue}.html`) || 
            (navValue === 'products' && currentPath.includes('products')) ||
            (navValue === 'suppliers' && currentPath.includes('suppliers')) ||
            (navValue === 'about' && currentPath.includes('about'))) {
            link.classList.add('active');
        }
    });
}

// Export functions to window for global access
window.updateLoginButton = updateLoginButton;

// Load navbar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
    loadNavbar();
}

