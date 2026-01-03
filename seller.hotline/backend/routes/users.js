const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const auth = require('../middleware/auth');

// Login (for suppliers only)
router.post('/login', usersController.login);

// Register
router.post('/register', usersController.register);

// Update profile (protected route)
router.put('/profile', auth, usersController.updateProfile);

module.exports = router;

