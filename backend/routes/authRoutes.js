const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

const router = express.Router();

// Signup route
router.post('/signup', authController.signup);

// Signin route
router.post('/signin', authController.signin);

// Protected route to get current logged-in user
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;
