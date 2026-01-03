const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const auth = require('../middleware/auth');

// Get all orders
router.get('/', ordersController.getAllOrders);

// Supplier routes (protected)
router.get('/supplier/my-orders', auth, ordersController.getSupplierOrders);

// Get order by ID
router.get('/:id', ordersController.getOrderById);

// Get user orders
router.get('/user/:userId', ordersController.getUserOrders);

// Create order
router.post('/', ordersController.createOrder);

// Update order status
router.put('/:id/status', ordersController.updateOrderStatus);

module.exports = router;

