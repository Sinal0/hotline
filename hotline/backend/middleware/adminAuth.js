const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const logger = require('../utils/logger');

const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        // Check if JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            logger.error('JWT_SECRET is not set in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if admin exists and is active
        const admin = await Admin.findById(decoded.userId);
        
        if (!admin) {
            return res.status(403).json({ error: 'دسترسی رد شد. فقط ادمین‌ها می‌توانند دسترسی داشته باشند.' });
        }
        
        if (!admin.isActive) {
            return res.status(403).json({ error: 'حساب کاربری شما غیرفعال است' });
        }
        
        req.user = decoded;
        req.userData = admin;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        logger.error('Admin auth middleware error:', error);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = adminAuth;

