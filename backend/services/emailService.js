const nodemailer = require('nodemailer');

// Create transporter for Gmail SMTP with production-ready settings
const createTransporter = () => {
  // Check if we should use Brevo (Sendinblue) - Free tier: 300 emails/day
  if (process.env.BREVO_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.BREVO_API_KEY,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      debug: process.env.NODE_ENV === 'development',
    });
  }

  // Check if we should use SendGrid (production email service)
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

// Send email via Mailjet API (HTTP-based, works on Render)
const sendViaMailjet = async (to, fromEmail, fromName, subject, html) => {
  try {
    const apiKey = process.env.MAILJET_API_KEY;
    const apiSecret = process.env.MAILJET_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return { success: false, error: 'Mailjet credentials not configured' };
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [{
          From: {
            Email: fromEmail,
            Name: fromName || 'Finance Manager',
          },
          To: [{
            Email: to,
          }],
          Subject: subject,
          HTMLPart: html,
        }],
      }),
    });

    const result = await response.json();

    if (response.ok && result.Messages && result.Messages[0].Status === 'success') {
      return { success: true, messageId: result.Messages[0].To[0].MessageID };
    } else {
      return { success: false, error: result.ErrorMessage || 'Mailjet API error' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send budget alert email with retry logic
const sendBudgetAlertEmail = async (userEmail, userName, budgetData, retries = 2) => {
  try {
    // Check if any email service is configured
    const hasEmailService = 
      process.env.MAILJET_API_KEY ||
      process.env.BREVO_API_KEY ||
      process.env.SENDGRID_API_KEY || 
      (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);

    if (!hasEmailService) {
      console.warn('Email service not configured. Skipping email notification.');
      return { success: false, message: 'Email service not configured' };
    }

    // Determine sender email (priority: Mailjet > Brevo > SendGrid > Gmail)
    let fromEmail;
    let fromName = 'Finance Manager';
    
    if (process.env.MAILJET_API_KEY) {
      // For Mailjet, use verified sender email
      fromEmail = process.env.MAILJET_SENDER_EMAIL || process.env.SENDER_EMAIL || process.env.EMAIL_USER;
      if (!fromEmail) {
        console.error('❌ MAILJET_SENDER_EMAIL, SENDER_EMAIL, or EMAIL_USER must be set for Mailjet');
        return { success: false, message: 'Sender email not configured for Mailjet' };
      }
    } else if (process.env.BREVO_API_KEY) {
      // For Brevo, use verified sender email (can be Gmail)
      fromEmail = process.env.BREVO_SENDER_EMAIL || process.env.SENDER_EMAIL || process.env.EMAIL_USER;
      if (!fromEmail) {
        console.error('❌ BREVO_SENDER_EMAIL, SENDER_EMAIL, or EMAIL_USER must be set for Brevo');
        return { success: false, message: 'Sender email not configured for Brevo' };
      }
    } else if (process.env.SENDGRID_API_KEY) {
      // For SendGrid, use the verified sender email
      fromEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;
      if (!fromEmail) {
        console.error('❌ SENDER_EMAIL or EMAIL_USER must be set for SendGrid');
        return { success: false, message: 'SENDER_EMAIL or EMAIL_USER not configured' };
      }
    } else {
      // For Gmail, use the authenticated email
      fromEmail = process.env.EMAIL_USER;
    }

    const subject = `🚨 Budget Alert: ${budgetData.category} - ${budgetData.isExceeded ? 'Exceeded' : 'Warning'}`;
    console.log('📧 [BUDGET ALERT] Preparing email with subject:', subject);
    console.log('📧 [BUDGET ALERT] To:', userEmail);
    console.log('📧 [BUDGET ALERT] Category:', budgetData.category);
    
    const html = getBudgetAlertEmailTemplate({
      ...budgetData,
      userName,
    });
    console.log('📧 [BUDGET ALERT] Email template generated, length:', html.length);

    // Use Mailjet API if available (HTTP-based, works on Render)
    if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
      try {
        const result = await sendViaMailjet(userEmail, fromEmail, fromName, subject, html);
        
        if (result.success) {
          console.log('✅ [BUDGET ALERT] Email sent via Mailjet!');
          console.log('✅ [BUDGET ALERT] Message ID:', result.messageId);
          console.log('✅ [BUDGET ALERT] Subject:', subject);
          return result;
        } else {
          console.error('❌ Mailjet API error:', result.error);
          // Fall through to SMTP fallback
        }
      } catch (error) {
        console.error('❌ Error sending email via Mailjet:', error.message);
        // Fall through to SMTP fallback
      }
    }

    // Use SendGrid or Gmail via nodemailer
    const transporter = createTransporter();
    const mailOptions = {
      from: `"Finance Manager" <${fromEmail}>`,
      to: userEmail,
      subject: subject,
      html: html,
    };

    // Retry logic for connection issues
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [BUDGET ALERT] Email sent successfully!');
        console.log('✅ [BUDGET ALERT] Message ID:', info.messageId);
        console.log('✅ [BUDGET ALERT] Subject:', subject);
        return { success: true, messageId: info.messageId };
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.code === 'EAUTH' || error.code === 'EENVELOPE') {
          console.error('❌ Email authentication/envelope error, not retrying:', error.message);
          break;
        }

        // Retry on connection/timeout errors
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
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
      process.env.MAILJET_API_KEY ||
      process.env.BREVO_API_KEY ||
      process.env.SENDGRID_API_KEY || 
      (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);

    if (!hasEmailService) {
      return { success: false, message: 'Email credentials not configured' };
    }

    // Test Mailjet (if configured) - API-based, no connection test needed
    if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
      const senderEmail = process.env.MAILJET_SENDER_EMAIL || process.env.SENDER_EMAIL || process.env.EMAIL_USER;
      if (!senderEmail) {
        return { success: false, message: 'MAILJET_SENDER_EMAIL, SENDER_EMAIL, or EMAIL_USER must be set for Mailjet' };
      }
      return { success: true, message: 'Mailjet email configuration is valid' };
    }

    // Test Brevo, SendGrid, or Gmail via nodemailer
    const transporter = createTransporter();
    
    // Verify connection with timeout
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 20000)
      )
    ]);

    let serviceType = 'Gmail';
    if (process.env.BREVO_API_KEY) {
      serviceType = 'Brevo';
    } else if (process.env.SENDGRID_API_KEY) {
      serviceType = 'SendGrid';
    }
    
    return { success: true, message: `${serviceType} email configuration is valid` };
  } catch (error) {
    return { success: false, message: error.message, code: error.code };
  }
};

