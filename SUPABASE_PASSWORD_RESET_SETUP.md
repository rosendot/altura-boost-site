# Supabase Password Reset Configuration

This guide walks you through configuring Supabase and AWS SES to enable password reset functionality for Altura Boost.

---

## Quick Start Checklist

Complete these steps in order:

- [ ] **Step 1**: Configure email template in Supabase (5 minutes)
- [ ] **Step 2**: Add redirect URLs in Supabase (2 minutes)
- [ ] **Step 3**: Set up AWS SES for email delivery (30-60 minutes)
  - [ ] Create AWS account (if needed)
  - [ ] Verify domain (alturaboost.com) with DNS records
  - [ ] Request production access (24-hour approval)
  - [ ] Create SMTP credentials
  - [ ] Configure SMTP in Supabase
  - [ ] Add SPF/DMARC DNS records
- [ ] **Step 4**: Test password reset flow end-to-end

**Total Time**: ~1 hour setup + 24 hours for AWS approval

---

## Prerequisites

- Supabase project already set up (`aiqthgvrpzikxlszylql` - Altura Boost)
- Access to Supabase Dashboard (https://supabase.com/dashboard)
- AWS account (or create one in Step 3)
- Access to your domain DNS settings (for alturaboost.com)
- Production site: https://www.alturaboost.com

---

## Step 1: Configure Email Templates in Supabase

### 1.1 Navigate to Email Templates

1. Go to your Supabase Dashboard
2. Select your project (`aiqthgvrpzikxlszylql` - Altura Boost)
3. Click on **Authentication** in the left sidebar
4. Scroll down to **NOTIFICATIONS** section
5. Click on **Email** (this is where email templates are now located)

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

Set your primary site URL:

**For Production (Altura Boost):**
```
https://www.alturaboost.com
```

**For Development (if testing locally):**
```
http://localhost:3000
```

**Choose one** as your primary Site URL (use production URL since you're already live).

### 2.3 Add Redirect URLs

Add the following URLs to the **Redirect URLs** list:

**For Production:**
```
https://www.alturaboost.com/reset-password
https://www.alturaboost.com/auth/callback
```

**For Development (if testing locally):**
```
http://localhost:3000/reset-password
http://localhost:3000/auth/callback
```

**Important:**
- Add **both** production and development URLs if you want to test locally
- Keep both since you're testing on production - just make sure both are in the list
- These URLs must be whitelisted for Supabase Auth to redirect to them

4. Click **Save**

---

## Step 3: Configure AWS SES (Simple Email Service)

For production, we're using **AWS SES** because it's the most cost-effective solution at scale ($0.10 per 1,000 emails) and provides unlimited scalability.

---

## AWS SES Setup Guide

### 3.1 Create AWS Account (if you don't have one)

1. Go to https://aws.amazon.com/
2. Click **"Create an AWS Account"**
3. Follow the signup process (requires credit card, but SES is very cheap)

---

### 3.2 Navigate to AWS SES

1. Sign in to AWS Console: https://console.aws.amazon.com/
2. In the search bar at the top, type **"SES"**
3. Click on **"Amazon Simple Email Service"**
4. **IMPORTANT**: Select your region (top-right corner)
   - Recommended: **US East (N. Virginia) us-east-1** (lowest cost)
   - Or choose the region closest to your users

---

### 3.3 Verify Your Domain (alturaboost.com)

**Why?** AWS requires you to verify you own the domain before sending emails from it.

1. In AWS SES Console, click **"Verified identities"** (left sidebar)
2. Click **"Create identity"**
3. Select **"Domain"**
4. Enter your domain: `alturaboost.com`
5. Check **"Use a default DKIM signing key pair"** (recommended)
6. Click **"Create identity"**

**You'll see DNS records to add:**

AWS will provide DNS records like these:

| Type  | Name                                    | Value                                      |
|-------|-----------------------------------------|--------------------------------------------|
| CNAME | abc123._domainkey.alturaboost.com      | abc123.dkim.amazonses.com                  |
| CNAME | xyz789._domainkey.alturaboost.com      | xyz789.dkim.amazonses.com                  |
| CNAME | def456._domainkey.alturaboost.com      | def456.dkim.amazonses.com                  |
| TXT   | _amazonses.alturaboost.com             | aBcDeFgHiJkLmNoPqRsTuVwXyZ=                |

**Add these records to your domain DNS:**

- Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- Add each DNS record exactly as shown in AWS
- **Wait 10-30 minutes** for DNS propagation
- Return to AWS SES and click **"Refresh status"**
- Status should change from "Pending" to **"Verified"** ✅

---

### 3.4 Request Production Access (IMPORTANT)

**By default, AWS SES is in "Sandbox Mode"** which limits you to:
- Only send to verified email addresses
- Max 200 emails per day

**To send to any email address (production):**

1. In AWS SES Console, click **"Account dashboard"** (left sidebar)
2. Look for **"Sending statistics"** section
3. Click **"Request production access"** button
4. Fill out the form:
   - **Mail type**: Transactional
   - **Website URL**: https://www.alturaboost.com
   - **Use case description**:
     ```
     We are a game boosting marketplace (Altura Boost) that sends transactional emails to our users:
     - Password reset emails when users forget their password
     - Order confirmation emails when customers purchase boosting services
     - Order completion emails when boosting jobs are finished
     - Account verification emails for new users

     All emails are opt-in and transactional (not marketing). We expect to send approximately 1,000-5,000 emails per month.
     ```
   - **Compliance**: Confirm you will only send to opted-in recipients
5. Click **"Submit request"**

**Processing Time**: Usually approved within **24 hours** (sometimes instantly)

**While waiting for approval**, you can still test by verifying individual email addresses:
1. Go to **"Verified identities"**
2. Click **"Create identity"**
3. Select **"Email address"**
4. Enter your email (e.g., `your-email@gmail.com`)
5. Check your inbox and click the verification link
6. Now you can send test emails to this address while in sandbox mode

---

### 3.5 Create SMTP Credentials

1. In AWS SES Console, click **"SMTP settings"** (left sidebar)
2. Click **"Create SMTP credentials"**
3. You'll be taken to IAM (Identity and Access Management)
4. Keep the default username (like `ses-smtp-user.20260107-123456`)
5. Click **"Create user"**
6. **IMPORTANT**: You'll see your SMTP credentials **ONCE**:
   - **SMTP Username**: (looks like `AKIAIOSFODNN7EXAMPLE`)
   - **SMTP Password**: (long string, looks like `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
7. Click **"Download credentials"** or copy them to a secure location
8. **DO NOT LOSE THESE** - You cannot view the password again

**Your SMTP settings** (copy these from the SES Console):

```
SMTP Endpoint: email-smtp.us-east-1.amazonaws.com
Port: 587 (or 465 for SSL)
SMTP Username: [Your SMTP Username from step 6]
SMTP Password: [Your SMTP Password from step 6]
```

---

### 3.6 Configure SMTP in Supabase

Now that you have AWS SES credentials, configure Supabase to use them:

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: **Altura Boost**
3. Click **Project Settings** (gear icon, bottom left)
4. Click **Auth** (left sidebar)
5. Scroll down to **SMTP Settings**
6. Click **"Enable Custom SMTP"**
7. Enter your AWS SES credentials:

```
SMTP Host: email-smtp.us-east-1.amazonaws.com
SMTP Port: 587
SMTP User: [Your SMTP Username]
SMTP Password: [Your SMTP Password]
Sender Email: noreply@alturaboost.com
Sender Name: Altura Boost
```

8. Click **"Save"**

---

### 3.7 Test Email Sending

1. In Supabase SMTP Settings, click **"Send Test Email"**
2. Enter your email address
3. Check your inbox (and spam folder)
4. You should receive a test email from `noreply@alturaboost.com`

**If you don't receive it:**
- Check your spam folder
- Verify your domain is verified in AWS SES (Step 3.3)
- If still in sandbox mode, verify your email address in AWS SES (Step 3.4)
- Check AWS SES logs in AWS Console → SES → "Sending statistics"

---

### 3.8 Set Up SPF and DMARC Records (Recommended)

To improve email deliverability and prevent your emails from going to spam:

**Add SPF Record** (if you don't have one):
```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all
```

**Add DMARC Record** (recommended):
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@alturaboost.com
```

**What this does:**
- **SPF**: Tells email providers that AWS SES is authorized to send emails on behalf of alturaboost.com
- **DMARC**: Provides reporting on email authentication (helps you monitor for spoofing)
- **DKIM**: Already configured automatically when you verified your domain in Step 3.3

Add these to your domain DNS (same place you added the verification records).

---

### 3.9 Monitor Email Sending

**AWS SES Dashboard** provides metrics:
1. Go to AWS Console → SES → **"Account dashboard"**
2. You'll see:
   - **Sends**: Total emails sent
   - **Bounces**: Failed deliveries (invalid emails)
   - **Complaints**: Users marked your email as spam
   - **Delivery rate**: Percentage successfully delivered

**Keep your bounce rate below 5%** and complaint rate below 0.1% to maintain good standing.

---

## AWS SES Pricing

**Extremely cost-effective:**
- **$0.10 per 1,000 emails** sent
- **$0.00 per email** received (if you set up receiving, which we're not)
- **First 62,000 emails per month are FREE** if you send from EC2 (not applicable here, but still very cheap)

**Examples:**
- 1,000 emails/month = **$0.10/month**
- 10,000 emails/month = **$1.00/month**
- 100,000 emails/month = **$10.00/month**

**No monthly fees, no minimums** - you only pay for what you send.

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
