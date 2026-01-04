const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId').populate('items.productId').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('userId').populate('items.productId');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.params.userId;
        const orders = await Order.find({ userId }).populate('items.productId').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create order
exports.createOrder = async (req, res) => {
    try {
        const { userId, shippingAddress } = req.body;
        
        const cartItems = await CartItem.find({ userId }).populate('productId');
        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const items = cartItems.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price,
        }));

        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = new Order({
            userId,
            items,
            totalAmount,
            shippingAddress,
            status: 'pending',
        });

        await order.save();
        await CartItem.deleteMany({ userId });
        
        await order.populate('items.productId');
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('items.productId');
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get supplier orders
exports.getSupplierOrders = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get supplier name from UserSupplier
        const UserSupplier = require('../models/UserSupplier');
        const supplier = await UserSupplier.findById(userId);
        if (!supplier) {
            return res.status(403).json({ error: 'Only suppliers can access this' });
        }

        // Get all orders and filter by supplier's products
        const allOrders = await Order.find()
            .populate('userId')
            .populate('items.productId')
            .sort({ createdAt: -1 });

        // Filter orders that contain products from this supplier
        const supplierOrders = allOrders.filter(order => 
            order.items.some(item => 
                item.productId && item.productId.supplier === supplier.name
            )
        ).map(order => {
            // Filter items to only include supplier's products
            const filteredItems = order.items.filter(item => 
                item.productId && item.productId.supplier === supplier.name
            );
            return {
                ...order.toObject(),
                items: filteredItems,
                totalAmount: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };
        });

        res.json(supplierOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

