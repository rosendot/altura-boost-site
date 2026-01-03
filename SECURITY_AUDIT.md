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

## APIs Left to Audit

### Priority 1: Admin Endpoints
✅ **All Priority 1 admin endpoints completed!**

### Priority 2: Authentication Endpoints (Critical)
- [ ] Login endpoint - Add rate limiting, account lockout, 2FA
- [ ] Signup endpoint - Add rate limiting, input validation
- [ ] Password reset - Add rate limiting, token validation

### Priority 3: Other Endpoints
- [ ] `/api/conversations/[conversationId]/messages` - Validate ownership
- [ ] Customer endpoints - Input validation, rate limiting
- [ ] Booster endpoints - Input validation, rate limiting

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
  console.error('[SECURE] Database operation failed');
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
console.error('[SECURE] Database operation failed');

// ❌ BAD - Exposes IDs, timestamps, or context
console.error('[SECURE] Appeal update failed:', {
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
console.error('[SECURE] <generic operation type> failed');
```

**Examples:**
- `console.error('[SECURE] Database operation failed');`
- `console.error('[SECURE] User update operation failed');`
- `console.error('[SECURE] Unexpected error occurred');`

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
