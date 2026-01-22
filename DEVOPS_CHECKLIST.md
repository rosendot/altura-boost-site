# DevOps & Production Setup Checklist for Altura Boost

This checklist covers all infrastructure, configuration, and deployment requirements to run Altura Boost in production.

---

## Quick Overview

**Current Status:** ✅ Already deployed to production at https://www.alturaboost.com

**What's Missing:** Several critical configurations need to be completed for full functionality.

---

## Tech Stack Reminder

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Stripe (Checkout + Connect)
- **Deployment:** Vercel
- **Email:** AWS SES (needs setup)
- **Domain:** alturaboost.com

---

## 1. Domain & DNS Configuration

### Current Status
- [x] Domain registered: `alturaboost.com`
- [x] Site deployed to production
- [ ] DNS records for email deliverability (needed for AWS SES)

### Required DNS Records

**For Email (AWS SES - see Step 3):**
- [ ] DKIM records (3 CNAME records from AWS)
- [ ] Verification record (1 TXT record from AWS)
- [ ] SPF record (1 TXT record)
- [ ] DMARC record (1 TXT record)

**Where to add these:**
- Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- Navigate to DNS management
- Add records as provided by AWS SES

---

## 2. Supabase Configuration

### 2.1 Authentication Settings

**Status:** ⚠️ Partially configured, needs completion

**Site URL:**
- [ ] Set to: `https://www.alturaboost.com`
- Location: Supabase Dashboard → Authentication → URL Configuration

**Redirect URLs (Whitelist):**
- [ ] Add: `https://www.alturaboost.com/reset-password`
- [ ] Add: `https://www.alturaboost.com/auth/callback`
- [ ] Optional: Add `http://localhost:3000/reset-password` (for local testing)
- [ ] Optional: Add `http://localhost:3000/auth/callback` (for local testing)
- Location: Supabase Dashboard → Authentication → URL Configuration

### 2.2 Email Templates

**Status:** ⚠️ Needs configuration

**Password Reset Email:**
- [ ] Navigate to: Authentication → NOTIFICATIONS → Email
- [ ] Find "Reset Password" template
- [ ] Update subject: `Reset Your Password - Altura Boost`
- [ ] Update email body with branded template (see `SUPABASE_PASSWORD_RESET_SETUP.md`)

**Other Email Templates (Optional but Recommended):**
- [ ] Welcome email (for new users)
- [ ] Email confirmation (if enabled)
- [ ] Magic link email (if using passwordless login)

### 2.3 SMTP Configuration

**Status:** ❌ Not configured (critical for email functionality)

**Current State:** Using Supabase default SMTP (limited to ~4 emails/hour)

**Required:** Configure AWS SES as custom SMTP provider

- [ ] Set up AWS SES (see Step 3)
- [ ] Navigate to: Project Settings → Auth → SMTP Settings
- [ ] Enable Custom SMTP
- [ ] Enter AWS SES credentials:
  - SMTP Host: `email-smtp.us-east-1.amazonaws.com`
  - SMTP Port: `587`
  - SMTP Username: (from AWS SES)
  - SMTP Password: (from AWS SES)
  - Sender Email: `noreply@alturaboost.com`
  - Sender Name: `Altura Boost`

### 2.4 Storage Configuration (Already Done ✅)

Your storage is already configured for:
- Message attachments (images up to 5MB)
- Public bucket: `message-attachments`

**RLS Policies:** Already configured for authenticated users

---

## 3. AWS SES Setup (Email Delivery)

**Status:** ❌ Not set up (required for production email)

**Why Needed:**
- Password reset emails
- Order confirmations (future)
- Notification emails (future)
- Account verification emails

**Setup Guide:** See `SUPABASE_PASSWORD_RESET_SETUP.md` for detailed steps

### Quick Checklist:

- [ ] Create AWS account (if needed)
- [ ] Navigate to AWS SES Console
- [ ] Select region: `us-east-1` (US East - Virginia)
- [ ] Verify domain: `alturaboost.com`
  - [ ] Add DKIM records to DNS (3 CNAME records)
  - [ ] Add verification record to DNS (1 TXT record)
  - [ ] Wait 10-30 minutes for DNS propagation
  - [ ] Verify domain status shows "Verified"
