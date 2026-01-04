const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { validateAddToCart, validateUpdateCartItem } = require('../validators/cartValidator');

// Get cart items
router.get('/:userId', cartController.getCart);

// Add item to cart
router.post('/', validateAddToCart, cartController.addToCart);

// Update cart item
router.put('/:userId/:itemId', validateUpdateCartItem, cartController.updateCartItem);

// Remove item from cart
router.delete('/:userId/:itemId', cartController.removeFromCart);

// Clear cart
router.delete('/:userId', cartController.clearCart);

module.exports = router;

