# Security Audit Documentation

## Overview
This document tracks the security improvements made to the Altura Boost API endpoints.

**Last Updated:** 2026-01-03

---

## APIs Completed ✅

### `/api/admin/appeals/[appealId]` (PATCH) - Appeal Review

**Date Completed:** 2026-01-03

**Security Improvements Implemented:**
- ✅ Rate limiting (30 requests/hour per admin)
- ✅ Admin authentication and authorization
- ✅ Input validation (UUID format, status whitelist)
- ✅ Input sanitization (XSS prevention for admin notes, max 2000 chars)
- ✅ Audit logging (success/failure to database)
- ✅ Generic error messages (no information disclosure)
- ✅ State validation (prevents updating already-reviewed appeals)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Allows admins to approve/reject suspension appeals from suspended boosters.

**Rate Limit:** 30 requests per admin per hour

**Authentication:** Admin role required

**Audit Events Logged:**
- `auth_failure_appeal_review` - Authentication/authorization failures
- `appeal_approved` - Successful appeal approval
- `appeal_rejected` - Successful appeal rejection

---

### `/api/admin/appeals` (GET) - List All Appeals

**Date Completed:** 2026-01-03

**Security Improvements Implemented:**
- ✅ Rate limiting (100 requests/hour per admin)
- ✅ Admin authentication and authorization
- ✅ Audit logging for failed auth attempts
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Fetches all suspension appeals with user information for admin dashboard.

**Rate Limit:** 100 requests per admin per hour (higher limit for list endpoint)

**Authentication:** Admin role required

**Audit Events Logged:**
- `auth_failure_appeals_list` - Authentication/authorization failures
- `auth_failure_appeals_list` - Rate limit exceeded

**Data Returned:** Appeals with user details (email, name, suspension info) ordered by submission date

---

### `/api/admin/conversations` (GET) - List All Conversations

**Date Completed:** 2026-01-03

**Security Improvements Implemented:**
- ✅ Rate limiting (100 requests/hour per admin)
- ✅ Admin authentication and authorization
- ✅ Audit logging for failed auth attempts
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Fetches all conversations with job details, customer/booster info, and message stats for admin dashboard.

**Rate Limit:** 100 requests per admin per hour

**Authentication:** Admin role required

**Audit Events Logged:**
- `auth_failure_conversations_list` - Authentication/authorization failures
- `auth_failure_conversations_list` - Rate limit exceeded

**Data Returned:** Conversations with job info, customer/booster details, message counts, unread counts, and last message

---

### `/api/admin/payouts/initiate` (POST) - Initiate Booster Payout

**Date Completed:** 2026-01-03

**Security Improvements Implemented:**
- ✅ Rate limiting (50 requests/hour per admin - financial operations)
- ✅ Admin authentication and authorization
- ✅ Input validation (UUID format for jobId)
- ✅ Audit logging (payout success/failure, DB update failures)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Allows admins to initiate Stripe Connect payouts to boosters for completed jobs. Creates transaction records and Stripe transfers.

**Rate Limit:** 50 requests per admin per hour (lower limit for sensitive financial operations)

**Authentication:** Admin role required

**Audit Events Logged:**
- `auth_failure_payout_initiate` - Authentication/authorization failures
- `payout_initiated` - Successful payout (includes job_id, booster_id, amount, transfer_id)
- `payout_failed` - Failed Stripe transfer
- `payout_db_update_failed` - Transfer succeeded but DB update failed (manual reconciliation needed)

**Special Handling:**
- Validates job completion status before payout
- Checks for duplicate payouts
- Verifies booster has active Stripe Connect account
- Returns 207 status code if transfer succeeds but DB update fails (requires manual verification)

---

### `/api/admin/reviews` (GET) - List All Reviews

**Date Completed:** 2026-01-03

**Security Improvements Implemented:**
- ✅ Rate limiting (100 requests/hour per admin)
- ✅ Admin authentication and authorization
- ✅ Audit logging for failed auth attempts
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Fetches all job reviews with customer/booster details for admin dashboard. Includes ratings, review text, and flagged reviews requiring admin review.

**Rate Limit:** 100 requests per admin per hour

**Authentication:** Admin role required

**Audit Events Logged:**
- `auth_failure_reviews_list` - Authentication/authorization failures
- `auth_failure_reviews_list` - Rate limit exceeded

**Data Returned:** Reviews with job info, customer/booster details, ratings (overall, quality, communication, timeliness), review text, delivery status, flagged status, ordered by creation date

---

### `/api/admin/strikes/[strikeId]` (PATCH, DELETE) - Manage Strike

**Date Completed:** 2026-01-03

**Security Improvements Implemented:**
- ✅ Rate limiting (30 requests/hour per admin for both PATCH and DELETE)
- ✅ Admin authentication and authorization
- ✅ Input validation (UUID format for strikeId)
- ✅ Audit logging (strike deactivation and deletion)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:**
- **PATCH**: Deactivates a strike (sets `is_active = false`) without permanently deleting it
- **DELETE**: Permanently deletes a strike from the database