- [ ] Request production access
  - [ ] Fill out use case form (transactional emails)
  - [ ] Submit request
  - [ ] Wait for approval (usually 24 hours)
- [ ] Create SMTP credentials
  - [ ] Save SMTP username (starts with `AKIA...`)
  - [ ] Save SMTP password (long string)
  - [ ] **IMPORTANT:** Save these securely, you cannot view them again
- [ ] Configure SMTP in Supabase (see 2.3 above)
- [ ] Add SPF record to DNS: `v=spf1 include:amazonses.com ~all`
- [ ] Add DMARC record to DNS: `v=DMARC1; p=none; rua=mailto:dmarc@alturaboost.com`
- [ ] Test email sending in Supabase

**Cost:** $0.10 per 1,000 emails (extremely cheap)

---

## 4. Stripe Configuration

### 4.1 Customer Payments (Stripe Checkout)

**Status:** ✅ Already configured

- [x] Stripe account created
- [x] Checkout integration implemented
- [x] Webhooks configured
- [ ] Verify webhook endpoint in production: `https://www.alturaboost.com/api/webhooks/stripe`
- [ ] Verify webhook signing secret is set in Vercel environment variables

### 4.2 Booster Payouts (Stripe Connect)

**Status:** ✅ Already configured

- [x] Stripe Connect Express integration implemented
- [x] Onboarding flow working
- [x] Payout system implemented
- [ ] Verify Connect webhook events are being received

### 4.3 Production vs Test Mode

**CRITICAL:** Make sure you're using the correct Stripe keys in production

**Test Mode (for development):**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

**Production Mode (for live site):**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

**Action Items:**
- [ ] Switch to live Stripe keys in Vercel environment variables
- [ ] Create production webhook endpoint in Stripe Dashboard
- [ ] Update `STRIPE_WEBHOOK_SECRET` with live webhook secret
- [ ] Test a real payment with live keys

---

## 5. Vercel Deployment Configuration

### 5.1 Environment Variables

**Status:** ⚠️ Verify all are set correctly

**Required Environment Variables:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://aiqthgvrpzikxlszylql.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (PRODUCTION KEYS)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
NEXT_PUBLIC_BASE_URL=https://www.alturaboost.com

# Game Credentials Encryption
CREDENTIAL_ENCRYPTION_KEY=[your-base64-key]
```

**Action Items:**
- [ ] Verify all environment variables are set in Vercel Dashboard
- [ ] Confirm production Stripe keys are being used (not test keys)
- [ ] Verify `NEXT_PUBLIC_BASE_URL` is `https://www.alturaboost.com`
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret (only use server-side)

### 5.2 Deployment Settings

- [ ] Verify automatic deployments from `main` branch
- [ ] Set up preview deployments for pull requests (optional)
- [ ] Configure custom domains in Vercel (already done ✅)
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set up deployment notifications (optional)

### 5.3 Performance & Monitoring

**Recommended Vercel Settings:**
- [ ] Enable Analytics (free tier available)
- [ ] Enable Speed Insights (optional)
- [ ] Set up error tracking (Sentry, LogRocket, or Vercel Logs)
- [ ] Configure caching headers for static assets

---

## 6. Database (Supabase)

### 6.1 RLS Policies

**Status:** ✅ Already configured

- [x] All tables have Row Level Security enabled
- [x] RLS policies for customers, boosters, and admins
- [x] Service role bypasses RLS (for webhooks)

### 6.2 Database Backups

**Status:** ⚠️ Verify backup schedule

- [ ] Check backup schedule in Supabase Dashboard
- [ ] Supabase Pro plan: Daily backups (automatic)
- [ ] Free tier: Manual backups recommended
- [ ] Test database restore process (recommended)

### 6.3 Database Monitoring

- [ ] Monitor database size (Supabase free tier: 500MB limit)
- [ ] Monitor active connections
- [ ] Set up alerts for errors (Supabase Dashboard → Logs)

---

## 7. Security Checklist

### 7.1 API Endpoints

