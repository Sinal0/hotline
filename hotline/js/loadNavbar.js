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

async function loadProductsForSearch() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (response.ok) {
            allProductsForSearch = await response.json();
        }
    } catch (error) {
        console.error('Error loading products for search:', error);
        allProductsForSearch = [];
    }
}

function showSearchResults(results) {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) return;
    
    if (results.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = results.slice(0, 10).map(product => `
        <a href="/products.html?id=${product._id}" class="search-result-item d-block p-3 text-decoration-none border-bottom">
            <div class="d-flex align-items-center gap-3">
                <div class="flex-grow-1">
                    <div class="fw-bold">${product.name}</div>
                    <small class="text-muted">${product.category}</small>
                </div>
                <div class="text-primary">${product.price.toLocaleString()} تومان</div>
            </div>
        </a>
    `).join('');
    
    dropdown.style.display = 'block';
}

function setupSearchBar() {
    const searchInput = document.getElementById('navbarSearchInput');
    const searchForm = document.getElementById('searchForm');
    
    if (!searchInput || !searchForm) return;
    
    // Load products for search
    loadProductsForSearch();
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        if (query.length < 2) {
            const dropdown = document.getElementById('searchResultsDropdown');
            if (dropdown) dropdown.style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            const results = allProductsForSearch.filter(product =>
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            );
            showSearchResults(results);
        }, 300);
    });
    
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
        }
    });
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