**Rate Limit:** 30 requests per admin per hour (moderate actions affecting booster records)

**Authentication:** Admin role required

**Audit Events Logged:**
- `auth_failure_strike_deactivate` / `auth_failure_strike_delete` - Authentication/authorization failures
- `strike_deactivated` - Successful strike deactivation (includes booster_id)
- `strike_deleted` - Successful strike deletion (includes booster_id)

**Special Handling:**
- Database triggers automatically update the user's `strike_count` after deactivation/deletion
- Both endpoints require valid UUID format for strikeId

---

### `/api/admin/strikes/booster/[boosterId]` (GET) - List Booster Strikes

**Date Completed:** 2026-01-03

**Security Improvements Implemented:**
- ✅ Rate limiting (100 requests/hour per admin)
- ✅ Admin authentication and authorization
- ✅ Input validation (UUID format for boosterId)
- ✅ Audit logging for failed auth attempts
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Fetches all strikes (active and inactive) for a specific booster, including strike details, severity, and associated job information.

**Rate Limit:** 100 requests per admin per hour (standard for list endpoints)

**Authentication:** Admin role required

**Audit Events Logged:**
- `auth_failure_strikes_list` - Authentication/authorization failures
- `auth_failure_strikes_list` - Rate limit exceeded

**Data Returned:** Strikes with reason, type, severity, active status, creation date, and associated job details (job_number, service_name, game_name), ordered by creation date

---

### `/api/admin/strikes` (POST) - Create Strike

**Date Completed:** 2026-01-03

**Security Improvements Implemented:**
- ✅ Rate limiting (30 requests/hour per admin)
- ✅ Admin authentication and authorization
- ✅ Input validation (UUID format for booster_id and job_id, reason length 10-500 chars)
- ✅ Input sanitization (XSS prevention for reason text)
- ✅ Audit logging (strike creation)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Allows admins to issue strikes to boosters for poor performance or policy violations. Creates strike record and automatically updates booster's strike count via database trigger.

**Rate Limit:** 30 requests per admin per hour (moderate for disciplinary actions)

**Authentication:** Admin role required

**Audit Events Logged:**
- `auth_failure_strike_create` - Authentication/authorization failures
- `strike_created` - Successful strike creation (includes booster_id, job_id, sanitized reason)

**Input Validation:**
- `booster_id`: Must be valid UUID, user must exist and have 'booster' role
- `job_id`: Must be valid UUID, job must exist
- `reason`: 10-500 characters, sanitized for XSS

**Special Handling:**
- Database triggers automatically increment user's `strike_count`
- Auto-suspends booster if `strike_count >= 3`
- Sets `can_appeal = true` for suspended boosters
- Records admin who issued the strike (`issued_by`)

---

### `/api/appeals/submit` (POST) - Submit Suspension Appeal

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (3 requests/24 hours per user - prevents spam/abuse)
- ✅ User authentication and booster role verification
- ✅ Input validation (appeal text length 50-5000 chars)
- ✅ Input sanitization (XSS prevention for appeal text)
- ✅ Audit logging (successful appeal submissions)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses
- ✅ State validation (checks suspension status, can_appeal flag, existing pending appeals)

**Endpoint Purpose:** Allows suspended boosters to submit appeals for review by admins. Creates appeal record and updates user's appeal status to pending.

**Rate Limit:** 3 requests per user per 24 hours (strict limit to prevent spam and abuse)

**Authentication:** Authenticated user with 'booster' role, must be suspended and eligible to appeal

**Audit Events Logged:**
- `auth_failure_appeal_submit` - Authentication failures, authorization failures, invalid states
- `appeal_submitted` - Successful appeal submission (includes appeal ID and text length)

**Input Validation:**
- `appeal_text`: Required, 50-5000 characters, sanitized for XSS
- User must be suspended booster with `can_appeal = true`
- User must not have existing pending appeal

**Special Handling:**
- Strict rate limiting (3 per day) prevents users from spamming appeals
- Validates user is suspended and eligible before allowing submission
- Prevents duplicate pending appeals
- Sanitizes appeal text to prevent XSS attacks
- Updates user's `appeal_status` to 'pending' after successful submission

---

### `/api/boosters/connect/disconnect` (POST) - Disconnect Stripe Connect Account

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (10 requests/24 hours per user - moderate for account changes)
- ✅ User authentication and booster role verification
- ✅ Audit logging (successful disconnections with previous account ID)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Allows boosters to disconnect their Stripe Connect bank account by removing the `stripe_connect_id` from their user record.

**Rate Limit:** 10 requests per user per 24 hours

**Authentication:** Authenticated user with 'booster' role

**Audit Events Logged:**
- `auth_failure_stripe_disconnect` - Authentication failures, role verification failures
- `stripe_connect_disconnected` - Successful disconnection (includes previous Connect ID)