**Status:** ✅ All 27 endpoints secured (see `SECURITY_AUDIT.md`)

- [x] Rate limiting implemented (all endpoints)
- [x] Input validation and sanitization
- [x] Audit logging for security events
- [x] Generic error messages (no information disclosure)

### 7.2 Authentication

- [x] Supabase Auth configured
- [x] Password requirements: min 8 characters
- [x] Password reset flow implemented
- [ ] Configure password reset with AWS SES
- [x] Role-based access control (RLS policies)

### 7.3 Secrets Management

**CRITICAL:** Never commit secrets to Git

- [x] `.env.local` in `.gitignore`
- [ ] Rotate API keys if ever exposed
- [ ] Store secrets in Vercel environment variables
- [ ] Use different keys for dev/staging/production

### 7.4 HTTPS & Security Headers

**Status:** ✅ Automatic with Vercel

- [x] HTTPS enabled (automatic)
- [ ] Verify security headers (CSP, X-Frame-Options, etc.)
- [ ] Consider adding security headers in `next.config.js`

---

## 8. Monitoring & Logging

### 8.1 Error Tracking

**Status:** ⚠️ Recommended to add

**Options:**
- Sentry (free tier: 5,000 errors/month)
- LogRocket (session replay + errors)
- Vercel Logs (basic logging)

**Action Items:**
- [ ] Choose error tracking service
- [ ] Install and configure
- [ ] Set up alerts for critical errors

### 8.2 Performance Monitoring

- [ ] Enable Vercel Analytics (free)
- [ ] Monitor page load times
- [ ] Track Core Web Vitals
- [ ] Monitor API response times

### 8.3 Database Logs

- [ ] Check Supabase Logs regularly
- [ ] Monitor slow queries
- [ ] Track authentication failures
- [ ] Review audit logs for suspicious activity

---

## 9. Email Deliverability

### 9.1 DNS Records (AWS SES)

**Status:** ❌ Needs setup

- [ ] DKIM records (AWS provides 3 CNAME records)
- [ ] SPF record: `v=spf1 include:amazonses.com ~all`
- [ ] DMARC record: `v=DMARC1; p=none; rua=mailto:dmarc@alturaboost.com`

### 9.2 Sender Reputation

**Best Practices:**
- [ ] Start with low email volume, gradually increase
- [ ] Monitor bounce rate (keep below 5%)
- [ ] Monitor complaint rate (keep below 0.1%)
- [ ] Never send marketing emails (only transactional)
- [ ] Avoid sudden spikes in email volume

### 9.3 Testing

- [ ] Send test password reset email
- [ ] Check spam folder initially
- [ ] Verify emails arrive in inbox (not spam)
- [ ] Test with multiple email providers (Gmail, Outlook, Yahoo)

---

## 10. Stripe Webhooks

### 10.1 Production Webhook Endpoint

**Status:** ⚠️ Verify configured correctly

**Steps:**
1. [ ] Go to Stripe Dashboard → Developers → Webhooks
2. [ ] Create webhook endpoint: `https://www.alturaboost.com/api/webhooks/stripe`
3. [ ] Select events to listen for:
   - [ ] `checkout.session.completed`
   - [ ] `payment_intent.payment_failed`
