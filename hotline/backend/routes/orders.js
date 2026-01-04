const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { validateCreateOrder, validateUpdateOrderStatus } = require('../validators/orderValidator');

// Get all orders
router.get('/', ordersController.getAllOrders);

// Get order by ID
router.get('/:id', ordersController.getOrderById);

// Get user orders
router.get('/user/:userId', ordersController.getUserOrders);

// Create order
router.post('/', validateCreateOrder, ordersController.createOrder);

// Update order status
router.put('/:id/status', validateUpdateOrderStatus, ordersController.updateOrderStatus);

module.exports = router;