**Special Handling:**
- Verifies user is a booster before allowing disconnection
- Logs the previous `stripe_connect_id` before removing it for audit trail

---

### `/api/boosters/connect/onboarding` (POST) - Create Stripe Connect Onboarding Link

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (20 requests/hour per user - prevents Stripe API abuse)
- ✅ User authentication and approved booster verification
- ✅ Audit logging (account creation and onboarding link generation)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Creates a Stripe Connect Express account (if needed) and generates an onboarding link for boosters to connect their bank account. Only approved boosters can access this endpoint.

**Rate Limit:** 20 requests per user per hour

**Authentication:** Authenticated user with 'booster' role and `booster_approval_status = 'approved'`

**Audit Events Logged:**
- `auth_failure_stripe_onboarding` - Authentication failures, approval status failures
- `stripe_connect_account_created` - New Stripe Connect account created (includes account ID)
- `stripe_onboarding_link_created` - Onboarding link generated (includes whether account already existed)

**Special Handling:**
- Only approved boosters can create onboarding links
- Creates Stripe Connect Express account on first use
- Saves `stripe_connect_id` to database for future reference
- Generates fresh onboarding link for existing accounts

---

### `/api/boosters/connect/status` (GET) - Check Stripe Connect Account Status

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (100 requests/hour per user - higher for read-only endpoint)
- ✅ User authentication and booster role verification
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Retrieves the current status of a booster's Stripe Connect account, including verification status, details submission, charges enabled status, and last 4 digits of connected bank account.

**Rate Limit:** 100 requests per user per hour (higher limit for read-only status checks)

**Authentication:** Authenticated user with 'booster' role

**Audit Events Logged:**
- `auth_failure_stripe_status` - Authentication failures, role verification failures

**Data Returned:**
- `connected`: Whether user has a Connect account
- `verified`: Whether account is fully verified (charges_enabled && details_submitted)
- `details_submitted`: Whether booster has submitted all required details
- `charges_enabled`: Whether account can receive transfers
- `bank_last4`: Last 4 digits of connected bank account (if available)

**Special Handling:**
- Returns empty status object if no Connect account exists
- Fetches live status from Stripe API for accurate verification info
- Only returns last 4 digits of bank account (PCI compliant)

---

### `/api/conversations/[conversationId]/messages` (GET, POST) - Fetch and Send Messages

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (GET: 200 requests/hour, POST: 100 requests/hour)
- ✅ User authentication and conversation ownership verification
- ✅ Input validation (UUID format for conversationId, message text 1-5000 chars)
- ✅ Input sanitization (XSS prevention for message text)
- ✅ Audit logging (failed auth attempts)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Allows conversation participants to fetch messages (GET) and send new messages (POST) in their conversations.

**Rate Limit:** GET: 200/hour (frequently polled), POST: 100/hour

**Authentication:** Authenticated user must be either customer or booster in the conversation

**Audit Events Logged:**
- `auth_failure_fetch_messages` / `auth_failure_send_message` - Authentication failures, ownership violations

**Input Validation:**
- `conversationId`: Must be valid UUID
- `text` (POST only): Required, 1-5000 characters, sanitized for XSS

**Special Handling:**
- Ownership verified by checking if user is customer_id or booster_id
- Automatically marks messages as read when fetched
- Updates conversation's last_message_at timestamp on send

---

### `/api/conversations/[conversationId]/upload` (POST) - Upload File Attachment

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (20 requests/hour - prevents upload abuse)
- ✅ User authentication and conversation ownership verification
- ✅ File type validation (images only: jpg, jpeg, png, gif, webp)
- ✅ File size validation (5MB maximum)
- ✅ Input validation (UUID format for conversationId, optional message text 1-500 chars)
- ✅ Input sanitization (XSS prevention for optional message text)
- ✅ Audit logging (failed auth attempts)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Allows conversation participants to upload image attachments with optional accompanying message text.

**Rate Limit:** 20 requests per user per hour

**Authentication:** Authenticated user must be either customer or booster in the conversation

**Audit Events Logged:**
- `auth_failure_upload` - Authentication failures, ownership violations

**Input Validation:**
- `conversationId`: Must be valid UUID
- File type: Must be image (jpg, jpeg, png, gif, webp)
- File size: Maximum 5MB
- `message` (optional): 1-500 characters if provided, sanitized for XSS

**Special Handling:**
- Uploads file to Supabase Storage in `conversation-uploads` bucket
- Creates message record with file_url
- Ownership verified before allowing upload

---

### `/api/conversations` (GET) - List All Conversations

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (100 requests/hour)
- ✅ User authentication
- ✅ Audit logging (failed auth attempts)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Fetches all active (non-archived) conversations for the authenticated user with job details, message counts, and unread counts.

**Rate Limit:** 100 requests per user per hour

**Authentication:** Authenticated user

**Audit Events Logged:**
- `auth_failure_conversations_list` - Authentication failures

**Data Returned:** Conversations where user is participant, with job info, unread message counts, and last message details. Filters out archived conversations based on user role.

