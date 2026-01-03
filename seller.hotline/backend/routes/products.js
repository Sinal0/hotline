const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const auth = require('../middleware/auth');

// Get all products
router.get('/', productsController.getAllProducts);

// Search products (must come before /:id route)
router.get('/search/:query', productsController.searchProducts);

// Get products by category (must come before /:id route)
router.get('/category/:category', productsController.getProductsByCategory);

// Supplier routes (protected)
router.post('/', auth, productsController.createProduct);
router.get('/supplier/my-products', auth, productsController.getSupplierProducts);
router.put('/:id', auth, productsController.updateProduct);
router.delete('/:id', auth, productsController.deleteProduct);

// Get product by ID (must come last)
router.get('/:id', productsController.getProductById);

module.exports = router;

