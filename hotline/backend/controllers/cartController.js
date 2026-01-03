const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// Get cart items
exports.getCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cartItems = await CartItem.find({ userId }).populate('productId');
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let cartItem = await CartItem.findOne({ userId, productId });
        if (cartItem) {
            cartItem.quantity += quantity || 1;
        } else {
            cartItem = new CartItem({ userId, productId, quantity: quantity || 1 });
        }
        await cartItem.save();
        await cartItem.populate('productId');
        res.json(cartItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const { quantity } = req.body;
        
        const cartItem = await CartItem.findOne({ _id: itemId, userId });
        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        
        cartItem.quantity = quantity;
        await cartItem.save();
        await cartItem.populate('productId');
        res.json(cartItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const cartItem = await CartItem.findOneAndDelete({ _id: itemId, userId });
        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        res.json({ message: 'Cart item removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        await CartItem.deleteMany({ userId });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

