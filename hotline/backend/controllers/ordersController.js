const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// Get all orders with pagination
exports.getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        
        // Status filter
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('userId', 'name email phone')
                .populate('items.productId', 'name price image')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments(filter)
        ]);

        res.json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        logger.error('Error getting orders:', error);
        next(error);
    }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('items.productId', 'name price image');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        logger.error('Error getting order by ID:', error);
        next(error);
    }
};

// Get user orders with pagination
exports.getUserOrders = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { userId };
        
        // Status filter
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('items.productId', 'name price image')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments(filter)
        ]);

        res.json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        logger.error('Error getting user orders:', error);
        next(error);
    }
};

// Create order
exports.createOrder = async (req, res, next) => {
    try {
        const { userId, shippingAddress } = req.body;
        
        const cartItems = await CartItem.find({ userId }).populate('productId');
        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Check stock availability
        for (const item of cartItems) {
            if (item.productId.stock < item.quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock for ${item.productId.name}. Available: ${item.productId.stock}, Requested: ${item.quantity}` 
                });
            }
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
        
        // Update product stock
        for (const item of cartItems) {
            await Product.findByIdAndUpdate(
                item.productId._id,
                { $inc: { stock: -item.quantity } }
            );
        }
        
        // Clear cart
        await CartItem.deleteMany({ userId });
        
        await order.populate('items.productId', 'name price image');
        
        logger.info(`Order ${order._id} created by user ${userId}`);
        res.status(201).json(order);
    } catch (error) {
        logger.error('Error creating order:', error);
        next(error);
    }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('items.productId', 'name price image');
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        logger.info(`Order ${id} status updated to ${status}`);
        res.json(order);
    } catch (error) {
        logger.error('Error updating order status:', error);
        next(error);
    }
};

