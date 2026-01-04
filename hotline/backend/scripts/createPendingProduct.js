const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const connectDB = require('../config/database');

const createPendingProduct = async () => {
    try {
        await connectDB();
        
        const pendingProduct = new Product({
            name: 'محصول تست در انتظار تایید',
            supplier: 'تأمین‌کننده تست',
            price: 1000000,
            category: 'electronics',
            stock: 10,
            description: 'این محصول برای تست است و باید در پنل ادمین تایید شود',
            minOrder: 1,
            approved: false
        });
        
        await pendingProduct.save();
        console.log('✓ Pending product created:', pendingProduct._id);
        console.log('Name:', pendingProduct.name);
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating pending product:', error);
        process.exit(1);
    }
};

createPendingProduct();