---

### `/api/conversations/unread-count` (GET) - Get Unread Message Count

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (200 requests/hour - frequently polled endpoint)
- ✅ User authentication
- ✅ Audit logging (failed auth attempts)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Returns the total count of unread messages across all active conversations for the user.

**Rate Limit:** 200 requests per user per hour (higher limit for frequently polled endpoint)

**Authentication:** Authenticated user

**Audit Events Logged:**
- `auth_failure_unread_count` - Authentication failures

**Data Returned:** Total unread message count, excludes archived conversations based on user role

**Special Handling:**
- Higher rate limit due to frequent polling (e.g., badge notifications)
- Filters out archived conversations before counting
- Only counts messages sent by other users (not self)

---

### `/api/jobs/my-jobs` (GET) - List Booster's Jobs

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (100 requests/hour)
- ✅ User authentication
- ✅ Audit logging (failed auth attempts)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Fetches all jobs assigned to the authenticated booster, ordered by acceptance date.

**Rate Limit:** 100 requests per user per hour

**Authentication:** Authenticated user (booster)

**Audit Events Logged:**
- `auth_failure_my_jobs` - Authentication failures

**Data Returned:** Jobs assigned to the booster (booster_id matches user.id), ordered by accepted_at descending

---

### `/api/jobs/available` (GET) - List Available Jobs for Boosters

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (100 requests/hour)
- ✅ User authentication
- ✅ Suspension status check
- ✅ Audit logging (failed auth attempts, suspended user attempts)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Fetches all available jobs (status='available', no booster assigned) for boosters to claim.

**Rate Limit:** 100 requests per user per hour

**Authentication:** Authenticated user (not suspended)

**Audit Events Logged:**
- `auth_failure_available_jobs` - Authentication failures, suspended user attempts

**Special Handling:**
- Checks if user is suspended before showing available jobs
- Returns suspension reason if user is suspended (403 error)
- Only shows jobs with no booster assigned

---

### `/api/jobs/completed` (GET) - List Customer's Completed Jobs

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (100 requests/hour)
- ✅ User authentication
- ✅ Audit logging (failed auth attempts)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Fetches all completed jobs for the authenticated customer with review information.

**Rate Limit:** 100 requests per user per hour

**Authentication:** Authenticated user (customer)

**Audit Events Logged:**
- `auth_failure_completed_jobs` - Authentication failures

**Data Returned:** Customer's completed jobs (via order relationship), includes review information if available

---

### `/api/jobs/[jobId]/accept` (POST) - Accept Job

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (30 requests/hour)
- ✅ User authentication and booster role verification
- ✅ Input validation (UUID format for jobId)
- ✅ Stripe Connect verification (account must be verified)
- ✅ Atomic update (prevents race conditions)
- ✅ Audit logging (job acceptance, Stripe verification failures)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Allows approved boosters with verified Stripe Connect accounts to accept available jobs.

**Rate Limit:** 30 requests per user per hour

**Authentication:** Authenticated user with 'booster' role and verified Stripe Connect account

**Audit Events Logged:**
- `auth_failure_accept_job` - Authentication failures, invalid job ID, Stripe verification failures
- `job_accepted` - Successful job acceptance (includes job_id, booster_id)

**Input Validation:**
- `jobId`: Must be valid UUID
- User must have 'booster' role
- User must have Stripe Connect account with charges_enabled and details_submitted

**Special Handling:**
- Verifies Stripe Connect account status before allowing acceptance
- Uses atomic update to prevent multiple boosters accepting same job
- Creates conversation between customer and booster upon acceptance
- Returns specific error messages for Stripe verification failures

---

### `/api/jobs/[jobId]/progress` (PATCH) - Update Job Progress

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (50 requests/hour)
- ✅ User authentication and ownership verification
- ✅ Input validation (UUID format for jobId, progress 0-100, optional notes 1-1000 chars)
- ✅ Input sanitization (XSS prevention for notes)
- ✅ Audit logging (failed auth attempts, ownership violations)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Allows assigned boosters to update job progress percentage (0-100%) with optional notes.

**Rate Limit:** 50 requests per user per hour

**Authentication:** Authenticated user must be the assigned booster for the job

**Audit Events Logged:**
- `auth_failure_job_progress_update` - Authentication failures, ownership violations, invalid input

**Input Validation:**
- `jobId`: Must be valid UUID
- `progress_percentage`: Required, number 0-100
- `notes` (optional): 1-1000 characters if provided, sanitized for XSS

**Special Handling:**
- Automatically updates job status to 'in_progress' when progress > 0
- Automatically updates job status to 'completed' when progress = 100
- Sets completed_at timestamp when progress reaches 100%
- Logs progress updates to job_progress_updates table
- Ownership verified (user must be booster_id)

---

