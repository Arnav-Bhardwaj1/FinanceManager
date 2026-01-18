const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { testEmailConfiguration, sendPasswordResetEmail } = require('../services/emailService');

// Existing routes 
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login?error=google_auth_failed` : '/login'
  }),
  authController.googleCallback
);

// New route for checking authentication status
router.get('/status', authMiddleware.protect, (req, res) => {
  if (req.user) {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      provider: req.user.provider
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Test email configuration (for debugging)
router.get('/test-email', async (req, res) => {
  try {
    const testResult = await testEmailConfiguration();
    res.json(testResult);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test sending a password reset email (for debugging)
router.post('/test-password-reset-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const testToken = 'test-token-12345';
    const resetUrl = `${frontendUrl}/reset-password?token=${testToken}`;
    
    const result = await sendPasswordResetEmail(email, 'Test User', resetUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error
    });
  }
});

module.exports = router;
