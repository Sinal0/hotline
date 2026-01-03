const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Get cart items
router.get('/:userId', cartController.getCart);

// Add item to cart
router.post('/', cartController.addToCart);

// Update cart item
router.put('/:userId/:itemId', cartController.updateCartItem);

// Remove item from cart
router.delete('/:userId/:itemId', cartController.removeFromCart);

// Clear cart
router.delete('/:userId', cartController.clearCart);

module.exports = router;

