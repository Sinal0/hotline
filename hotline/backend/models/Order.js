const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
        },
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    shippingAddress: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

// Indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 }); // User orders sorted by date
orderSchema.index({ status: 1 }); // Status filter
orderSchema.index({ createdAt: -1 }); // All orders sorted by date

module.exports = mongoose.model('Order', orderSchema);

