### `/api/jobs/[jobId]/review` (POST) - Submit Job Review

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (20 requests/hour)
- ✅ User authentication and customer ownership verification
- ✅ Input validation (UUID format for jobId, ratings 1-5, review text 1-2000 chars, delivery status whitelist)
- ✅ Input sanitization (XSS prevention for review text)
- ✅ Audit logging (failed auth attempts, ownership violations, invalid states)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Allows customers to submit reviews for completed jobs with ratings and feedback.

**Rate Limit:** 20 requests per user per hour

**Authentication:** Authenticated user must be the customer for the job (via order relationship)

**Audit Events Logged:**
- `auth_failure_job_review_submit` - Authentication failures, ownership violations, invalid input, duplicate reviews

**Input Validation:**
- `jobId`: Must be valid UUID
- `rating`: Required, number 1-5
- `quality_rating`, `communication_rating`, `timeliness_rating` (optional): Numbers 1-5 if provided
- `review_text` (optional): 1-2000 characters if provided, sanitized for XSS
- `delivery_status`: Required, must be 'complete', 'incomplete', or 'poor_quality'

**Special Handling:**
- Job must be in 'completed' status to review
- User must be the customer (verified via order.customer_id)
- Prevents duplicate reviews (only one review per job)
- All optional ratings validated if provided

---

### `/api/checkout/create-session` (POST) - Create Stripe Checkout Session

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (20 requests/hour - prevents checkout spam)
- ✅ User authentication
- ✅ Suspension status check
- ✅ Input validation (service IDs as UUIDs, cart items array, quantity 1-100, max 50 items)
- ✅ Service verification (all services must exist and be active)
- ✅ Price verification (fetches current prices from database, not client)
- ✅ Audit logging (failed auth attempts, suspended users, invalid input)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** **CRITICAL PAYMENT ENDPOINT** - Creates Stripe Checkout session for cart items with server-side price verification.

**Rate Limit:** 20 requests per user per hour (prevents checkout spam and Stripe API abuse)

**Authentication:** Authenticated user (not suspended)

**Audit Events Logged:**
- `auth_failure_checkout_create_session` - Authentication failures, suspended users, invalid input

**Input Validation:**
- `cartItems`: Required, must be array with 1-50 items
- Each item `serviceId`: Must be valid UUID
- Each item `quantity`: Must be number 1-100
- All services must exist and be active in database

**Special Handling:**
- **CRITICAL**: Fetches prices from database, not from client (prevents price manipulation)
- Verifies all services exist and are active before checkout
- Creates Stripe customer if user doesn't have one
- Suspended users cannot create checkout sessions
- Returns Stripe checkout URL for redirection

---

### `/api/orders/my-orders` (GET) - List Customer Orders

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (100 requests/hour)
- ✅ User authentication
- ✅ Audit logging (failed auth attempts)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Fetches all orders for the authenticated customer with associated jobs and booster information.

**Rate Limit:** 100 requests per user per hour

**Authentication:** Authenticated user (customer)

**Audit Events Logged:**
- `auth_failure_my_orders` - Authentication failures

**Data Returned:** Customer's orders (customer_id matches user.id) with jobs grouped by order, includes booster details (name, email) for assigned jobs, ordered by creation date descending

---

### `/api/reviews/my-reviews` (GET) - List Booster's Reviews

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (100 requests/hour)
- ✅ User authentication
- ✅ Audit logging (failed auth attempts)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Fetches all reviews received by the authenticated booster with job and customer information.

**Rate Limit:** 100 requests per user per hour

**Authentication:** Authenticated user (booster)

**Audit Events Logged:**
- `auth_failure_my_reviews` - Authentication failures

**Data Returned:** Reviews for booster (booster_id matches user.id) with ratings (overall, quality, communication, timeliness), review text, delivery status, job details, and customer information, ordered by creation date descending

---

### `/api/user/me` (GET) - Get User Profile

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (200 requests/hour - frequently accessed endpoint)
- ✅ User authentication
- ✅ Audit logging (failed auth attempts)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Fetches the authenticated user's profile information including role, suspension status, earnings, and approval status.

**Rate Limit:** 200 requests per user per hour (higher limit for frequently accessed endpoint)

**Authentication:** Authenticated user

**Audit Events Logged:**
- `auth_failure_user_profile` - Authentication failures

**Data Returned:** User profile with email, full_name, role, phone, created_at, total_earnings, booster_approval_status, suspension info (is_suspended, suspended_at, suspension_reason), appeal info (can_appeal, appeal_status), strike_count

**Special Handling:**
- Higher rate limit due to frequent access (dashboard, profile pages)
- Returns comprehensive user state for client-side authorization

---

### `/api/user/update-password` (POST) - Update User Password

**Date Completed:** 2026-01-07

**Security Improvements Implemented:**
- ✅ Rate limiting (10 requests/hour - sensitive security operation)
- ✅ User authentication
- ✅ Current password verification (prevents unauthorized password changes)
- ✅ Input validation (password length 8-72 characters, type checking)
- ✅ Audit logging (failed attempts, invalid input)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** Allows authenticated users to change their account password after verifying their current password.

