const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');
const { validateProduct } = require('../validators/productValidator');

// Get all products
router.get('/', productsController.getAllProducts);

// Create new product (for suppliers - requires authentication)
router.post('/', auth, validateProduct, productsController.createProduct);

// Search products (must come before /:id route)
router.get('/search/:query', productsController.searchProducts);

// Get products by category (must come before /:id route)
router.get('/category/:category', productsController.getProductsByCategory);

// Get popular/best selling products (must come before /:id route)
router.get('/popular', productsController.getPopularProducts);

// Admin routes (must come before /:id route)
router.get('/admin/pending', adminAuth, productsController.getPendingProducts);
router.get('/admin/all', adminAuth, productsController.getAllProductsAdmin);
router.put('/admin/approve/:id', adminAuth, productsController.approveProduct);
router.put('/admin/update/:id', adminAuth, productsController.updateProduct);
router.delete('/admin/reject/:id', adminAuth, productsController.rejectProduct);
router.delete('/admin/delete/:id', adminAuth, productsController.deleteProduct);

// Get product by ID (must come last)
router.get('/:id', productsController.getProductById);

module.exports = router;

