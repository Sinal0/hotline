const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// Get cart items
exports.getCart = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const cartItems = await CartItem.find({ userId }).populate('productId', 'name price image stock approved');
        res.json(cartItems);
    } catch (error) {
        logger.error('Error getting cart:', error);
        next(error);
    }
};

// Add item to cart
exports.addToCart = async (req, res, next) => {
    try {
        const { userId, productId, quantity } = req.body;
        const qty = quantity || 1;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (!product.approved) {
            return res.status(400).json({ error: 'Product is not approved yet' });
        }

        // Check stock
        let cartItem = await CartItem.findOne({ userId, productId });
        const requestedQuantity = cartItem ? cartItem.quantity + qty : qty;
        
        if (product.stock < requestedQuantity) {
            return res.status(400).json({ 
                error: `Insufficient stock. Available: ${product.stock}, Requested: ${requestedQuantity}` 
            });
        }

        if (cartItem) {
            cartItem.quantity += qty;
        } else {
            cartItem = new CartItem({ userId, productId, quantity: qty });
        }
        await cartItem.save();
        await cartItem.populate('productId', 'name price image stock');
        res.json(cartItem);
    } catch (error) {
        logger.error('Error adding to cart:', error);
        next(error);
    }
};

// Update cart item
exports.updateCartItem = async (req, res, next) => {
    try {
        const { userId, itemId } = req.params;
        const { quantity } = req.body;
        
        const cartItem = await CartItem.findOne({ _id: itemId, userId }).populate('productId');
        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        // Check stock
        if (cartItem.productId.stock < quantity) {
            return res.status(400).json({ 
                error: `Insufficient stock. Available: ${cartItem.productId.stock}, Requested: ${quantity}` 
            });
        }
        
        cartItem.quantity = quantity;
        await cartItem.save();
        await cartItem.populate('productId', 'name price image stock');
        res.json(cartItem);
    } catch (error) {
        logger.error('Error updating cart item:', error);
        next(error);
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
    try {
        const { userId, itemId } = req.params;
        const cartItem = await CartItem.findOneAndDelete({ _id: itemId, userId });
        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        res.json({ message: 'Cart item removed' });
    } catch (error) {
        logger.error('Error removing from cart:', error);
        next(error);
    }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        await CartItem.deleteMany({ userId });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        logger.error('Error clearing cart:', error);
        next(error);
    }
};