**Rate Limit:** 10 requests per user per hour (strict limit for sensitive security operation)

**Authentication:** Authenticated user

**Audit Events Logged:**
- `auth_failure_update_password` - All failures (rate limit, missing fields, invalid input, incorrect current password, update failures)

**Input Validation:**
- `currentPassword`: Required, string type
- `newPassword`: Required, string type, 8-72 characters
- Verifies current password by attempting sign-in with provided credentials
- Prevents password changes without knowing current password

**Special Handling:**
- **CRITICAL**: Verifies current password before allowing update (prevents unauthorized access)
- Lower rate limit (10/hour) prevents brute force attacks on current password
- Uses Supabase Auth `updateUser()` for secure password update
- Password requirements: 8-72 characters (standard bcrypt limit)
- Generic error messages don't reveal whether current password was correct

---

### `/api/webhooks/stripe` (POST) - Stripe Webhook Handler

**Date Completed:** 2026-01-06

**Security Improvements Implemented:**
- ✅ Rate limiting (500 requests/hour - IP-based for webhook traffic)
- ✅ Signature verification (Stripe webhook signatures - **PRIMARY SECURITY**)
- ✅ Generic error messages (no information disclosure)
- ✅ Rate limit headers in responses

**Endpoint Purpose:** **CRITICAL PAYMENT ENDPOINT** - Handles Stripe webhook events for checkout completions and payment failures.

**Rate Limit:** 500 requests per hour (IP-based, high limit for legitimate webhook traffic)

**Authentication:** Stripe webhook signature verification (no user auth - webhooks come from Stripe)

**Special Handling:**
- **CRITICAL**: Signature verification using Stripe webhook secret (prevents spoofing)
- IP-based rate limiting (no user context for webhooks)
- Uses service role client (bypasses RLS) for database operations
- Handles `checkout.session.completed` - creates order and order items
- Handles `payment_intent.payment_failed` - placeholder for future failure handling
- Logs webhook signature verification failures

**Events Handled:**
- `checkout.session.completed`: Creates order and order items from session line items
- `payment_intent.payment_failed`: Future handling for payment failures

---

## APIs Left to Audit

### Priority 1: Admin Endpoints
✅ **All Priority 1 admin endpoints completed!**

### Priority 2: User-Facing Endpoints (High Priority)
✅ **All Priority 2 endpoints completed!**
- ✅ `/api/appeals/submit` - Appeal submission (COMPLETED)
- ✅ `/api/boosters/connect/disconnect` - Stripe disconnect (COMPLETED)
- ✅ `/api/boosters/connect/onboarding` - Stripe onboarding (COMPLETED)
- ✅ `/api/boosters/connect/status` - Stripe status check (COMPLETED)
- ✅ `/api/conversations/[conversationId]/messages` - Messages (COMPLETED)
- ✅ `/api/conversations/[conversationId]/upload` - File uploads (COMPLETED)
- ✅ `/api/conversations` - Conversations list (COMPLETED)
- ✅ `/api/conversations/unread-count` - Unread count (COMPLETED)
- ✅ `/api/jobs/my-jobs` - Booster jobs (COMPLETED)
- ✅ `/api/jobs/available` - Available jobs (COMPLETED)
- ✅ `/api/jobs/completed` - Completed jobs (COMPLETED)
- ✅ `/api/jobs/[jobId]/accept` - Accept job (COMPLETED)
- ✅ `/api/jobs/[jobId]/progress` - Update progress (COMPLETED)
- ✅ `/api/jobs/[jobId]/review` - Submit review (COMPLETED)
- ✅ `/api/checkout/create-session` - Checkout (COMPLETED)
- ✅ `/api/orders/my-orders` - Customer orders (COMPLETED)
- ✅ `/api/reviews/my-reviews` - Booster reviews (COMPLETED)
- ✅ `/api/user/me` - User profile (COMPLETED)
- ✅ `/api/user/update-password` - Password update (COMPLETED)
- ✅ `/api/webhooks/stripe` - Stripe webhooks (COMPLETED)

### Priority 3: Auth Endpoints (Handled by Supabase Auth)
- ✅ Login - Handled by Supabase Auth client-side (`supabase.auth.signInWithPassword()`)
- ✅ Signup - Handled by Supabase Auth client-side (`supabase.auth.signUp()`)
- ✅ Password Update - Secured via `/api/user/update-password` endpoint (COMPLETED)
- ✅ Password Reset/Forgot Password - Implemented using Supabase Auth password recovery (COMPLETED)
  - Forgot Password page: `/forgot-password`
  - Reset Password page: `/reset-password`
  - Uses `supabase.auth.resetPasswordForEmail()` with secure email links
  - Configuration required in Supabase Dashboard (see `SUPABASE_PASSWORD_RESET_SETUP.md`)

**Note**: Authentication is managed by Supabase Auth, which already includes rate limiting, account lockout, and security best practices at the Supabase level. No custom API endpoints needed for login/signup.

