# Email Configuration Guide

## Issue: "Invalid email or password" when sending invoice emails

The system is trying to send emails but failing with authentication errors. This happens because Gmail requires an App Password instead of your regular Gmail password.

## Solution: Generate Gmail App Password

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable it (if not already enabled)

### Step 2: Generate App Password

1. Go back to **Security** settings
2. Under "How you sign in to Google", click **App passwords**
   - If you don't see this option, make sure 2-Step Verification is enabled
3. In the "Select app" dropdown, choose **Mail**
4. In the "Select device" dropdown, choose **Other (Custom name)**
5. Enter a name like "PharmaFlow Backend"
6. Click **Generate**
7. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File

1. Open `apps/api/.env`
2. Update these variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop  # The 16-char app password (remove spaces)
SMTP_FROM=PharmaFlow <noreply@pharmaflow.com>
```

### Step 4: Restart the API Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd apps/api
npm run dev
```

## Alternative: Use a Different Email Service

If you don't want to use Gmail, you can use other SMTP services:

### Ethereal Email (For Testing Only)

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=get-from-ethereal.email
SMTP_PASS=get-from-ethereal.email
```

Visit https://ethereal.email/ to create a test account.

### SendGrid (Production Ready)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### AWS SES (Production Ready)

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-smtp-username
SMTP_PASS=your-aws-smtp-password
```

## Testing Email Configuration

After updating the configuration, test by:

1. Creating a sales order with a customer that has an email address
2. Complete the payment
3. Check the logs at `apps/api/logs/` for success/error messages
4. If successful, you should see: "Sales Invoice email sent to customer@email.com"

## Current Configuration

Your current `.env` file has:

- **SMTP_USER**: tnh.t1k30.ht@gmail.com
- **SMTP_PASS**: zutpilbhleqimcqi

The password appears to be an old App Password. You may need to:

1. Generate a NEW App Password (old ones can expire or be revoked)
2. Update the `SMTP_PASS` in `.env`
3. Restart the API server

## Troubleshooting

### Error: "Invalid login"

- The App Password is incorrect or expired
- Generate a new App Password following the steps above

### Error: "Too many login attempts"

- Wait 15-30 minutes before trying again
- Check if your IP is blocked by Gmail

### Error: "Connection timeout"

- Check your firewall settings
- Ensure port 587 is not blocked
- Try using port 465 with `secure: true` in the transporter config

### Email sends but not received

- Check spam/junk folder
- Verify the recipient email address is correct
- Check Gmail's "Sent" folder to confirm email was sent

## Support

If you continue to have issues:

1. Check the logs: `apps/api/logs/combined.log`
2. Look for detailed error messages with error codes
3. Contact your system administrator for help with email configuration
