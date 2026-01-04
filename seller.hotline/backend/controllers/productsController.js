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

// Create product (for suppliers)
exports.createProduct = async (req, res) => {
    try {
        const { name, price, category, stock, description, image, minOrder } = req.body;
        const userId = req.user.userId;

        // Get supplier name from UserSupplier
        const UserSupplier = require('../models/UserSupplier');
        const supplier = await UserSupplier.findById(userId);
        if (!supplier) {
            return res.status(403).json({ error: 'Only suppliers can create products' });
        }

        if (!name || !price || !category || stock === undefined) {
            return res.status(400).json({ error: 'Name, price, category, and stock are required' });
        }

        const product = new Product({
            name,
            supplier: supplier.name,
            price,
            category,
            stock,
            description: description || '',
            image: image || '',
            minOrder: minOrder || 1,
            approved: false, // Products need admin approval
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get supplier's own products
exports.getSupplierProducts = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get supplier name from UserSupplier
        const UserSupplier = require('../models/UserSupplier');
        const supplier = await UserSupplier.findById(userId);
        if (!supplier) {
            return res.status(403).json({ error: 'Only suppliers can access this' });
        }

        const products = await Product.find({ supplier: supplier.name }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update product (for suppliers)
exports.updateProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, price, category, stock, description, image, minOrder } = req.body;

        // Get supplier name from UserSupplier
        const UserSupplier = require('../models/UserSupplier');
        const supplier = await UserSupplier.findById(userId);
        if (!supplier) {
            return res.status(403).json({ error: 'Only suppliers can update products' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if product belongs to this supplier
        if (product.supplier !== supplier.name) {
            return res.status(403).json({ error: 'You can only update your own products' });
        }

        // Update product
        if (name) product.name = name;
        if (price !== undefined) product.price = price;
        if (category) product.category = category;
        if (stock !== undefined) product.stock = stock;
        if (description !== undefined) product.description = description;
        if (image !== undefined) product.image = image;
        if (minOrder !== undefined) product.minOrder = minOrder;
        
        // If product was approved and being updated, reset approval
        if (product.approved) {
            product.approved = false;
        }

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete product (for suppliers)
exports.deleteProduct = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get supplier name from UserSupplier
        const UserSupplier = require('../models/UserSupplier');
        const supplier = await UserSupplier.findById(userId);
        if (!supplier) {
            return res.status(403).json({ error: 'Only suppliers can delete products' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if product belongs to this supplier
        if (product.supplier !== supplier.name) {
            return res.status(403).json({ error: 'You can only delete your own products' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

