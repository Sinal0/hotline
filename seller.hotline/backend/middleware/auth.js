const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Try multiple ways to get the Authorization header
        const authHeader = req.headers['authorization'] || req.headers['Authorization'] || req.get('Authorization');
        const token = authHeader?.replace('Bearer ', '').trim();
        
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        // Use fallback JWT_SECRET if not set (for development only)
        // Must match the secret used in usersController.js for login
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        if (!process.env.JWT_SECRET) {
            console.warn('⚠️  WARNING: JWT_SECRET is not set in environment variables. Using default (NOT SECURE FOR PRODUCTION)');
        }

        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Auth error:', error.message);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = auth;

