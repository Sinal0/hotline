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

// Register validation
const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('نام الزامی است')
        .isLength({ min: 2, max: 100 }).withMessage('نام باید بین 2 تا 100 کاراکتر باشد'),
    body('phone')
        .trim()
        .notEmpty().withMessage('شماره تماس الزامی است')
        .matches(/^09\d{9}$/).withMessage('شماره تماس باید یک شماره موبایل معتبر ایرانی باشد (09xxxxxxxxx)'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('ایمیل باید معتبر باشد')
        .normalizeEmail(),
    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('نام باید کمتر از 50 کاراکتر باشد'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('نام خانوادگی باید کمتر از 50 کاراکتر باشد'),
    validate
];

// Login validation
const validateLogin = [
    body('phone')
        .trim()
        .notEmpty().withMessage('شماره تماس الزامی است')
        .matches(/^09\d{9}$/).withMessage('شماره تماس باید یک شماره موبایل معتبر ایرانی باشد'),
    body('password')
        .notEmpty().withMessage('رمز عبور الزامی است')
        .isLength({ min: 6 }).withMessage('رمز عبور باید حداقل 6 کاراکتر باشد'),
    validate
];

// Update profile validation
const validateUpdateProfile = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('نام باید بین 2 تا 100 کاراکتر باشد'),
    body('phone')
        .optional()
        .trim()
        .matches(/^09\d{9}$/).withMessage('شماره تماس باید یک شماره موبایل معتبر ایرانی باشد'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('ایمیل باید معتبر باشد')
        .normalizeEmail(),
    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('نام باید کمتر از 50 کاراکتر باشد'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('نام خانوادگی باید کمتر از 50 کاراکتر باشد'),
    validate
];

module.exports = {
    validateRegister,
    validateLogin,
    validateUpdateProfile
};


