const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '15d' }
  );
};

exports.googleCallback = (req, res) => {
  try {
    console.log('=== Google OAuth Callback Debug ===');
    console.log('req.user:', req.user);
    console.log('req.session:', req.session);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set');
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not Set');
    
    if (!req.user) {
      console.error('Google callback - No user found in request');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
    
    const user = req.user;
    console.log('User found:', { id: user._id, name: user.name, email: user.email });
    
    const token = generateToken(user);
    console.log('Token generated successfully');
    
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      provider: user.provider || 'google'
    };
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/google-success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
    
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('=== Google OAuth Callback Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '15d' }
    );

    // Send response
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        message: 'Please provide an email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Check if user has a local account (not Google OAuth only)
    if (user.provider !== 'local' || !user.password) {
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
      
      console.log('📧 Attempting to send PASSWORD RESET email to:', user.email);
      console.log('📧 Reset URL:', resetUrl);
      console.log('📧 User name:', user.name);
      
      const emailResult = await sendPasswordResetEmail(user.email, user.name, resetUrl);

      // Check if email was actually sent
      if (!emailResult || !emailResult.success) {
        // If email fails, clear the reset token
        user.clearPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        console.error('❌ Failed to send password reset email:', emailResult?.error || emailResult?.message || 'Unknown error');
        console.error('Email service response:', emailResult);
        
        // Still return success message for security (don't reveal email issues)
        return res.json({
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }

      console.log('✅ Password reset email sent successfully to:', user.email);
      res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (error) {
      // If email fails, clear the reset token
      user.clearPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      console.error('❌ Error sending password reset email:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Still return success message for security (don't reveal email issues)
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Error processing password reset request',
      error: error.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validate input
    if (!token || !password) {
      return res.status(400).json({
        message: 'Please provide reset token and new password'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired password reset token'
      });
    }

    // Check if user has a local account
    if (user.provider !== 'local') {
      return res.status(400).json({
        message: 'This account uses Google authentication. Please use Google to sign in.'
      });
    }

    // Set new password
    user.password = password;
    user.clearPasswordResetToken();
    await user.save();

    res.json({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'Error resetting password',
      error: error.message
    });
  }
};
