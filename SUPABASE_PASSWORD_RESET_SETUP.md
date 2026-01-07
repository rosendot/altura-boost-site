# Supabase Password Reset Configuration

This guide walks you through configuring Supabase to enable password reset functionality for your application.

---

## Prerequisites

- Supabase project already set up
- Access to Supabase Dashboard (https://supabase.com/dashboard)
- Your application deployed or running locally

---

## Step 1: Configure Email Templates in Supabase

### 1.1 Navigate to Email Templates

1. Go to your Supabase Dashboard
2. Select your project (`aiqthgvrpzikxlszylql` - Altura Boost)
3. Click on **Authentication** in the left sidebar
4. Click on **Email Templates**

### 1.2 Configure "Reset Password" Template

1. Find the **"Reset Password"** template in the list
2. Click on it to edit
3. Update the template with the following configuration:

**Subject Line:**
```
Reset Your Password - Altura Boost
```

**Email Body (HTML):**
```html
<h2>Reset Your Password</h2>

<p>Hi there,</p>

<p>You requested to reset your password for your Altura Boost account.</p>

<p>Click the button below to reset your password:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
    Reset Password
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours for security reasons.</p>

<p>If you didn't request this password reset, you can safely ignore this email.</p>

<p>Thanks,<br>The Altura Boost Team</p>
```

4. Click **Save** to apply the changes

---

## Step 2: Configure Redirect URLs

### 2.1 Navigate to URL Configuration

1. Still in **Authentication** section
2. Click on **URL Configuration** (or **Settings** → **Auth Settings**)

### 2.2 Add Site URL

**For Production:**
```
https://your-production-domain.com
```

**For Development (if testing locally):**
```
http://localhost:3000
```

### 2.3 Add Redirect URLs

Add the following URLs to the **Redirect URLs** list:

**For Production:**
```
https://your-production-domain.com/reset-password
https://your-production-domain.com/auth/callback
```

**For Development:**
```
http://localhost:3000/reset-password
http://localhost:3000/auth/callback
```

**Important:**
- Add **both** production and development URLs if you want to test locally
- Remove development URLs before going to production for security

4. Click **Save**

---

## Step 3: Configure Email Provider (SMTP)

By default, Supabase uses its own email service with rate limits. For production, you should configure your own SMTP provider.

### 3.1 Navigate to SMTP Settings

1. Go to **Project Settings** (gear icon)
2. Click **Auth**
3. Scroll down to **SMTP Settings**

### 3.2 Enable Custom SMTP (Recommended for Production)

**Option A: Use a Service (Recommended)**

Popular options:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 1000 emails/month)
- **AWS SES** (very cheap, $0.10 per 1000 emails)
- **Resend** (modern, developer-friendly)

**Option B: Use Gmail (For Testing Only)**

⚠️ **Not recommended for production** - Gmail has strict sending limits

If using Gmail for testing:
- Enable 2FA on your Google account
- Generate an "App Password" (not your regular password)
- Use the app password in SMTP settings

### 3.3 SMTP Configuration Example (SendGrid)

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Your SendGrid API Key]
Sender Email: noreply@your-domain.com
Sender Name: Altura Boost
```

### 3.4 Test Email Sending

1. After saving SMTP settings
2. Click **"Send Test Email"**
3. Check your inbox to confirm emails are working

---

## Step 4: Verify Environment Variables

Make sure your `.env.local` file has the correct Supabase variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://aiqthgvrpzikxlszylql.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## Step 5: Test the Password Reset Flow

### 5.1 Test Forgot Password

1. Navigate to `http://localhost:3000/login` (or your domain)
2. Click **"Forgot Password?"**
3. Enter a valid user email
4. Click **"Send Reset Link"**
5. You should see: "Password reset email sent!"

### 5.2 Check Email

1. Check the inbox for the email you entered
2. You should receive an email from Supabase (or your SMTP provider)
3. The email should have the subject: "Reset Your Password - Altura Boost"

### 5.3 Test Reset Link

1. Click the **"Reset Password"** button in the email
2. You should be redirected to: `http://localhost:3000/reset-password`
3. Enter your new password (min 8 characters)
4. Confirm the new password
5. Click **"Reset Password"**
6. You should see: "Password reset successful! Redirecting to login..."
7. After 2 seconds, you'll be redirected to the login page

### 5.4 Test Login with New Password

1. On the login page, enter your email
2. Enter the **new password** you just set
3. Click **"Login"**
4. You should be successfully logged in

---

## Troubleshooting

### Email Not Received

**Check Spam Folder**
- Password reset emails might end up in spam initially
- Mark as "Not Spam" to improve deliverability

**Check Rate Limits**
- Supabase default email service has rate limits
- Configure custom SMTP for production

**Verify Email Template**
- Make sure the template was saved correctly
- Check that `{{ .ConfirmationURL }}` is present

### Invalid or Expired Reset Link

**Link Expires After 24 Hours**
- Request a new reset link if expired

**Redirect URL Not Configured**
- Make sure you added the reset-password URL to **Redirect URLs**

**Wrong Domain**
- Verify the `redirectTo` URL in forgot-password page matches your actual domain

### Reset Page Shows "Invalid Session"

**Missing Token in URL**
- The email link should include authentication tokens
- If missing, check email template configuration

**Token Already Used**
- Reset tokens are single-use
- Request a new reset link

**Session Expired**
- Reset tokens expire after 24 hours
- Request a new reset link

---

## Security Considerations

### Production Checklist

- ✅ Use custom SMTP provider (not Supabase default)
- ✅ Remove development redirect URLs from production config
- ✅ Use HTTPS for all redirect URLs in production
- ✅ Monitor email sending rates to detect abuse
- ✅ Consider adding rate limiting on the forgot-password page
- ✅ Set up SPF, DKIM, and DMARC records for your domain (improves deliverability)

### Email Deliverability Tips

1. **Use a Custom Domain**
   - `noreply@altura-boost.com` instead of `noreply@supabase.co`

2. **Configure DNS Records**
   - SPF: Authorize your email provider to send on your behalf
   - DKIM: Sign emails to prove they're from you
   - DMARC: Tell receiving servers what to do with failed emails

3. **Warm Up Your Domain**
   - Start with low sending volumes
   - Gradually increase over time
   - Avoid sudden spikes in email volume

---

## Optional: Add Rate Limiting to Forgot Password Page

To prevent abuse, you can add client-side rate limiting:

```typescript
// In forgot-password/page.tsx
const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);
const RATE_LIMIT_MS = 60000; // 1 minute between requests

const handleSubmit = async (e: React.FormEvent) => {
  // Check rate limit
  const now = Date.now();
  if (lastRequestTime && now - lastRequestTime < RATE_LIMIT_MS) {
    const remainingSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastRequestTime)) / 1000);
    setError(`Please wait ${remainingSeconds} seconds before requesting another reset link.`);
    return;
  }

  // ... existing code ...

  setLastRequestTime(Date.now());
};
```

**Note:** This is client-side only. Supabase Auth has server-side rate limiting built-in.

---

## Next Steps

1. Complete the Supabase configuration steps above
2. Test the password reset flow end-to-end
3. Update email templates with your branding
4. Configure custom SMTP for production
5. Set up DNS records for email deliverability
6. Monitor password reset requests for abuse

---

## Support

If you encounter issues:

1. Check Supabase Dashboard → **Logs** for error messages
2. Verify environment variables are correct
3. Test with a different email address
4. Check browser console for JavaScript errors
5. Review Supabase Auth documentation: https://supabase.com/docs/guides/auth

---

**Last Updated:** 2026-01-07
