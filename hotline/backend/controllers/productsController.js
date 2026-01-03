const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ approved: true }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Search products
exports.searchProducts = async (req, res) => {
    try {
        const query = req.params.query;
        const products = await Product.find({
            approved: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ],
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const products = await Product.find({
            approved: true,
            category: category,
        }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Get pending products (not approved)
exports.getPendingProducts = async (req, res) => {
    try {
        const products = await Product.find({ approved: false }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Approve product
exports.approveProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Reject product (delete it)
exports.rejectProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product rejected and deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

