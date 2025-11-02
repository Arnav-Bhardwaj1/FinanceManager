# Resend Email Troubleshooting Guide

## Issues and Solutions

### Issue 1: Cron Scheduler Not Starting
**Problem**: The cron scheduler was only checking for `EMAIL_APP_PASSWORD`, which isn't needed for Resend.

**Fixed**: ✅ Updated cron check to detect `RESEND_API_KEY` or `SENDGRID_API_KEY`.

### Issue 2: EMAIL_USER Not Set
**Problem**: Resend requires a verified sender email address.

**Solution**: 
1. Go to Resend Dashboard → **Domains** or **Emails**
2. Add and verify your domain OR verify a single email address
3. In Render, add environment variable:
   ```
   EMAIL_USER=your-verified-email@example.com
   ```
   OR if using a domain:
   ```
   EMAIL_USER=noreply@yourdomain.com
   ```

### Issue 3: SMTP Configuration
**Fixed**: ✅ Changed Resend SMTP to use port 465 with SSL (more reliable).

## Quick Checklist

### ✅ Environment Variables in Render:
```
RESEND_API_KEY=re_your_api_key_here
EMAIL_USER=your-verified-email@example.com
FRONTEND_URL=https://your-app.netlify.app
```

### ✅ Verify in Resend Dashboard:
1. **API Key exists** → Dashboard → API Keys
2. **Email/Domain verified** → Dashboard → Domains or Emails
3. **Sender email matches** → The `EMAIL_USER` must be verified in Resend

### ✅ Check Render Logs:
After restarting, look for:
```
🔍 RESEND_API_KEY: Set (Using Resend)
📧 Email service configured: Resend
📅 Budget notification scheduler started
```

### ✅ Test Email Sending:
1. **Manual trigger** (with JWT token):
   ```bash
   POST https://your-backend.onrender.com/api/budgets/check
   Authorization: Bearer YOUR_TOKEN
   ```

2. **Check logs** for:
   ```
   📧 Attempting to send email via Resend to user@example.com
   ✅ Budget alert email sent via Resend: [message-id]
   ```

### ❌ Common Errors:

**Error: "EMAIL_USER is required"**
- Solution: Add `EMAIL_USER` environment variable with a verified email from Resend

**Error: "Connection timeout"**
- Solution: Already fixed - changed to port 465 with SSL

**Error: "Authentication failed"**
- Solution: Verify API key is correct and active in Resend dashboard

**Error: "Sender not verified"**
- Solution: Verify the email/domain in Resend dashboard before using it

**No emails received but no errors**
- Check: Budget threshold reached? (usage >= threshold)
- Check: Notification already sent today? (prevents spam)
- Check: Budget notifications enabled? (`notifications.enabled: true`)

## Next Steps

1. **Restart Render service** after adding `EMAIL_USER`
2. **Check Render logs** to verify email service is detected
3. **Manually trigger** budget check via API
4. **Check Resend Dashboard** → Logs to see if emails were sent

