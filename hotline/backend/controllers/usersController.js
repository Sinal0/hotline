const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Register user
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, firstName, lastName } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }

        // Check if user exists by phone
        let user = await User.findOne({ phone });
        if (user) {
            // User exists, return existing user info (for login flow)
            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ error: 'Server configuration error' });
            }
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d',
            });
            return res.json({
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            });
        }

        // Create new user
        const userData = {
            name,
            phone,
            firstName: firstName || '',
            lastName: lastName || '',
            role: 'buyer',
            password: Math.random().toString(36).slice(-8), // Random password for schema compatibility
        };

        // Only set email if provided and not empty
        if (email && email.trim() !== '') {
            userData.email = email;
        }

        user = new User(userData);
        await user.save();

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: 'Server configuration error' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        logger.info(`New user registered: ${user.phone}`);
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error('Error registering user:', error);
        next(error);
    }
};

// Login (for admin)
exports.login = async (req, res, next) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password are required' });
        }

        // Find user by phone
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({ error: 'اطلاعات ورود نامعتبر است' });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'دسترسی رد شد. فقط ادمین‌ها می‌توانند از این صفحه وارد شوند.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'اطلاعات ورود نامعتبر است' });
        }

        // Generate token
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: 'Server configuration error' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        logger.info(`Admin user logged in: ${user.phone}`);
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error('Error logging in:', error);
        next(error);
    }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const updates = req.body;
        
        // Prevent role changes
        delete updates.role;
        delete updates.password; // Prevent password update through this route
        
        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        logger.info(`User profile updated: ${userId}`);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        });
    } catch (error) {
        logger.error('Error updating profile:', error);
        next(error);
    }
};

