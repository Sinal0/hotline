const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/database');
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

