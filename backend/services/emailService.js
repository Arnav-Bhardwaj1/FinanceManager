const nodemailer = require('nodemailer');

// Create transporter for Gmail SMTP with production-ready settings
const createTransporter = () => {
  // Check if we should use SendGrid or Resend (production email services)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,
      socketTimeout: 30000,
      debug: process.env.NODE_ENV === 'development',
    });
  }

  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true, // Use SSL for port 465
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    });
  }

  // Use Gmail SMTP with explicit configuration for better reliability
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    // Production-ready timeout settings
    connectionTimeout: 30000, // 30 seconds (increased from default 2s)
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 30000, // 30 seconds
    // Retry settings
    pool: true, // Use connection pooling
    maxConnections: 1,
    maxMessages: 5,
    // Debug (only in development)
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
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

// Send budget alert email with retry logic
const sendBudgetAlertEmail = async (userEmail, userName, budgetData, retries = 2) => {
  try {
    // Check if any email service is configured
    const hasEmailService = 
      process.env.SENDGRID_API_KEY || 
      process.env.RESEND_API_KEY || 
      (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);

    if (!hasEmailService) {
      console.warn('Email service not configured. Skipping email notification.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();

    // Determine sender email
    let fromEmail;
    if (process.env.RESEND_API_KEY) {
      // For Resend, EMAIL_USER must be a verified domain/email in Resend
      fromEmail = process.env.EMAIL_USER || process.env.SENDER_EMAIL;
      if (!fromEmail) {
        console.error('❌ EMAIL_USER is required when using Resend. Please set it to a verified email/domain in your Resend account.');
        return { success: false, message: 'EMAIL_USER is required for Resend' };
      }
    } else if (process.env.SENDGRID_API_KEY) {
      // For SendGrid, use the verified sender email
      fromEmail = process.env.EMAIL_USER || process.env.SENDER_EMAIL || 'noreply@financemanager.com';
    } else {
      // For Gmail, use the authenticated email
      fromEmail = process.env.EMAIL_USER;
    }

    const mailOptions = {
      from: `"Finance Manager" <${fromEmail}>`,
      to: userEmail,
      subject: `🚨 Budget Alert: ${budgetData.category} - ${budgetData.isExceeded ? 'Exceeded' : 'Warning'}`,
      html: getBudgetAlertEmailTemplate({
        ...budgetData,
        userName,
      }),
    };

    // Log which service is being used
    const serviceType = process.env.SENDGRID_API_KEY ? 'SendGrid' : 
                       process.env.RESEND_API_KEY ? 'Resend' : 'Gmail';
    console.log(`📧 Attempting to send email via ${serviceType} to ${userEmail}`);

    // Retry logic for connection issues
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Budget alert email sent via ${serviceType}:`, info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (error) {
        lastError = error;
        console.error(`❌ Email send attempt ${attempt + 1} failed:`, {
          code: error.code,
          command: error.command,
          message: error.message,
          response: error.response,
        });
        
        // Don't retry on certain errors
        if (error.code === 'EAUTH' || error.code === 'EENVELOPE') {
          console.error('❌ Email authentication/envelope error, not retrying:', error.message);
          break;
        }

        // Retry on connection/timeout errors
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ESOCKET') {
          if (attempt < retries) {
            const delay = (attempt + 1) * 2000; // Exponential backoff: 2s, 4s
            console.warn(`⚠️ Email send failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        // If not a retryable error or out of retries, break
        break;
      }
    }

    // All retries failed
    console.error('❌ Failed to send budget alert email after retries:', lastError?.message || lastError);
    return { success: false, error: lastError?.message || 'Unknown error', code: lastError?.code };
  } catch (error) {
    console.error('❌ Error in sendBudgetAlertEmail:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    const hasEmailService = 
      process.env.SENDGRID_API_KEY || 
      process.env.RESEND_API_KEY || 
      (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);

    if (!hasEmailService) {
      return { success: false, message: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    
    // Verify connection with timeout
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 20000)
      )
    ]);

    const serviceType = process.env.SENDGRID_API_KEY ? 'SendGrid' : 
                       process.env.RESEND_API_KEY ? 'Resend' : 'Gmail';
    
    return { success: true, message: `${serviceType} email configuration is valid` };
  } catch (error) {
    return { success: false, message: error.message, code: error.code };
  }
};

module.exports = {
  sendBudgetAlertEmail,
  testEmailConfiguration,
};