**Password Reset Security:**
- Email-based password reset with secure tokens
- Reset links expire after 24 hours
- Tokens are single-use (cannot be reused)
- Redirect URLs must be whitelisted in Supabase
- Client-side validation (min 8 characters, password confirmation)
- No custom API needed - handled by Supabase Auth

---

## Security Improvements Implemented on Every API

These security measures are consistently applied across all audited endpoints:

### 1. Rate Limiting
- In-memory implementation (planned upgrade to Upstash Redis)
- Configurable limits per endpoint
- Returns standard rate limit headers
- Prevents abuse and brute force attacks

### 2. Authentication & Authorization
- User authentication via Supabase auth
- Role-based access control (admin, booster, customer)
- Proper authorization checks before operations

### 3. Input Validation
- UUID format validation for resource IDs
- Whitelist validation for enums/status fields
- Length validation for text inputs
- Type checking for all parameters

### 4. Input Sanitization
- XSS prevention (HTML tag removal, special character encoding)
- SQL injection prevention (via Supabase parameterized queries)
- Maximum length enforcement

### 5. Audit Logging
- All security-sensitive actions logged to database
- Failed authentication attempts tracked
- Success/failure status recorded
- IP address and user agent captured
- Admin-only access via RLS policies

### 6. Error Handling
- Generic client-facing error messages
- No information disclosure in responses
- Minimal generic server-side logging
- Detailed errors only in audit_logs database

---

## Remaining Security Considerations

### Immediate Actions
1. ⚠️ **Upgrade rate limiting to Upstash Redis** before production launch
2. ⚠️ **Review and enable RLS policies** for all admin tables beyond audit_logs

### Future Enhancements
1. **2FA for Admin Accounts** - High Priority
2. **Account Lockout** - After X failed login attempts (auth endpoints)
3. **CSRF Protection** - For all state-changing operations
4. **Security Headers** - CSP, X-Frame-Options, X-Content-Type-Options (middleware)
5. **IP Whitelisting** - Optional for admin panel
6. **Session Management** - Review session timeouts and refresh logic

---

## Security Utilities Created

All utilities are reusable across API endpoints and follow security best practices.

### 1. Rate Limiter (`src/lib/security/rate-limit.ts`)

**Current Implementation:** In-memory Map with automatic cleanup

**Features:**
- Configurable limits per endpoint
- Automatic cleanup of expired entries
- Returns standard rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- Per-user rate limiting

**Current Limitations:**
- ⚠️ Resets on deployment (Vercel serverless)
- ⚠️ Doesn't persist across serverless instances
- ⚠️ Fine for MVP/low traffic, but not production-ready

**Planned Upgrade: Upstash Redis**
- ✅ Serverless-friendly (HTTP-based)
- ✅ Persistent across deployments
- ✅ Works across multiple instances
- ✅ Free tier: 10k commands/day
- ✅ Drop-in replacement (~10 min migration)
- **When:** Before production launch or when traffic exceeds ~100 users/day

**Migration Plan:**
1. Sign up at upstash.com
2. Create Redis database
3. Add env vars: `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`
4. Replace in-memory Map with Upstash client
5. No API changes needed - rate limiting already works

**Usage Example:**
```typescript
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';

const rateLimitResult = checkRateLimit(userId, {
  maxRequests: 30,
  windowMs: 60 * 60 * 1000, // 1 hour
  identifier: 'appeal_review',
});

if (!rateLimitResult.allowed) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
  );
}
```

---

### 2. Input Validator (`src/lib/security/validation.ts`)

**Features:**
- UUID format validation
- Email format validation
- String sanitization (XSS prevention)
- Length validation
- Whitelist validation
- Required fields validation

**Key Functions:**
- `isValidUUID(id)` - Validates UUID format
- `isValidEmail(email)` - Validates email format
- `sanitizeString(input)` - Removes HTML tags, encodes special characters
- `isValidLength(input, min, max)` - Checks string length
- `isInAllowedValues(input, allowedValues)` - Whitelist validation
- `validateAdminNotes(notes)` - Validates and sanitizes admin notes (max 2000 chars)

**Usage Example:**
```typescript
import { isValidUUID, isInAllowedValues, validateAdminNotes } from '@/lib/security/validation';

if (!isValidUUID(appealId)) {
  return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
}

if (!isInAllowedValues(status, ['approved', 'rejected'])) {
  return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
}

const sanitizedNotes = validateAdminNotes(admin_notes);
```

---

### 3. Audit Logger (`src/lib/security/audit-logger.ts`)

