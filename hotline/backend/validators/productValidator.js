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

// Product categories
const validCategories = ['electronics', 'clothing', 'food', 'home', 'beauty', 'sports'];

// Create/Update product validation
const validateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('نام محصول الزامی است')
        .isLength({ min: 2, max: 200 }).withMessage('نام محصول باید بین 2 تا 200 کاراکتر باشد'),
    body('price')
        .notEmpty().withMessage('قیمت الزامی است')
        .isFloat({ min: 0 }).withMessage('قیمت باید یک عدد مثبت باشد'),
    body('category')
        .trim()
        .notEmpty().withMessage('دسته‌بندی الزامی است')
        .isIn(validCategories).withMessage(`دسته‌بندی باید یکی از موارد زیر باشد: ${validCategories.join(', ')}`),
    body('stock')
        .notEmpty().withMessage('موجودی الزامی است')
        .isInt({ min: 0 }).withMessage('موجودی باید یک عدد صحیح غیرمنفی باشد'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('توضیحات باید کمتر از 1000 کاراکتر باشد'),
    body('image')
        .optional()
        .trim()
        .isURL().withMessage('آدرس تصویر باید یک URL معتبر باشد'),
    body('minOrder')
        .optional()
        .isInt({ min: 1 }).withMessage('حداقل سفارش باید حداقل 1 باشد'),
    validate
];

module.exports = {
    validateProduct
};