// Email template for password reset
const getPasswordResetEmailTemplate = (userName, resetUrl) => {
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
        .content {
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background-color: #2196f3;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .cta-button:hover {
          background-color: #1976d2;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
        }
        .reset-link {
          word-break: break-all;
          color: #2196f3;
          font-size: 12px;
          margin-top: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>We received a request to reset your password for your Finance Manager account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div class="button-container">
            <a href="${resetUrl}" class="cta-button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <div class="reset-link">${resetUrl}</div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </div>
          
          <p>If you continue to have problems, please contact our support team.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email from Finance Manager.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetUrl, retries = 2) => {
  try {
    // Check if any email service is configured
    const hasEmailService = 
      process.env.MAILJET_API_KEY ||
      process.env.BREVO_API_KEY ||
      process.env.SENDGRID_API_KEY || 
      (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);

    if (!hasEmailService) {
      console.warn('Email service not configured. Skipping password reset email.');
      return { success: false, message: 'Email service not configured' };
    }

    // Determine sender email (priority: Mailjet > Brevo > SendGrid > Gmail)
    let fromEmail;
    let fromName = 'Finance Manager';
    
    if (process.env.MAILJET_API_KEY) {
      fromEmail = process.env.MAILJET_SENDER_EMAIL || process.env.SENDER_EMAIL || process.env.EMAIL_USER;
      if (!fromEmail) {
        console.error('❌ MAILJET_SENDER_EMAIL, SENDER_EMAIL, or EMAIL_USER must be set for Mailjet');
        return { success: false, message: 'Sender email not configured for Mailjet' };
      }
    } else if (process.env.BREVO_API_KEY) {
      fromEmail = process.env.BREVO_SENDER_EMAIL || process.env.SENDER_EMAIL || process.env.EMAIL_USER;
      if (!fromEmail) {
        console.error('❌ BREVO_SENDER_EMAIL, SENDER_EMAIL, or EMAIL_USER must be set for Brevo');
        return { success: false, message: 'Sender email not configured for Brevo' };
      }
    } else if (process.env.SENDGRID_API_KEY) {
      fromEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;
      if (!fromEmail) {
        console.error('❌ SENDER_EMAIL or EMAIL_USER must be set for SendGrid');
        return { success: false, message: 'SENDER_EMAIL or EMAIL_USER not configured' };
      }
    } else {
      fromEmail = process.env.EMAIL_USER;
    }

    const subject = '🔐 Reset Your Password - Finance Manager';
    console.log('📧 [PASSWORD RESET] Preparing email with subject:', subject);
    console.log('📧 [PASSWORD RESET] To:', userEmail);
    console.log('📧 [PASSWORD RESET] From:', fromEmail);
    
    const html = getPasswordResetEmailTemplate(userName, resetUrl);
    console.log('📧 [PASSWORD RESET] Email template generated, length:', html.length);

    // Use Mailjet API if available (HTTP-based, works on Render)
    if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
      try {
        const result = await sendViaMailjet(userEmail, fromEmail, fromName, subject, html);
        
        if (result.success) {
          console.log('✅ [PASSWORD RESET] Email sent via Mailjet!');
          console.log('✅ [PASSWORD RESET] Message ID:', result.messageId);
          console.log('✅ [PASSWORD RESET] Subject:', subject);
          return result;
        } else {
          console.error('❌ Mailjet API error:', result.error);
          // Fall through to SMTP fallback
        }
      } catch (error) {
        console.error('❌ Error sending email via Mailjet:', error.message);
        // Fall through to SMTP fallback
      }
    }

    // Use SendGrid or Gmail via nodemailer
    const transporter = createTransporter();
    const mailOptions = {
      from: `"Finance Manager" <${fromEmail}>`,
      to: userEmail,
      subject: subject,
      html: html,
    };

    // Retry logic for connection issues
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [PASSWORD RESET] Email sent successfully!');
        console.log('✅ [PASSWORD RESET] Message ID:', info.messageId);
        console.log('✅ [PASSWORD RESET] Subject:', subject);
        return { success: true, messageId: info.messageId };
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.code === 'EAUTH' || error.code === 'EENVELOPE') {
          console.error('❌ Email authentication/envelope error, not retrying:', error.message);
          break;
        }

        // Retry on connection/timeout errors
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
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
    console.error('❌ Failed to send password reset email after retries:', lastError?.message || lastError);
    return { success: false, error: lastError?.message || 'Unknown error', code: lastError?.code };
  } catch (error) {
    console.error('❌ Error in sendPasswordResetEmail:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

module.exports = {
  sendBudgetAlertEmail,
  sendPasswordResetEmail,
  testEmailConfiguration,
};
