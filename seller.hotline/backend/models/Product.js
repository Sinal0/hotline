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

module.exports = mongoose.model('Product', productSchema);

