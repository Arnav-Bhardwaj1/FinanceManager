const nodemailer = require('nodemailer');

// Create transporter for Gmail SMTP
const createTransporter = () => {
  // Use environment variables for Gmail credentials
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
    },
  });

  return transporter;
};

// Email template for budget alerts
const getBudgetAlertEmailTemplate = (budgetData) => {
  const {
    userName,
    category,
    budgetAmount,
    spentAmount,
    remaining,
    usagePercentage,
    isExceeded,
    month,
  } = budgetData;

  const statusColor = isExceeded ? '#f50057' : '#ff9800';
  const statusText = isExceeded ? 'EXCEEDED' : 'WARNING';
  const statusEmoji = isExceeded ? '🚨' : '⚠️';

  const progressBarWidth = Math.min(usagePercentage, 100);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 25px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        .status-badge {
          display: inline-block;
          background-color: ${statusColor};
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          margin: 15px 0;
        }
        .budget-card {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid ${statusColor};
        }
        .budget-item {
          display: flex;
          justify-content: space-between;
          margin: 12px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .budget-item:last-child {
          border-bottom: none;
        }
        .budget-label {
          font-weight: 600;
          color: #666;
        }
        .budget-value {
          font-weight: 700;
          color: #333;
          font-size: 16px;
        }
        .progress-bar {
          width: 100%;
          height: 30px;
          background-color: #e0e0e0;
          border-radius: 15px;
          overflow: hidden;
          margin: 15px 0;
          position: relative;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, ${statusColor} 0%, ${statusColor}dd 100%);
          width: ${progressBarWidth}%;
          transition: width 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 12px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .cta-button {
          display: inline-block;
          background-color: #2196f3;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusEmoji} Budget Alert</h1>
        </div>
        
        <div style="text-align: center;">
          <span class="status-badge">${statusText}</span>
        </div>
        
        <p>Hi <strong>${userName}</strong>,</p>
        
        <p>Your budget for <strong>${category}</strong> in <strong>${month}</strong> has reached the alert threshold.</p>
        
        <div class="budget-card">
          <div class="budget-item">
            <span class="budget-label">Category:</span>
            <span class="budget-value">${category}</span>
          </div>
          <div class="budget-item">
            <span class="budget-label">Budget Amount:</span>
            <span class="budget-value">₹${budgetAmount.toLocaleString('en-IN')}</span>
          </div>
          <div class="budget-item">
            <span class="budget-label">Amount Spent:</span>
            <span class="budget-value" style="color: ${statusColor};">₹${spentAmount.toLocaleString('en-IN')}</span>
          </div>
          <div class="budget-item">
            <span class="budget-label">Remaining:</span>
            <span class="budget-value" style="color: ${remaining >= 0 ? '#4caf50' : '#f50057'};">
              ₹${Math.abs(remaining).toLocaleString('en-IN')}
            </span>
          </div>
          <div class="budget-item">
            <span class="budget-label">Usage:</span>
            <span class="budget-value" style="color: ${statusColor};">
              ${usagePercentage.toFixed(1)}%
            </span>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill">
              ${usagePercentage.toFixed(1)}%
            </div>
          </div>
        </div>
        
        ${isExceeded 
          ? '<p style="color: #f50057; font-weight: 600;">⚠️ Your budget has been exceeded! Please review your spending.</p>'
          : '<p style="color: #ff9800; font-weight: 600;">You are approaching your budget limit. Please monitor your spending.</p>'
        }
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/budgets" class="cta-button">
            View Budget Details
          </a>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from Finance Manager.</p>
          <p>You can manage your notification settings in your budget preferences.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send budget alert email
const sendBudgetAlertEmail = async (userEmail, userName, budgetData) => {
  try {
    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email service not configured. Skipping email notification.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Finance Manager" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🚨 Budget Alert: ${budgetData.category} - ${budgetData.isExceeded ? 'Exceeded' : 'Warning'}`,
      html: getBudgetAlertEmailTemplate({
        ...budgetData,
        userName,
      }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Budget alert email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending budget alert email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      return { success: false, message: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendBudgetAlertEmail,
  testEmailConfiguration,
};
