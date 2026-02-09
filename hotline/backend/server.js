const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import logger
const logger = require('./utils/logger');

// Connect to MongoDB
const connectDB = require('./config/database');
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com",
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://cdnjs.cloudflare.com",
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "http:"
            ],
            connectSrc: [
                "'self'",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:1040",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
})); // Set security HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection attacks

// Rate Limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from parent directory
const parentDir = path.join(__dirname, '..');
app.use(express.static(parentDir));
app.use('/html', express.static(path.join(parentDir, 'html')));
app.use('/css', express.static(path.join(parentDir, 'css')));
app.use('/js', express.static(path.join(parentDir, 'js')));
app.use('/pictures', express.static(path.join(parentDir, 'pictures')));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/admin', require('./routes/admin'));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(parentDir, 'html', 'index.html'));
});

// Serve index.html from /index.html as well
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(parentDir, 'html', 'index.html'));
});

// Serve HTML pages from root paths (must be before 404 handler)
const htmlFiles = [
    'login.html',
    'admin-login.html',
    'admin-panel.html',
    'buyer-dashboard.html',
    'cart.html',
    'products.html',
    'suppliers.html',
    'about.html',
    'forget-password.html',
    'register.html'
];

htmlFiles.forEach(file => {
    app.get(`/${file}`, (req, res) => {
        const filePath = path.join(parentDir, 'html', file);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).json({ 
                error: 'File not found',
                path: req.originalUrl 
            });
        }
    });
});

// Error Handling Middleware (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl 
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

