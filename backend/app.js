// Load environment variables first from root directory
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🔍 App.js - Environment check:');
console.log('🔍 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set');
console.log('🔍 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set');
console.log('🔍 JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('🔍 MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not Set');
console.log('🔍 EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
console.log('🔍 EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not Set');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const cron = require('node-cron');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const savingsGoalRoutes = require('./routes/savingsGoalRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const { checkAndSendBudgetNotifications } = require('./services/budgetNotificationService');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/savings-goals', savingsGoalRoutes);
app.use('/api/budgets', budgetRoutes);

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finance-tracker';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server only after MongoDB connection is established
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      // Schedule budget notification checks
      // Runs every 6 hours (at 00:00, 06:00, 12:00, 18:00)
      if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
        cron.schedule('0 */6 * * *', async () => {
          console.log('⏰ Running scheduled budget check...');
          try {
            await checkAndSendBudgetNotifications();
          } catch (error) {
            console.error('Error in scheduled budget check:', error);
          }
        });
        console.log('📅 Budget notification scheduler started (checks every 6 hours)');
        
        // Also run an immediate check on startup (optional, for testing)
        if (process.env.RUN_BUDGET_CHECK_ON_STARTUP === 'true') {
          setTimeout(async () => {
            console.log('🔔 Running initial budget check on startup...');
            try {
              await checkAndSendBudgetNotifications();
            } catch (error) {
              console.error('Error in initial budget check:', error);
            }
          }, 5000); // Wait 5 seconds after server starts
        }
      } else {
        console.log('⚠️ Email notifications disabled - EMAIL_USER and EMAIL_APP_PASSWORD not configured');
      }
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;