4. [ ] Copy webhook signing secret
5. [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
6. [ ] Test webhook delivery with Stripe CLI or test payment

### 10.2 Webhook Security

- [x] Signature verification implemented
- [ ] Verify endpoint is using HTTPS (automatic with Vercel)
- [ ] Monitor webhook delivery in Stripe Dashboard
- [ ] Set up alerts for webhook failures

---

## 11. Testing Checklist

Before going fully live, test all critical flows:

### 11.1 Customer Flow
- [ ] Sign up as customer
- [ ] Add services to cart
- [ ] Complete checkout (use test mode first)
- [ ] Verify order created in database
- [ ] Verify Stripe payment received

### 11.2 Booster Flow
- [ ] Apply as booster
- [ ] Admin approves application
- [ ] Connect bank account (test mode)
- [ ] Accept job from hub
- [ ] Complete job
- [ ] Admin triggers payout (test mode)
- [ ] Verify payout in Stripe Dashboard

### 11.3 Password Reset Flow
- [ ] Request password reset
- [ ] Receive email (check spam folder)
- [ ] Click reset link
- [ ] Set new password
- [ ] Log in with new password

### 11.4 Messaging System
- [ ] Send message as customer
- [ ] Reply as booster
- [ ] Upload image attachment
- [ ] Verify unread count updates
- [ ] Archive conversation

---

## 12. Client Communication Checklist

**What to tell your client:**

### Immediate Actions Needed

**1. AWS SES Setup (for email functionality)**
- **What:** Email service for password resets and notifications
- **Why:** Required for users to reset forgotten passwords
- **Cost:** $0.10 per 1,000 emails (~$1-2/month estimated)
- **Time:** ~1 hour setup + 24 hours for AWS approval
- **Your action:** You'll handle the technical setup, just need approval to proceed

**2. Domain DNS Access**
- **What:** Need to add email verification records
- **Why:** Proves you own alturaboost.com to AWS
- **Action:** Provide DNS management access or ask client to add records you provide

**3. Stripe Mode Verification**
- **What:** Confirm if using test or live Stripe keys
- **Why:** Live keys required for real payments
- **Action:** Verify with client if they want to go live with payments

### Optional but Recommended

**4. Error Tracking Service**
- **What:** Tool to catch bugs and errors in production
- **Why:** Helps you fix issues before users complain
- **Cost:** Free tier available (Sentry, LogRocket)
- **Action:** Ask client if they want proactive error monitoring

**5. Email Volume Estimates**
- **What:** How many users do they expect?
- **Why:** Helps plan AWS SES usage and costs
- **Action:** Ask for rough user count estimates

---

## 13. Priority Order

**Do these in order for fastest path to full production:**

### Week 1 (Critical)
1. ✅ Configure Supabase Site URL and Redirect URLs (5 minutes)
2. ✅ Configure Supabase Email Templates (10 minutes)
3. ✅ Set up AWS account (15 minutes)
4. ✅ Verify domain in AWS SES (30 minutes + DNS wait time)
5. ✅ Request AWS SES production access (5 minutes to submit)

### Week 2 (After AWS Approval)
6. ✅ Create AWS SES SMTP credentials (5 minutes)
7. ✅ Configure SMTP in Supabase (5 minutes)
8. ✅ Add SPF/DMARC DNS records (10 minutes)
9. ✅ Test password reset flow end-to-end (10 minutes)
10. ✅ Verify Stripe webhooks in production (10 minutes)

### Week 3 (Polish)
11. ⬜ Set up error tracking (Sentry/LogRocket) (30 minutes)
12. ⬜ Enable Vercel Analytics (5 minutes)
13. ⬜ Test all critical user flows (1 hour)
14. ⬜ Monitor logs for first week of production

---

## 14. Monthly Maintenance Checklist

**Once live, check these monthly:**

- [ ] Review error logs (Sentry/Vercel)
- [ ] Check database size (approaching limits?)
- [ ] Review AWS SES metrics (bounce/complaint rates)
- [ ] Check Stripe transaction logs
- [ ] Monitor Vercel bandwidth usage
- [ ] Review Supabase auth logs for suspicious activity
- [ ] Backup database (if not automatic)
- [ ] Update dependencies (`npm outdated`)

---

## 15. Cost Breakdown

**Monthly costs to expect:**

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Hobby | $0 (or $20/month Pro) |
| Supabase | Free | $0 (or $25/month Pro) |
| AWS SES | Pay-as-you-go | ~$0.10-$1/month |
| Stripe | Transaction fees | 2.9% + $0.30 per transaction |
| Domain | Annual | ~$12/year |

**Total estimated:** $0-$50/month depending on usage and tier choices

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **AWS SES Setup Guide:** `SUPABASE_PASSWORD_RESET_SETUP.md`
- **Security Audit:** `SECURITY_AUDIT.md`
- **Stripe Docs:** https://stripe.com/docs
- **Vercel Docs:** https://vercel.com/docs

---

**Last Updated:** 2026-01-07
