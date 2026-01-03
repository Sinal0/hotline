const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
    try {
        const { name, email, phone, firstName, lastName } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }

        // Check if user exists by phone
        let user = await User.findOne({ phone });
        if (user) {
            // User exists, return existing user info (for login flow)
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
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

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '30d',
        });

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
        res.status(500).json({ error: error.message });
    }
};

// Login (for admin)
exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password are required' });
        }

        // Find user by phone
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Only admins can login here.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '30d',
        });

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
        res.status(500).json({ error: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updates = req.body;
        
        // Prevent role changes
        delete updates.role;
        
        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
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
        res.status(500).json({ error: error.message });
    }
};

