// Quick email notification test script
// Usage: node test-email.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { checkAndSendBudgetNotifications } = require('./services/budgetNotificationService');
const { testEmailConfiguration } = require('./services/emailService');

async function runTests() {
  console.log('🧪 Testing Email Notification System\n');
  
  // Test 1: Check email configuration
  console.log('1️⃣ Testing email configuration...');
  const emailTest = await testEmailConfiguration();
  if (emailTest.success) {
    console.log(`   ✅ ${emailTest.message}\n`);
  } else {
    console.log('   ❌ Email configuration failed:', emailTest.message);
    console.log('\n   💡 Setup options:');
    console.log('   1. SendGrid (Recommended for production):');
    console.log('      - Sign up: https://sendgrid.com');
    console.log('      - Add SENDGRID_API_KEY to .env');
    console.log('   2. Resend (Alternative):');
    console.log('      - Sign up: https://resend.com');
    console.log('      - Add RESEND_API_KEY to .env');
    console.log('   3. Gmail SMTP (May fail in production):');
    console.log('      - Add EMAIL_USER and EMAIL_APP_PASSWORD to .env\n');
    process.exit(1);
  }
  
  // Test 2: Check MongoDB connection
  console.log('2️⃣ Testing MongoDB connection...');
  const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finance-tracker';
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('   ✅ MongoDB connected\n');
  } catch (error) {
    console.log('   ❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
  
  // Test 3: Run budget notification check
  console.log('3️⃣ Running budget notification check...');
  try {
    const result = await checkAndSendBudgetNotifications();
    console.log('\n   ✅ Budget check completed!');
    console.log(`   📊 Results:`, result);
    console.log(`   📧 Alerts sent: ${result.alertsSent}`);
    console.log(`   ❌ Errors: ${result.errors}`);
    console.log(`   📋 Total budgets checked: ${result.totalChecked}\n`);
    
    if (result.alertsSent > 0) {
      console.log('   🎉 Emails should have been sent! Check your inbox (and spam folder).\n');
    } else {
      console.log('   ℹ️  No alerts to send (no budgets exceeded thresholds or already notified today).\n');
      console.log('   💡 Tip: Create a budget with a low threshold (10%) and add expenses to test.\n');
    }
  } catch (error) {
    console.log('   ❌ Budget check failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('   ✅ Disconnected from MongoDB\n');
  }
  
  console.log('✨ Test completed!');
  process.exit(0);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