**Features:**
- Console logging (immediate visibility)
- Database logging with RLS policies
- IP address tracking
- User agent tracking
- Action categorization
- Non-blocking (errors don't fail main operation)
- Secure error logging (no sensitive data exposure)

**Key Functions:**
- `logAuthFailure(userId, action, reason, request)` - Logs failed auth attempts
- `logAdminAction(adminId, adminEmail, action, resourceType, resourceId, details, request)` - Logs admin actions

**Database Table:** `audit_logs`
- RLS enabled: INSERT for authenticated users, SELECT for admins only
- Indexed on: `actor_id`, `resource_type + resource_id`, `created_at`

**Usage Example:**
```typescript
import { logAuthFailure, logAdminAction } from '@/lib/security/audit-logger';

// Log failed auth
await logAuthFailure(userId, 'appeal_review', 'User is not admin', request);

// Log successful action
await logAdminAction(
  adminId,
  adminEmail,
  'appeal_approved',
  'suspension_appeal',
  appealId,
  { affected_user_id: userId },
  request
);
```

---

### 4. Error Handling (`src/lib/security/error-handling.ts`)

**Philosophy:** Minimal generic logging - debug issues locally by reproducing them

**Features:**
- Generic client-facing error messages
- Minimal server-side logging (no information disclosure)
- Context-aware error patterns
- Best practices documentation

**Key Functions:**
- `getGenericErrorMessage(errorType)` - Returns safe client messages
- `logSecureError(message)` - Logs generic message only
- `SecureErrorPatterns` - Reusable error patterns

**Usage Example:**
```typescript
import { SecureErrorPatterns } from '@/lib/security/error-handling';

if (updateError) {
  console.error('Database operation failed');
  return NextResponse.json(
    { error: 'Failed to update appeal' },
    { status: 500 }
  );
}
```

---

## Secure Error Handling Best Practices

### Philosophy: Minimal Generic Logging

Server logs can be compromised, so we log **ONLY** generic messages. Debug issues locally by reproducing them.

### Information Disclosure Prevention

**CRITICAL RULES:**
1. **Never expose database errors** to clients (SQL errors, constraint violations, schema info)
2. **Never include stack traces** in API responses
3. **Never log sensitive data** (passwords, tokens, API keys, session IDs)
4. **Never expose file paths** or system information
5. **Never reveal user enumeration** (e.g., "user exists" vs "user not found")

---

### Client-Facing Error Messages

**Always use generic messages:**
- ✅ "Failed to update appeal"
- ✅ "Authentication failed"
- ✅ "Invalid input"
- ✅ "Too many requests"
- ❌ "Unique constraint violation on email"
- ❌ "Error in /api/admin/appeals: Cannot read property..."
- ❌ "Database connection failed at 192.168.1.5:5432"

---

### Server-Side Logging

**Use minimal generic messages:**
```typescript
// ✅ GOOD - Generic, no information disclosure
console.error('Database operation failed');

// ❌ BAD - Exposes IDs, timestamps, or context
console.error('Appeal update failed:', {
  appealId,
  adminId: user.id,
  timestamp: new Date().toISOString(),
});

// ❌ BAD - Exposes database internals
console.error('Error updating appeal:', updateError);
```

**All console.error calls should follow this minimal pattern:**
```typescript
// Generic message only - no context, no IDs, no timestamps
console.error('<generic operation type> failed');
```

**Examples:**
- `console.error('Database operation failed');`
- `console.error('User update operation failed');`
- `console.error('Unexpected error occurred');`

---

### What NOT to Log (ANYTHING Specific)
- Database error objects
- Stack traces
- UUIDs or resource IDs
- User IDs
- Timestamps
- IP addresses
- User agents
- Email addresses
- Endpoint paths
- API keys or secrets
- File system paths
- Any contextual information

---

### What to Log (Generic Only)
- Generic operation type (e.g., "Database operation", "User update")
- Generic error category (e.g., "failed", "error occurred")
- **Nothing else**

---

### Debugging Strategy
1. **Production:** Generic logs only, use `audit_logs` database table for investigation
2. **Local Development:** Reproduce the issue with full error details
3. **Emergency:** Query `audit_logs` table (RLS-protected, admin-only access)

---

## Testing Recommendations

### Rate Limit Testing
1. Make N+1 requests within the time window (e.g., 31 requests in 1 hour)
2. Verify the last request returns 429 Too Many Requests
3. Verify rate limit headers are present:
   - `X-RateLimit-Limit`
   - `X-RateLimit-Remaining`
   - `X-RateLimit-Reset`

### Input Validation Testing
1. Send invalid UUIDs for resource IDs
2. Send invalid status values outside whitelist
3. Send XSS payloads in text fields
4. Send text exceeding maximum length
5. Send missing required fields

### Authorization Testing
1. Test with non-admin user (should return 403)
2. Test with unauthenticated request (should return 401)
3. Test with valid admin (should succeed)

### Audit Logging Testing
1. Verify logs appear in console for all actions
2. Query `audit_logs` table to verify database logging
3. Check IP address and user agent are captured
4. Verify only admins can read audit logs (RLS test)

---

## Notes

- All security utilities are reusable across other API endpoints
- Rate limiter uses in-memory storage (upgrade to Upstash Redis before production)
- Audit logs are stored in database with RLS policies (admin-only access)
- Error logging is minimal and generic (no information disclosure)
- Detailed action tracking available in `audit_logs` table for investigation
