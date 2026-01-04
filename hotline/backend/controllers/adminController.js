const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Admin Login
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'نام کاربری و رمز عبور الزامی است' });
        }

        // Find admin by username
        const admin = await Admin.findOne({ username: username.trim() });
        if (!admin) {
            return res.status(401).json({ error: 'اطلاعات ورود نامعتبر است' });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(403).json({ error: 'حساب کاربری شما غیرفعال است' });
        }

        // Verify password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'اطلاعات ورود نامعتبر است' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate token
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: 'خطا در پیکربندی سرور' });
        }
        const token = jwt.sign({ 
            userId: admin._id,
            role: 'admin',
            username: admin.username
        }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        logger.info(`Admin logged in: ${admin.username}`);
        res.json({
            token,
            user: {
                _id: admin._id,
                username: admin.username,
                name: admin.name,
                email: admin.email,
                role: 'admin',
            },
        });
    } catch (error) {
        logger.error('Error in admin login:', error);
        next(error);
    }
};

// Get admin profile
exports.getProfile = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user.userId).select('-password');
        if (!admin) {
            return res.status(404).json({ error: 'ادمین یافت نشد' });
        }
        res.json(admin);
    } catch (error) {
        logger.error('Error getting admin profile:', error);
        next(error);
    }
};

// Update admin profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const admin = await Admin.findById(req.user.userId);
        
        if (!admin) {
            return res.status(404).json({ error: 'ادمین یافت نشد' });
        }

        if (name) admin.name = name;
        if (email) admin.email = email;

        await admin.save();
        res.json({
            _id: admin._id,
            username: admin.username,
            name: admin.name,
            email: admin.email,
            role: 'admin',
        });
    } catch (error) {
        logger.error('Error updating admin profile:', error);
        next(error);
    }
};

// Change password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'رمز عبور فعلی و جدید الزامی است' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'رمز عبور جدید باید حداقل 6 کاراکتر باشد' });
        }

        const admin = await Admin.findById(req.user.userId);
        if (!admin) {
            return res.status(404).json({ error: 'ادمین یافت نشد' });
        }

        // Verify current password
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'رمز عبور فعلی نادرست است' });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        logger.info(`Admin password changed: ${admin.username}`);
        res.json({ message: 'رمز عبور با موفقیت تغییر یافت' });
    } catch (error) {
        logger.error('Error changing admin password:', error);
        next(error);
    }
};

