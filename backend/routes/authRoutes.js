const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Existing routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// New route for checking authentication status
router.get('/status', authMiddleware.protect, (req, res) => {
  if (req.user) {
    res.json({
      id: req.user._id,
      email: req.user.email,
      username: req.user.username
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

module.exports = router;
