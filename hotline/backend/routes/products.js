const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const adminAuth = require('../middleware/adminAuth');

// Get all products
router.get('/', productsController.getAllProducts);

// Search products (must come before /:id route)
router.get('/search/:query', productsController.searchProducts);

// Get products by category (must come before /:id route)
router.get('/category/:category', productsController.getProductsByCategory);

// Admin routes
router.get('/admin/pending', adminAuth, productsController.getPendingProducts);
router.put('/admin/approve/:id', adminAuth, productsController.approveProduct);
router.delete('/admin/reject/:id', adminAuth, productsController.rejectProduct);

// Get product by ID (must come last)
router.get('/:id', productsController.getProductById);

module.exports = router;

