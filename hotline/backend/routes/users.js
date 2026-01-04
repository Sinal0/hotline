const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const auth = require('../middleware/auth');
const { validateRegister, validateLogin, validateUpdateProfile } = require('../validators/userValidator');

// Login (for admin)
router.post('/login', validateLogin, usersController.login);

// Register
router.post('/register', validateRegister, usersController.register);

// Update profile (protected route)
router.put('/profile', auth, validateUpdateProfile, usersController.updateProfile);

module.exports = router;

