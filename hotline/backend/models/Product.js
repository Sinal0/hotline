const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    supplier: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
        enum: ['electronics', 'clothing', 'food', 'home', 'beauty', 'sports'],
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    description: {
        type: String,
        default: '',
    },
    image: {
        type: String,
        default: '',
    },
    minOrder: {
        type: Number,
        default: 1,
    },
    approved: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' }); // Text search
productSchema.index({ category: 1, approved: 1 }); // Category filter
productSchema.index({ approved: 1, createdAt: -1 }); // Approved products sorted by date
productSchema.index({ supplier: 1 }); // Supplier filter

module.exports = mongoose.model('Product', productSchema);

















