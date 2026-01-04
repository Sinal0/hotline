const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Try to load helmet (optional - for CSP)
let helmet;
try {
    helmet = require('helmet');
} catch (error) {
    console.warn('Helmet not installed. CSP will be disabled. Run: npm install helmet');
}

// Connect to MongoDB
const connectDB = require('./config/database');
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware (CSP) - Only if helmet is installed
if (helmet) {
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
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
                    "http://localhost:3001",
                    "http://127.0.0.1:3001",
                    "http://127.0.0.1:1040",
                    "https://cdn.jsdelivr.net",
                    "https://cdnjs.cloudflare.com"
                ],
                frameSrc: ["'self'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: []
            }
        }
    }));
    console.log('✓ Helmet (CSP) enabled');
} else {
    console.warn('⚠ Helmet not installed. CSP is disabled. To enable: npm install helmet');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Root route
app.get('/', (req, res) => {
    const indexPath = path.join(parentDir, 'html', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send('<h1>Seller Hotline Backend API</h1><p>Server is running. API endpoints are available at /api/*</p>');
    }
});

// Serve index.html from /index.html as well
app.get('/index.html', (req, res) => {
    const indexPath = path.join(parentDir, 'html', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('index.html not found');
    }
});

// Handle favicon.ico requests (return 204 No Content to avoid 404 errors)
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

