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

// Add to cart validation
const validateAddToCart = [
    body('userId')
        .notEmpty().withMessage('شناسه کاربر الزامی است')
        .isMongoId().withMessage('شناسه کاربر باید یک شناسه معتبر MongoDB باشد'),
    body('productId')
        .notEmpty().withMessage('شناسه محصول الزامی است')
        .isMongoId().withMessage('شناسه محصول باید یک شناسه معتبر MongoDB باشد'),
    body('quantity')
        .optional()
        .isInt({ min: 1 }).withMessage('تعداد باید حداقل 1 باشد'),
    validate
];

// Update cart item validation
const validateUpdateCartItem = [
    body('quantity')
        .notEmpty().withMessage('تعداد الزامی است')
        .isInt({ min: 1 }).withMessage('تعداد باید حداقل 1 باشد'),
    validate
];

module.exports = {
    validateAddToCart,
    validateUpdateCartItem
};


