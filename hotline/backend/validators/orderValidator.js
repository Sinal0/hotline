const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({ 
            error: 'خطا در اعتبارسنجی',
            errors: errorMessages,
            details: errors.array()
        });
    }
    next();
};

// Order statuses
const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// Create order validation
const validateCreateOrder = [
    body('userId')
        .notEmpty().withMessage('شناسه کاربر الزامی است')
        .isMongoId().withMessage('شناسه کاربر باید یک شناسه معتبر MongoDB باشد'),
    body('shippingAddress')
        .trim()
        .notEmpty().withMessage('آدرس ارسال الزامی است')
        .isLength({ min: 10, max: 500 }).withMessage('آدرس ارسال باید بین 10 تا 500 کاراکتر باشد'),
    validate
];

// Update order status validation
const validateUpdateOrderStatus = [
    body('status')
        .trim()
        .notEmpty().withMessage('وضعیت الزامی است')
        .isIn(validStatuses).withMessage(`وضعیت باید یکی از موارد زیر باشد: ${validStatuses.join(', ')}`),
    validate
];

module.exports = {
    validateCreateOrder,
    validateUpdateOrderStatus
};


