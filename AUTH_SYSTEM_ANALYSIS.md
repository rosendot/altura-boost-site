# Authentication & Application System Analysis

**Generated:** 2025-12-14
**Updated:** 2025-12-14 (After implementing Option 2 fix)
**Purpose:** Complete documentation of the signup, login, and booster application process

---

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Database Functions](#database-functions)
4. [Database Triggers](#database-triggers)
5. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
6. [API Routes](#api-routes)
7. [Frontend Pages](#frontend-pages)
8. [Flow Diagrams](#flow-diagrams)
9. [Recent Changes & Fixes](#recent-changes--fixes)

---

## Overview

The system handles three types of user signups:
- **Customer Signup**: Standard user accounts that can purchase services
- **Booster Signup**: Application-based accounts that require admin approval
- **Admin**: Manually created accounts with full system access

### Key Tables
- `auth.users` - Supabase Auth table (login credentials)
- `public.users` - User profile data (extended information)
- `public.booster_applications` - Booster application submissions

### **NEW FLOW (Fixed):**
Booster applicants now get a `public.users` record immediately with:
- `role = 'booster'`
- `booster_approval_status = 'pending'`

This eliminates the "limbo state" where users could log in but couldn't use the app.

---

## Database Schema

### `auth.users` (Supabase Managed)
**Purpose:** Stores authentication credentials and session data

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `email` | varchar | User email (unique) |
| `encrypted_password` | varchar | Hashed password |
| `raw_user_meta_data` | jsonb | Contains `{full_name, role}` from signup |
| `raw_app_meta_data` | jsonb | Contains `{role}` synced from public.users |
| `email_confirmed_at` | timestamptz | Email verification timestamp |
| `created_at` | timestamptz | Account creation timestamp |

**Relationships:**
- Referenced by `public.users.id` (FK)
- Referenced by `public.booster_applications.user_id` (FK)

---

### `public.users`
**Purpose:** Extended user profile data and role management

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | uuid | - | NO | FK to auth.users.id |
| `email` | text | - | NO | User email (unique) |
| `full_name` | text | - | YES | Display name |
| `phone` | text | - | YES | Contact number |
| `role` | user_role | 'customer' | NO | 'customer', 'booster', or 'admin' |
| `stripe_customer_id` | text | - | YES | Stripe customer ID (for payments) |
| `stripe_connect_id` | text | - | YES | Stripe Connect ID (for payouts) |
| `booster_approval_status` | booster_status | - | YES | 'pending', 'approved', or 'rejected' |
| `total_earnings` | numeric | 0 | YES | Lifetime earnings (boosters only) |
| `created_at` | timestamptz | now() | YES | Record creation time |
| `updated_at` | timestamptz | now() | YES | Last update time |

**Constraints:**
- Primary Key: `id`
- Unique: `email`
- Foreign Key: `id` → `auth.users.id` (ON DELETE CASCADE)

**Enums:**
```sql
user_role: 'customer' | 'booster' | 'admin'
booster_status: 'pending' | 'approved' | 'rejected'
```

**Key Point:** `booster_approval_status` is now used to gate booster permissions, not `role`.

---

### `public.booster_applications`
**Purpose:** Tracks booster application submissions and review process

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | Primary key |
| `user_id` | uuid | - | YES | FK to auth.users.id (applicant) |
| `questionnaire_responses` | jsonb | - | NO | Application form answers |
| `status` | booster_status | 'pending' | NO | Application status |
| `reviewed_at` | timestamptz | - | YES | Review timestamp |
| `reviewed_by` | uuid | - | YES | FK to public.users.id (admin) |
| `rejection_reason` | text | - | YES | Reason if rejected |
| `submitted_at` | timestamptz | now() | YES | Submission timestamp |
| `created_at` | timestamptz | now() | YES | Record creation time |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `user_id` → `auth.users.id` (ON DELETE CASCADE)
- Foreign Key: `reviewed_by` → `public.users.id`

**Note:** References `auth.users.id` directly (not `public.users.id`) to allow applications to exist before approval.

---

## Database Functions

### 1. `handle_new_user()` ⭐ UPDATED
**Type:** Trigger Function
**Security:** DEFINER
**Triggered On:** `auth.users` AFTER INSERT

**Purpose:** Automatically creates records when a new user signs up

**NEW Logic:**
```sql
DECLARE user_role TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');

  -- For customers/admins: create public.users immediately
  IF user_role IN ('customer', 'admin') THEN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      user_role::user_role
    );
  END IF;

  -- For boosters: create public.users WITH pending status + application
  IF user_role = 'booster' THEN
    -- Create public.users record with pending status
    INSERT INTO public.users (id, email, full_name, role, booster_approval_status)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'booster'::user_role,
      'pending'::booster_status
    );

    -- Create booster application
    INSERT INTO public.booster_applications (user_id, status, questionnaire_responses)
    VALUES (
      NEW.id,
      'pending'::booster_status,
      '{}'::jsonb
    );
  END IF;

  RETURN NEW;
END;
```

**Flow:**
1. User signs up via `auth.signUp()`
2. Trigger fires AFTER row inserted in `auth.users`
3. Extracts `role` from `raw_user_meta_data`
4. **If customer/admin:** Creates `public.users` record (role set, no approval status)
5. **If booster:** Creates `public.users` (role='booster', status='pending') + `booster_applications`

---

### 2. `handle_booster_application()`
**Type:** Trigger Function
**Security:** DEFINER
**Triggered On:** `public.users` AFTER INSERT

**Purpose:** Legacy function - creates booster application when user is inserted with role='booster'

**Logic:**
```sql
BEGIN
  IF NEW.role = 'booster' THEN
    INSERT INTO public.booster_applications (user_id, status, questionnaire_responses)
    VALUES (
      NEW.id,
      'pending',
      '{}'::jsonb
    );
  END IF;
  RETURN NEW;
END;
```

**Current State:** This trigger still fires but creates a duplicate application. Should be removed or handled.

⚠️ **TODO:** Consider dropping this trigger since `handle_new_user()` now creates the application.

---

### 3. `sync_user_role_to_auth()`
**Type:** Trigger Function
**Security:** DEFINER
**Triggered On:** `public.users` AFTER INSERT OR UPDATE OF role

**Purpose:** Syncs role from `public.users.role` to `auth.users.raw_app_meta_data.role`

**Logic:**
```sql
BEGIN
  PERFORM set_user_role_claim(NEW.id, NEW.role::text);
  RETURN NEW;
END;
```

**Calls:** `set_user_role_claim(user_id, user_role)`

---

### 4. `set_user_role_claim(user_id, user_role)`
**Type:** Function
**Security:** DEFINER
**Returns:** void

**Purpose:** Updates `auth.users.raw_app_meta_data` with role for JWT claims

**Logic:**
```sql
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    raw_app_meta_data || json_build_object('role', user_role)::jsonb
  WHERE id = user_id;
END;
```

**Why:** Allows role to be available in JWT tokens via `auth.jwt()` for RLS policies

---

### 5. `handle_booster_deletion()`
**Type:** Trigger Function
**Triggered On:** `public.jobs` BEFORE UPDATE

**Purpose:** Resets job status when booster is unassigned

**Logic:**
```sql
BEGIN
  IF OLD.booster_id IS NOT NULL AND NEW.booster_id IS NULL THEN
    NEW.status = 'available';
    NEW.accepted_at = NULL;
  END IF;
  RETURN NEW;
END;
```

**Relevance:** Not directly related to auth/signup, but part of job management

---

## Database Triggers

### Active Triggers

| Trigger Name | Table | Event | Function | Description |
|--------------|-------|-------|----------|-------------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user()` ⭐ | Creates public.users + booster_applications (UPDATED) |
| `on_booster_user_created` | `public.users` | AFTER INSERT | `handle_booster_application()` | Creates booster application (⚠️ now redundant) |
| `sync_role_on_user_change` | `public.users` | AFTER INSERT/UPDATE OF role | `sync_user_role_to_auth()` | Syncs role to auth.users metadata |
| `update_users_updated_at` | `public.users` | BEFORE UPDATE | `update_updated_at_column()` | Auto-updates updated_at timestamp |

---

## Row Level Security (RLS) Policies

### `public.users` Table

| Policy Name | Command | Qualifier (USING) | With Check |
|-------------|---------|-------------------|------------|
| **Users can insert own profile during signup** | INSERT | - | `auth.uid() = id` |
| **Users can update own profile** | UPDATE | `auth.uid() = id` | `auth.uid() = id` |
| **Users can view booster profiles** ⭐ | SELECT | `(auth.uid() = id) OR (role = 'booster' AND booster_approval_status = 'approved')` | - |
| **Admins can view all user profiles** | SELECT | `((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'` | - |

**⭐ UPDATED:** "Users can view booster profiles" now only shows **approved** boosters publicly.

---

### `public.booster_applications` Table

| Policy Name | Command | Qualifier (USING) | With Check |
|-------------|---------|-------------------|------------|
| **Users can create own booster application** | INSERT | - | `auth.uid() = user_id` |
| **Users can view own booster application** | SELECT | `auth.uid() = user_id` | - |
| **Users can update own booster application** | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |
| **Admins can view all booster applications** | ALL | `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')` | - |

---

### `public.orders` Table

| Policy Name | Command | Qualifier (USING) | With Check |
|-------------|---------|-------------------|------------|
| **Customers can create own orders** | INSERT | - | `auth.uid() = customer_id` |
| **Customers can view own orders** | SELECT | `auth.uid() = customer_id` | - |
| **Admins can view all orders** | ALL | `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')` | - |

---

### `public.jobs` Table ⭐ UPDATED

| Policy Name | Command | Qualifier (USING) | With Check |
|-------------|---------|-------------------|------------|
| **Approved boosters can view available jobs** ⭐ | SELECT | `(status = 'available' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'booster' AND booster_approval_status = 'approved')) OR (booster_id = auth.uid())` | - |
| **Boosters can update jobs** ⭐ | UPDATE | `(auth.uid() = booster_id) OR ((status = 'available') AND (booster_id IS NULL) AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'booster' AND booster_approval_status = 'approved'))` | `auth.uid() = booster_id` |
| **Customers can view jobs for their orders** | SELECT | `EXISTS (SELECT 1 FROM orders WHERE orders.id = jobs.order_id AND orders.customer_id = auth.uid())` | - |
| **Admins can manage all jobs** | ALL | `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')` | - |

**⭐ UPDATED:** Job policies now check `booster_approval_status = 'approved'` to prevent pending boosters from accessing jobs.

---

## API Routes

### 1. `/api/signup/customer` (POST)
**File:** `src/app/api/signup/customer/route.ts`

**Input:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "John Doe"
}
```

**Process:**
1. Validates required fields
2. Calls `supabase.auth.signUp()` with:
   ```js
   {
     email,
     password,
     options: {
       data: {
         full_name: username,
         role: 'customer'
       }
     }
   }
   ```
3. Trigger `on_auth_user_created` fires
4. Function `handle_new_user()` creates `public.users` record (role='customer')

**Output:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Result:** User has `auth.users` + `public.users` records, can log in immediately

---

### 2. `/api/signup/booster` (POST)
**File:** `src/app/api/signup/booster/route.ts`

**Input:**
```json
{
  "email": "booster@example.com",
  "password": "password123",
  "username": "Jane Booster",
  "questionnaire_responses": {
    "experience": "3-5 years",
    "games": ["League of Legends", "Valorant"],
    "availability": "20-30 hours",
    "motivation": "I love helping people...",
    "additional": "Top 500 in Valorant"
  }
}
```

**Process:**
1. Validates required fields
2. Calls `supabase.auth.signUp()` with:
   ```js
   {
     email,
     password,
     options: {
       data: {
         full_name: username,
         role: 'booster'
       }
     }
   }
   ```
3. Trigger `on_auth_user_created` fires
4. Function `handle_new_user()` creates:
   - `public.users` (role='booster', booster_approval_status='pending')
   - `booster_applications` (status='pending')
5. Updates `booster_applications` with questionnaire responses:
   ```js
   supabase
     .from('booster_applications')
     .update({ questionnaire_responses })
     .eq('user_id', authData.user.id)
   ```

**Output:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "booster@example.com"
  },
  "message": "Application submitted successfully! Your application is pending review."
}
```

**Result:** User has `auth.users` + `public.users` (pending) + `booster_applications` records ✓

---

### 3. `/api/user/me` (GET)
**File:** `src/app/api/user/me/route.ts`

**Purpose:** Fetch current user's profile data

**Process:**
1. Gets authenticated user from session: `supabase.auth.getUser()`
2. Queries `public.users` table:
   ```js
   supabase
     .from('users')
     .select('id, email, full_name, role, phone, created_at, total_earnings, booster_approval_status')
     .eq('id', user.id)
     .single()
   ```
3. Returns combined auth + profile data

**Output:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "userData": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "booster",
    "phone": null,
    "created_at": "2025-12-14T00:00:00Z",
    "total_earnings": 0,
    "booster_approval_status": "pending"
  }
}
```

**✓ FIXED:** Now works for booster applicants since they have a `public.users` record.

---

## Frontend Pages

### 1. `/login` (Login Page)
**File:** `src/app/login/page.tsx`

**Process:**
1. User enters email/password
2. Calls `supabase.auth.signInWithPassword()`
3. On success, redirects to `/`
4. On error, displays error message

**Code:**
```tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email: formData.email,
  password: formData.password,
});

if (data.user) {
  router.push('/');
}
```

---

### 2. `/signup/customer` (Customer Signup)
**File:** `src/app/signup/customer/page.tsx`

**Process:**
1. User fills form (email, password, username)
2. POSTs to `/api/signup/customer`
3. On success, redirects to `/login`

---

### 3. `/signup/booster` (Booster Application)
**File:** `src/app/signup/booster/page.tsx`

**Process:**
1. **Step 1:** User creates account (email, password, username)
2. **Step 2:** User fills questionnaire (5 questions)
3. POSTs to `/api/signup/booster` with all data
4. On success, redirects to `/login` with success message

**Questionnaire Fields:**
- `experience`: Dropdown (years of gaming experience)
- `games`: Checkboxes (proficient games)
- `availability`: Dropdown (weekly hours)
- `motivation`: Textarea (why become a booster)
- `additional`: Textarea (optional extra info)

---

### 4. `/admin` (Admin Panel) ⭐ UPDATED
**File:** `src/app/admin/page.tsx`

**Relevant Function:** `handleApplicationAction(applicationId, userId, action, rejectionReason?)`

**NEW Approve Process:**
1. Update `public.users.booster_approval_status = 'approved'`:
   ```js
   supabase.from('users').update({
     booster_approval_status: 'approved'
   }).eq('id', userId)
   ```
2. Update application status:
   ```js
   supabase.from('booster_applications').update({
     status: 'approved',
     reviewed_at: new Date().toISOString(),
     reviewed_by: userData?.id
   })
   ```

**NEW Reject Process:**
1. Update `public.users.booster_approval_status = 'rejected'`:
   ```js
   supabase.from('users').update({
     booster_approval_status: 'rejected'
   }).eq('id', userId)
   ```
2. Update application status:
   ```js
   supabase.from('booster_applications').update({
     status: 'rejected',
     reviewed_at: new Date().toISOString(),
     reviewed_by: userData?.id,
     rejection_reason: rejectionReason
   })
   ```

**⭐ KEY CHANGE:** No longer creates `public.users` on approval - just updates the status.

---

## Flow Diagrams

### Customer Signup Flow
```
User → /signup/customer → API Route
                              ↓
                    auth.signUp(role='customer')
                              ↓
                    auth.users INSERT
                              ↓
                    Trigger: on_auth_user_created
                              ↓
                    handle_new_user() function
                              ↓
                    public.users INSERT (role='customer')
                              ↓
                    Trigger: sync_role_on_user_change
                              ↓
                    auth.users.raw_app_meta_data updated
                              ↓
                    User can log in → Has public.users record ✓
```

---

### Booster Signup Flow ⭐ FIXED
```
User → /signup/booster → API Route
                              ↓
                    auth.signUp(role='booster')
                              ↓
                    auth.users INSERT
                              ↓
                    Trigger: on_auth_user_created
                              ↓
                    handle_new_user() function
                              ↓
        public.users INSERT (role='booster', status='pending')
                              ↓
        booster_applications INSERT (status='pending')
                              ↓
        Trigger: sync_role_on_user_change
                              ↓
        auth.users.raw_app_meta_data.role = 'booster'
                              ↓
        API updates questionnaire_responses
                              ↓
        User has BOTH auth.users AND public.users ✓
                              ↓
                User can log in ✓
                              ↓
            /api/user/me works ✓
                              ↓
        BUT cannot access jobs (status='pending') 🔒
```

---

### Booster Approval Flow ⭐ UPDATED
```
Admin → /admin → Booster Applications Tab
                              ↓
                    Click "Approve" button
                              ↓
            handleApplicationAction('approve')
                              ↓
    UPDATE public.users SET booster_approval_status = 'approved'
                              ↓
    booster_applications UPDATE (status='approved')
                              ↓
        Booster now has approved status ✓
                              ↓
            Can access jobs ✓
                              ↓
            Can access Booster Hub ✓
```

---

### Login Flow ⭐ FIXED
```
User → /login → Enter credentials
                        ↓
        supabase.auth.signInWithPassword()
                        ↓
            Checks auth.users table
                        ↓
        If credentials valid → Session created
                        ↓
            Redirect to / (homepage)
                        ↓
        App fetches /api/user/me
                        ↓
        ALL users have public.users → Success ✓
                        ↓
        Check booster_approval_status:
        - pending → Show "Application Pending" page 🔒
        - approved → Full access ✓
        - rejected → Show "Application Rejected" page ✗
```

---

## Recent Changes & Fixes

### ✅ Issue #1: FIXED - Booster Applicants Cannot Use Application After Signup
**Solution Implemented:** Option 2 - Create public.users with role='booster' and status='pending'

**Changes Made:**
1. ✅ Updated `handle_new_user()` function to create `public.users` for boosters immediately
2. ✅ Set `booster_approval_status = 'pending'` on creation
3. ✅ Updated admin panel to just update status (not create user)
4. ✅ Updated RLS policies to check `booster_approval_status = 'approved'`

**Result:**
- ✅ Booster applicants have `public.users` record immediately
- ✅ `/api/user/me` works for all users
- ✅ Can log in and navigate app
- ✅ Pending boosters cannot access jobs (gated by RLS)

---

### ⚠️ Issue #2: Redundant Booster Application Creation
**Status:** Known issue, not yet fixed

**Problem:** `on_booster_user_created` trigger creates duplicate application when admin approves.

**Recommendation:** Drop the trigger since `handle_new_user()` now handles it:
```sql
DROP TRIGGER IF EXISTS on_booster_user_created ON public.users;
```

---

### ✅ Issue #3: Foreign Key Constraint Updated
**Status:** Completed

**Change:**
```sql
ALTER TABLE booster_applications
DROP CONSTRAINT booster_applications_user_id_fkey;

ALTER TABLE booster_applications
ADD CONSTRAINT booster_applications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

**Result:** Applications can reference users before they're in `public.users` (though now unnecessary with the fix).

---

### ✅ Issue #4: RLS Policies Updated
**Status:** Completed

**Updated Policies:**
1. ✅ `jobs` - "Approved boosters can view available jobs" - now checks `booster_approval_status = 'approved'`
2. ✅ `jobs` - "Boosters can update jobs" - now checks approval status
3. ✅ `users` - "Users can view booster profiles" - now only shows approved boosters publicly

---

### 🚧 Issue #5: Frontend Needs "Application Pending" Page
**Status:** TODO

**Recommendation:** Create a middleware or layout component that checks:
```typescript
if (userData.role === 'booster' && userData.booster_approval_status === 'pending') {
  return <ApplicationPendingPage />;
}
```

---

## Summary

The authentication system now uses a **dual-table architecture with status gating**:
- `auth.users` handles login/sessions (always created)
- `public.users` handles profiles/roles (always created, but status varies)

**For Customers/Admins:**
- Both tables populated immediately ✓
- Full functionality ✓

**For Booster Applicants:**
- Both tables populated immediately ✓
- `public.users` created with `booster_approval_status='pending'` ✓
- Can log in and use app ✓
- Cannot access jobs until approved (RLS gating) 🔒
- Status updated on approval/rejection ✓

**Key Integration Points:**
1. `handle_new_user()` trigger creates records for all user types
2. `booster_approval_status` column gates access to booster features
3. RLS policies check `booster_approval_status = 'approved'` for job access
4. Admin panel updates status (not role) on approval/rejection

---

**End of Analysis**
