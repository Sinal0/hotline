(function() {
    'use strict';
    
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply theme immediately before body renders to prevent flash
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

