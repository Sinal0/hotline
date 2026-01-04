const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
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

// Admin login validation
const validateAdminLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('نام کاربری الزامی است')
        .isLength({ min: 3, max: 50 }).withMessage('نام کاربری باید بین 3 تا 50 کاراکتر باشد'),
    body('password')
        .notEmpty().withMessage('رمز عبور الزامی است')
        .isLength({ min: 6 }).withMessage('رمز عبور باید حداقل 6 کاراکتر باشد'),
    validate
];

// Routes
router.post('/login', validateAdminLogin, adminController.login);
router.get('/profile', adminAuth, adminController.getProfile);
router.put('/profile', adminAuth, adminController.updateProfile);
router.put('/change-password', adminAuth, adminController.changePassword);

module.exports = router;

