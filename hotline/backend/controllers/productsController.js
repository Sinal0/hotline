const Product = require('../models/Product');
const logger = require('../utils/logger');

// Get all products with pagination
exports.getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const filter = { approved: true };
        
        // Category filter
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Search filter
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Sort options
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (req.query.sort) {
            switch(req.query.sort) {
                case 'price-low':
                    sortOption = { price: 1 };
                    break;
                case 'price-high':
                    sortOption = { price: -1 };
                    break;
                case 'name':
                    sortOption = { name: 1 };
                    break;
                case 'newest':
                default:
                    sortOption = { createdAt: -1 };
                    break;
            }
        }

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter)
        ]);

        res.json({
            products,
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
        logger.error('Error getting products:', error);
        next(error);
    }
};

// Create new product (for suppliers)
exports.createProduct = async (req, res, next) => {
    try {
        const { name, price, category, stock, description, image, minOrder } = req.body;
        const User = require('../models/User');
        
        // Get user info from token
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }
        
        // Check if user is supplier
        if (user.role !== 'supplier') {
            return res.status(403).json({ error: 'فقط تأمین‌کنندگان می‌توانند محصول اضافه کنند' });
        }
        
        // Use user's name as supplier
        const supplier = user.name || user.firstName + ' ' + user.lastName;
        
        // Validation
        if (!name || !price || !category || stock === undefined) {
            return res.status(400).json({ error: 'نام، قیمت، دسته‌بندی و موجودی الزامی است' });
        }
        
        const product = new Product({
            name,
            supplier,
            price: parseFloat(price),
            category,
            stock: parseInt(stock),
            description: description || '',
            image: image || '',
            minOrder: minOrder ? parseInt(minOrder) : 1,
            approved: false, // Products need admin approval
        });
        
        await product.save();
        
        logger.info(`New product created: ${product._id} by supplier: ${supplier} (userId: ${user._id})`);
        res.status(201).json({
            message: 'محصول با موفقیت ایجاد شد و در انتظار تایید ادمین است',
            product
        });
    } catch (error) {
        logger.error('Error creating product:', error);
        next(error);
    }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        logger.error('Error getting product by ID:', error);
        next(error);
    }
};

// Search products with pagination
exports.searchProducts = async (req, res, next) => {
    try {
        const query = req.params.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const filter = {
            approved: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ],
        };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter)
        ]);

        res.json({
            products,
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
        logger.error('Error searching products:', error);
        next(error);
    }
};

// Get products by category with pagination
exports.getProductsByCategory = async (req, res, next) => {
    try {
        const category = req.params.category;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const filter = {
            approved: true,
            category: category,
        };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter)
        ]);

        res.json({
            products,
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
        logger.error('Error getting products by category:', error);
        next(error);
    }
};

// Admin: Get pending products (not approved) with pagination
exports.getPendingProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find({ approved: false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Product.countDocuments({ approved: false })
        ]);

        const response = {
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };

        res.json(response);
    } catch (error) {
        logger.error('Error getting pending products:', error);
        next(error);
    }
};

// Admin: Get all products (approved and pending) with filters
exports.getAllProductsAdmin = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const search = req.query.search;
        const approved = req.query.approved; // 'true', 'false', or undefined for all

        const filter = {};
        
        if (category) {
            filter.category = category;
        }
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { supplier: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (approved !== undefined) {
            filter.approved = approved === 'true';
        }

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter)
        ]);

        res.json({
            products,
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
        logger.error('Error getting all products for admin:', error);
        next(error);
    }
};

// Admin: Update product
exports.updateProduct = async (req, res, next) => {
    try {
        const { name, price, category, stock, description, image, minOrder, supplier } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'محصول یافت نشد' });
        }
        
        // Update fields
        if (name) product.name = name;
        if (price !== undefined) product.price = price;
        if (category) product.category = category;
        if (stock !== undefined) product.stock = stock;
        if (description !== undefined) product.description = description;
        if (image !== undefined) product.image = image;
        if (minOrder !== undefined) product.minOrder = minOrder;
        if (supplier) product.supplier = supplier;
        
        await product.save();
        
        logger.info(`Product ${product._id} updated by admin`);
        res.json(product);
    } catch (error) {
        logger.error('Error updating product:', error);
        next(error);
    }
};

// Admin: Delete product
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'محصول یافت نشد' });
        }
        
        logger.info(`Product ${req.params.id} deleted by admin`);
        res.json({ message: 'محصول با موفقیت حذف شد' });
    } catch (error) {
        logger.error('Error deleting product:', error);
        next(error);
    }
};

// Admin: Approve product
exports.approveProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        logger.info(`Product ${product._id} approved by admin`);
        res.json(product);
    } catch (error) {
        logger.error('Error approving product:', error);
        next(error);
    }
};

// Admin: Reject product (delete it)
exports.rejectProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        logger.info(`Product ${req.params.id} rejected and deleted by admin`);
        res.json({ message: 'Product rejected and deleted' });
    } catch (error) {
        logger.error('Error rejecting product:', error);
        next(error);
    }
};

// Get popular/best selling products
exports.getPopularProducts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        
        // Get products that have been ordered (best selling)
        const Order = require('../models/Order');
        
        // Aggregate to find products with most orders
        const popularProductsData = await Order.aggregate([
            { $unwind: '$items' },
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$items.productId',
                    totalQuantity: { $sum: '$items.quantity' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit }
        ]);
        
        const popularProductIds = popularProductsData.map(item => item._id);
        
        // Get product details
        let products;
        if (popularProductIds.length > 0) {
            products = await Product.find({
                _id: { $in: popularProductIds },
                approved: true
            }).limit(limit);
            
            // Sort products by their popularity order
            products.sort((a, b) => {
                const aIndex = popularProductIds.findIndex(id => id.toString() === a._id.toString());
                const bIndex = popularProductIds.findIndex(id => id.toString() === b._id.toString());
                return aIndex - bIndex;
            });
        } else {
            // If no orders yet, return newest products
            products = await Product.find({ approved: true })
                .sort({ createdAt: -1 })
                .limit(limit);
        }
        
        res.json(products);
    } catch (error) {
        logger.error('Error getting popular products:', error);
        // Fallback to newest products on error
        try {
            const limit = parseInt(req.query.limit) || 8;
            const products = await Product.find({ approved: true })
                .sort({ createdAt: -1 })
                .limit(limit);
            res.json(products);
        } catch (fallbackError) {
            logger.error('Error in fallback for popular products:', fallbackError);
            next(fallbackError);
        }
    }
};

