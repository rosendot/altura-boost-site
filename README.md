# Altura Boost

A modern gaming boost service platform that connects skilled boosters with customers who need professional gaming services. Built as a redesign of the client's Squarespace site with improved performance, SEO, and scalability.

## What It Is

Altura Boost is a two-sided marketplace where:
- **Customers** browse and purchase boosting services for games like Call of Duty Black Ops 7 (weapon camos, rank boosts, challenges, battle passes)
- **Boosters** apply to join the platform, accept jobs from the job board, and earn competitive pay for their gaming skills

The platform features secure payment processing via Stripe, automatic job updates via polling, and user authentication through Supabase.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Frontend:** React 18, TypeScript 5
- **Styling:** Tailwind CSS 3.4
- **Database:** Supabase 2.86
- **Updates:** Polling (30-second intervals)
- **Payments:** Stripe 20.0
- **Deployment:** Vercel-ready

## Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Environment Variables](#environment-variables)
- [Development](#development)
  - [Running Locally](#running-locally)
  - [Supabase Client Usage](#supabase-client-usage)
  - [Authentication Flow](#authentication-flow)
- [Authentication System](#authentication-system)
  - [Database Architecture](#database-architecture)
  - [Signup Flows](#signup-flows)
  - [Booster Approval Process](#booster-approval-process)
- [Job Updates](#job-updates)
  - [How It Works](#how-it-works)
  - [Race Condition Protection](#race-condition-protection)
- [Tiered Pricing & Job Batching](#tiered-pricing--job-batching)
  - [Flat Rate Pricing](#flat-rate-pricing)
  - [Job Batching](#job-batching)
  - [Pricing Utility](#pricing-utility)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage (hero, game carousel, trust badges)
│   ├── layout.tsx                  # Root layout (navbar + footer wrapper + CartProvider)
│   ├── login/                      # Authentication
│   ├── signup/
│   │   ├── customer/               # Customer registration
│   │   └── booster/                # Booster application with questionnaire
│   ├── games/
│   │   └── [gameId]/               # Dynamic game pages with services + Add to Cart
│   ├── hub/                        # Booster job dashboard with auto-refresh
│   ├── cart/                       # Shopping cart with full CRUD functionality
│   ├── admin/                      # Admin panel for managing applications
│   ├── account/                    # User account page with Earnings tab
│   ├── faq/                        # FAQ page
│   ├── work-with-us/               # Booster recruitment
│   ├── terms/                      # Terms of service
│   └── api/
│       ├── boosters/connect/       # Stripe Connect onboarding, status, disconnect
│       ├── admin/payouts/          # Admin payout initiation
│       ├── webhooks/stripe/        # Stripe webhooks
│       ├── jobs/                   # Job management endpoints
│       └── signup/                 # Registration endpoints
├── components/
│   ├── Navbar.tsx                  # Fixed nav with mega menu + live cart badge
│   ├── Footer.tsx                  # Site footer
│   └── GameCarousel.tsx            # Interactive game showcase
├── contexts/
│   └── CartContext.tsx             # Global cart state with localStorage persistence
├── lib/
│   ├── stripe.ts                   # Stripe config
│   ├── supabase/                   # Supabase config (client, server, middleware)
│   └── pricing/
│       └── calculateTieredPrice.ts # Tiered pricing calculations
├── utils/
│   └── timeAgo.ts                  # Time formatting utilities
└── server.js                       # Custom Node.js server
```

## Features

### Shopping Cart System
- ✅ Add to cart functionality on all service cards
- ✅ Live cart badge showing real-time item count
- ✅ Full cart page with item management (add, remove, update quantities)
- ✅ Cart persistence using localStorage (survives page refreshes)
- ✅ Automatic price calculations (subtotal, tax, total)
- ✅ Dynamic checkout button (enabled/disabled based on cart state)

### Navigation & UI
- ✅ Floating navigation bar with all required links
- ✅ Games dropdown menu
- ✅ Responsive cart icon with item badge
- ✅ Complete page structure (Home, Games, Cart, Login, FAQ, Terms, Work with Us)

### Authentication & User Management
- ✅ Login page with email/password form
- ✅ Customer signup with registration form
- ✅ Booster signup with 2-step application and questionnaire
- ✅ Admin panel for reviewing and approving booster applications
- ✅ Role-based access control (customer, booster, admin)

### Booster Hub Features
- ✅ Auto-refreshing job board (30-second polling)
- ✅ Atomic job acceptance with race condition protection
- ✅ Job filtering (game, payout range, hours, weapon class)
- ✅ Job sorting (newest, oldest, highest payout, quickest jobs)
- ✅ Job age indicator with "NEW" badge
- ✅ Auto-refresh status indicator

### Messaging System
- ✅ Direct messaging between customers and boosters
- ✅ Automatic conversation creation when job is accepted (via database trigger)
- ✅ Real-time message updates via polling (5-second intervals)
- ✅ Unread message count in account dropdown (30-second polling)
- ✅ Image attachment support (5MB limit, stored in Supabase Storage)
- ✅ System messages for job status updates
- ✅ Message read/unread tracking
- ✅ Two-sided archive system (customer and booster can archive independently)
- ✅ Dark theme matching overall site design

### Stripe Connect Integration
- ✅ Stripe Connect Express accounts for booster payouts
- ✅ Hosted onboarding flow for bank account connection
- ✅ Account verification status checking
- ✅ Bank account last 4 digits display
- ✅ Manual payout system (admin-triggered)
- ✅ Job acceptance blocked until bank account verified
- ✅ Hub access restricted for unverified boosters
- ✅ Disconnect/reconnect bank account functionality
- ✅ Transaction logging in database
- ✅ Race condition protection for payouts

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd altura-boost-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Database Setup

#### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning (~2 minutes)

#### 2. Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql`
3. Paste into the SQL Editor and click **Run**
4. This creates all tables, views, triggers, and RLS policies

#### 3. Add Database Comments (Optional but Recommended)
1. In the SQL Editor, copy the contents of `database/comments.sql`
2. Paste and click **Run**
3. This adds helpful documentation to all tables and columns

### Environment Variables

#### 1. Get Your Supabase Credentials
1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

#### 2. Create `.env.local` File
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

#### 3. Generate Encryption Key
Run this command to generate a secure encryption key for game credentials:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste it in `.env.local`:
```env
CREDENTIAL_ENCRYPTION_KEY=your-generated-key-here
```

#### 4. Stripe Configuration
For both customer payments and booster payouts:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Important:**
- Get your `STRIPE_SECRET_KEY` from Stripe Dashboard → Developers → API keys
- Use test mode keys (`sk_test_...`) for development
- `STRIPE_WEBHOOK_SECRET` is required for webhook signature verification
  - For local testing: Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and copy the webhook secret
  - For production: Create webhook endpoint in Stripe Dashboard and copy the signing secret
- `NEXT_PUBLIC_BASE_URL` is required for Stripe Checkout and Connect redirect URLs
- For production, change to your live domain (e.g., `https://alturaboost.com`)

## Development

### Running Locally

Start the development server:

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000)

### Supabase Client Usage

#### Client Components (Browser)
```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()

  // Example: Fetch games
  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('active', true)

    if (error) console.error(error)
    return data
  }
}
```

#### Server Components
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()

  // Example: Fetch services
  const { data: services } = await supabase
    .from('services')
    .select('*, games(*)')
    .eq('active', true)

  return <div>{/* render services */}</div>
}
```

#### API Routes
```ts
// app/api/example/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

### Authentication Flow

#### Sign Up
```tsx
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe',
      role: 'customer', // or 'booster'
    }
  }
})
```

#### Sign In
```tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})
```

#### Get Current User
```tsx
const { data: { user } } = await supabase.auth.getUser()
```

#### Sign Out
```tsx
const { error } = await supabase.auth.signOut()
```

## Authentication System

The platform uses a dual-table authentication architecture with role-based access control and approval workflows.

### Database Architecture

#### Two-Table System

**`auth.users` (Supabase Managed)**
- Handles login credentials and sessions
- Stores email, encrypted password, and metadata
- Created immediately on signup for all user types

**`public.users` (Application Data)**
- Extended user profile and role management
- Contains role (`customer`, `booster`, `admin`)
- For boosters: includes `booster_approval_status` (`pending`, `approved`, `rejected`)
- Connected via foreign key to `auth.users.id`

**`public.booster_applications`**
- Stores booster application questionnaire responses
- Tracks approval workflow (status, reviewed_by, reviewed_at)
- Used by admins to review applications

### Signup Flows

#### Customer Signup

```
1. User fills signup form (email, password, username)
2. POST to /api/signup/customer
3. supabase.auth.signUp() creates auth.users record
4. Database trigger (handle_new_user) creates public.users with role='customer'
5. User can log in immediately with full access
```

#### Booster Signup

```
1. User fills signup form + questionnaire (5 questions)
2. POST to /api/signup/booster
3. supabase.auth.signUp() creates auth.users record
4. Database trigger (handle_new_user) creates:
   - public.users with role='booster' and booster_approval_status='pending'
   - booster_applications with status='pending'
5. User can log in but cannot access jobs until approved (RLS gating)
```

**Questionnaire Fields:**
- Gaming experience (years)
- Proficient games (checkboxes)
- Weekly availability (hours)
- Motivation (why become a booster)
- Additional information (optional)

### Booster Approval Process

#### Admin Review

Admins can view pending applications in the admin panel and take action:

**Approve:**
1. Update `public.users.booster_approval_status = 'approved'`
2. Update `booster_applications.status = 'approved'`
3. Booster can now access job board and accept jobs

**Reject:**
1. Update `public.users.booster_approval_status = 'rejected'`
2. Update `booster_applications.status = 'rejected'`
3. Store rejection reason in `booster_applications.rejection_reason`
4. Booster sees rejection message when logging in

#### Access Control

**Pending Boosters:**
- ✅ Can log in and navigate app
- ✅ Can view account page
- ❌ Cannot access Booster Hub (RLS blocks job queries)
- ❌ Cannot accept jobs

**Approved Boosters:**
- ✅ Full access to Booster Hub
- ✅ Can view and accept available jobs
- ✅ Can receive payouts via Stripe Connect

#### Database Functions & Triggers

**`handle_new_user()` Trigger**
- Fires on `auth.users` INSERT
- Creates `public.users` record for all user types
- For boosters: creates both `public.users` and `booster_applications`

**`sync_user_role_to_auth()` Trigger**
- Fires on `public.users` role or approval status change
- Syncs role and `booster_approval_status` to `auth.users.raw_app_meta_data`
- Ensures JWT claims stay in sync for RLS policies

**Row Level Security (RLS)**
- Jobs table policies check `booster_approval_status = 'approved'`
- Only approved boosters can view/accept jobs
- Customers can view their own orders/jobs
- Admins have full access to all tables

## Job Updates

The booster hub uses a simple polling mechanism to keep job listings up-to-date. This approach is perfect for the initial launch with 5-10 concurrent users and can easily scale to hundreds of users.

### How It Works

#### Client-Side Polling

The booster hub automatically fetches available jobs every 30 seconds:

```typescript
// Polling for job updates every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchAvailableJobs();
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, []);
```

**Why 30 seconds?**
- Fast enough for a responsive user experience
- Low server load (10 users = 20 requests/minute)
- Simple to implement and debug
- No complex infrastructure needed

#### Initial Load

Jobs are fetched immediately when the page loads:

```typescript
useEffect(() => {
  fetchAvailableJobs();
}, []);
```

### Race Condition Protection

To prevent multiple boosters from accepting the same job, the API uses an atomic database update:

```typescript
// Atomically update job only if it's still available
const { data: updatedJob, error: updateError } = await supabase
  .from('jobs')
  .update({
    booster_id: user.id,
    status: 'accepted',
    accepted_at: new Date().toISOString(),
  })
  .eq('id', jobId)
  .eq('status', 'available')     // Only update if still available
  .is('booster_id', null)        // Only update if no booster assigned
  .select()
  .single();

if (updateError || !updatedJob) {
  // Job was already taken by another booster
  return NextResponse.json(
    { error: 'Job is no longer available' },
    { status: 400 }
  );
}
```

**How it works:**
1. The UPDATE only succeeds if the job is still available at the exact moment of update
2. If another booster accepted the job first, the update returns no rows
3. The second booster gets a clear error message
4. No double-booking possible, even with simultaneous clicks

### Scaling Strategy

The current polling approach works well for **up to 200+ concurrent users**. When you need to scale beyond that:

1. **Server-Sent Events (SSE)** - One-way server→client updates, Vercel-compatible
2. **Pusher/Ably** - Third-party real-time services with free tiers
3. **Supabase Realtime** - Built into Supabase, easy to add later

The atomic update protection will work with any of these approaches.

## Tiered Pricing & Job Batching

The platform supports tiered pricing for per-unit services (like weapon camos) with automatic job batching for large orders.

### Flat Rate Pricing

Tiered pricing uses **flat rate logic**: the total quantity determines which tier's rate applies to ALL units.

**Example: Shattered Gold Camo**
| Quantity | Price per Weapon |
|----------|-----------------|
| 1-5      | $9.00           |
| 6-10     | $8.00           |
| 11-20    | $7.00           |
| 21-29    | $6.50           |
| 30       | $6.00           |

**Calculation Examples:**
- 5 weapons → 5 × $9.00 = $45.00 (tier 1-5)
- 15 weapons → 15 × $7.00 = $105.00 (tier 11-20)
- 30 weapons → 30 × $6.00 = $180.00 (tier 30)

### Job Batching

Large orders are automatically split into batches (default: 10 weapons per batch):

```
Order: 25 weapons
  → Batch 1: 10 weapons (status: 'available')
  → Batch 2: 10 weapons (status: 'queued')
  → Batch 3: 5 weapons (status: 'queued')
```

**Sequential Release:**
1. Only the first batch is available for boosters to accept
2. When Batch 1 completes → Batch 2 becomes available
3. When Batch 2 completes → Batch 3 becomes available
4. When all batches complete → Order marked complete

This is handled automatically by a database trigger.

### Database Schema

**`service_pricing_tiers` table:**
```sql
CREATE TABLE service_pricing_tiers (
  id uuid PRIMARY KEY,
  service_id uuid REFERENCES services(id),
  min_quantity integer NOT NULL,
  max_quantity integer NOT NULL,
  price_per_unit numeric NOT NULL,
  booster_payout_per_unit numeric NOT NULL
);
```

**`services` table additions:**
- `pricing_type`: 'fixed' or 'tiered'
- `unit_name`: e.g., 'weapon' (for display)
- `max_quantity`: e.g., 30 (maximum orderable)
- `batch_size`: e.g., 10 (weapons per job)

**`jobs` table additions:**
- `batch_sequence`: 1, 2, 3... (order within batched jobs)
- `total_batches`: Total number of batches in order
- `unit_count`: Weapons in this specific batch
- `status`: Includes 'queued' state for unreleased batches

### Pricing Utility

Located at `src/lib/pricing/calculateTieredPrice.ts`:

```typescript
// Calculate price for a quantity
const result = calculateTieredPrice(30, tiers);
// → { totalPrice: 180, totalPayout: 120, breakdown: [...] }

// Get batches with payouts
const batches = calculateBatches(25, 10, tiers);
// → [
//   { batchNumber: 1, unitCount: 10, payout: 40 },
//   { batchNumber: 2, unitCount: 10, payout: 40 },
//   { batchNumber: 3, unitCount: 5, payout: 20 }
// ]
```

## Stripe Integration

The platform uses Stripe for both customer payments and booster payouts. This is a marketplace model where customers pay Altura Boost, and then Altura Boost pays boosters after job completion.

### Customer Payment Collection

Customers pay for services using Stripe Checkout, a hosted payment page that securely collects payment information.

#### 1. Shopping Cart Flow

1. Customer adds services to cart from game pages
2. Cart items stored in localStorage with proper service IDs
3. Customer clicks "Checkout" button
4. Frontend calls `/api/checkout/create-session` with cart items

#### 2. Checkout Session Creation

```typescript
POST /api/checkout/create-session
{
  "cartItems": [
    { "serviceId": "uuid", "quantity": 1 }
  ]
}
```

The API:
- Authenticates the user
- Fetches current service prices from database (prevents price manipulation)
- Creates or retrieves Stripe Customer ID
- Creates Stripe Checkout session with line items
- Returns checkout URL

#### 3. Payment Processing

1. Customer redirected to Stripe Checkout page
2. Customer enters payment details
3. Stripe processes payment
4. Customer redirected to success page
5. Stripe sends `checkout.session.completed` webhook to server

#### 4. Webhook Handler

The webhook (`/api/webhooks/stripe`) handles payment events:

- **checkout.session.completed**: Creates order and order_items in database
- **payment_intent.payment_failed**: Logs payment failure

The webhook:
- Verifies signature for security
- Retrieves session with line items
- Creates order record with payment details
- Creates order_items for each cart item
- Associates order with customer via `customer_id`

#### 5. API Routes

**Create Checkout Session**
```typescript
POST /api/checkout/create-session
// Requires authentication
// Returns: { url: string, sessionId: string }
```

**Webhook Handler**
```typescript
POST /api/webhooks/stripe
// Requires valid Stripe signature
// Handles: checkout.session.completed, payment_intent.payment_failed
```

### Stripe Connect Payouts

Stripe Connect Express accounts are used to pay boosters after job completion.

#### Money Flow

```
Customer pays $100 for boost
    ↓
Stripe charges customer → Platform receives $97 (after fees)
    ↓
Booster completes job
    ↓
Admin triggers payout: $80
    ↓
Stripe Transfer: $80 from platform → Booster's Connect account
    ↓
Database trigger: users.total_earnings += $80
    ↓
Booster's bank receives $80 (2-7 days)
    ↓
Platform keeps: $17 profit
```

### How It Works

#### 1. Booster Onboarding
When boosters want to receive payouts, they connect their bank account:

1. Booster clicks "Connect Bank Account" in the Earnings tab
2. Redirected to Stripe-hosted onboarding form
3. Stripe collects identity verification and bank details
4. Booster returns to Altura Boost after completion
5. Account enters verification (1-2 business days)

#### 2. Verification States

Boosters can be in one of three states:

- **Not Connected**: No bank account linked, cannot accept jobs
- **Verification in Progress**: Bank connected but not verified by Stripe
- **Verified**: Fully verified, can accept jobs and receive payouts

The hub page blocks access until the booster is verified.

#### 3. Manual Payouts

Admins trigger payouts manually from the admin panel:

```typescript
// Admin initiates payout for a completed job
POST /api/admin/payouts/initiate
{
  "jobId": "uuid-of-completed-job"
}
```

The API automatically:
- Verifies job is completed
- Checks booster has verified bank account
- Prevents duplicate payouts
- Creates Stripe transfer
- Logs transaction in database

#### 4. Money Flow

```
Customer → Altura Boost (Stripe account)
                ↓
        (Job completed)
                ↓
Altura Boost → Booster (via Stripe Transfer)
```

### API Routes

#### Connect Bank Account
```typescript
POST /api/boosters/connect/onboarding
// Returns Stripe onboarding URL
// Saves stripe_connect_id to database
```

#### Check Status
```typescript
GET /api/boosters/connect/status
// Returns: connected, verified, details_submitted, bank_last4
```

#### Disconnect
```typescript
POST /api/boosters/connect/disconnect
// Removes stripe_connect_id from database
```

#### Initiate Payout (Admin only)
```typescript
POST /api/admin/payouts/initiate
{
  "jobId": "uuid"
}
// Creates Stripe transfer and transaction record
```

### Database Schema

#### users table
- `stripe_connect_id`: Stripe Connect account ID for boosters (e.g., `acct_xxxxx`)
- `stripe_customer_id`: Stripe Customer ID for customers (e.g., `cus_xxxxx`)

#### orders table
- `customer_id`: Reference to users table
- `subtotal`: Order subtotal before tax
- `tax_amount`: Tax amount
- `total_price`: Total amount charged
- `status`: pending | paid | failed
- `stripe_payment_intent_id`: Stripe Payment Intent ID
- `paid_at`: Timestamp when payment succeeded
- `order_number`: Auto-generated order number (e.g., `ORD-20250103-001`)

#### order_items table
- `order_id`: Reference to orders table
- `service_name`: Name of service purchased
- `game_name`: Name of game
- `quantity`: Number of units
- `price_per_unit`: Price per unit
- `total_price`: Total price for this line item

#### transactions table
- `booster_id`: Who receives the payout
- `job_id`: Which job is being paid for
- `amount`: Payout amount in USD
- `status`: pending | completed | failed
- `stripe_payout_id`: Stripe transfer ID
- `completed_at`: When payout succeeded

### Security Features

✅ **No hardcoded credentials** - All secrets in environment variables
✅ **Admin-only payouts** - Role verification on payout endpoint
✅ **Duplicate prevention** - Checks for existing transactions
✅ **Atomic updates** - Race condition protection
✅ **Bank verification** - Blocks payouts to unverified accounts
✅ **Job completion check** - Only pays for completed jobs
✅ **Webhook signature verification** - All webhooks verified with Stripe signatures
✅ **Service role for webhooks** - Bypasses RLS for trusted server-to-server webhooks (industry standard)

### Complete User Flow

**For Boosters:**
1. Booster applies → Admin approves → `booster_approval_status = 'approved'`
2. Booster goes to Account → Earnings tab → Clicks "Connect Bank Account"
3. System creates Stripe Connect Express account → Stores `stripe_connect_id`
4. Redirected to Stripe onboarding (personal info, bank account, ID verification)
5. Stripe verifies information (instant in test mode, 1-2 days in production)
6. Redirected back → Shows "Verification in Progress" or "Bank Account Connected"
7. Once verified, booster can accept jobs from the hub
8. After completing job, admin triggers payout → Money sent via Stripe Transfer
9. Money arrives in booster's bank (2-7 business days)
10. Total earnings automatically updated via database trigger

**For Customers:**
1. Customer adds services to cart → Clicks "Checkout"
2. System creates Stripe Checkout session with line items from database
3. Customer redirected to Stripe Checkout page → Enters payment details
4. Stripe processes payment → Customer redirected to success page
5. Stripe sends webhook to `/api/webhooks/stripe`
6. Webhook creates order and order_items in database
7. Order number auto-generated via database trigger (e.g., ORD-20250103-001)
8. Admin creates job from order → Job appears in Booster Hub

### Testing in Development

Use Stripe test mode to test the full flow without real money:

**Customer Payments:**
1. Set `STRIPE_SECRET_KEY=sk_test_...` in `.env.local`
2. Run Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` in `.env.local`
4. Restart dev server
5. Add items to cart and checkout
6. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC
7. Complete payment
8. Check terminal for webhook logs
9. Verify order created in database

**Booster Payouts:**
1. Booster connects bank account (use Stripe test data)
2. Mark job as completed
3. Admin triggers payout
4. Check Stripe Dashboard → Connect → Accounts to see test transfer

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Vercel Deployment

The app is fully Vercel-ready with no special configuration needed:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

## Troubleshooting

### "Invalid API key" error
- Check that your `.env.local` has the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after changing `.env.local`

### RLS Policy errors
- Make sure you ran both `schema.sql` AND that RLS policies were created
- Check Supabase Dashboard → Authentication → Policies to see all policies

### Tables not found
- Verify you ran `schema.sql` successfully in the SQL Editor
- Check Supabase Dashboard → Table Editor to see all tables

### Jobs not updating in the hub
- Check browser console for API errors
- Verify the `/api/jobs/available` endpoint is working
- Check that polling interval is running (should refetch every 30 seconds)

### Build warnings about Edge Runtime
- Warnings about Supabase using Node.js APIs in Edge Runtime are normal
- These are from Supabase's own code in middleware
- Your build will still succeed and work correctly
- Safe to ignore

## Security Notes

- **NEVER** commit `.env.local` to Git (it's in `.gitignore`)
- **NEVER** share your `SUPABASE_SERVICE_ROLE_KEY` (it bypasses RLS)
- Use the `anon` key for client-side code
- Use the `service_role` key only in API routes/server-side for admin operations
- Job acceptance uses atomic updates to prevent race conditions
- All sensitive operations go through authenticated API routes

## Development Roadmap

### ✅ Phase 1: Frontend Features with Mock Data (Complete)
- Shopping cart system with add/remove/update functionality
- Cart persistence with localStorage
- Navigation and page structure
- Checkout button UI (ready for Stripe integration)

### ✅ Phase 2: Supabase Infrastructure (Complete)
- Database schema and tables
- Row Level Security (RLS) policies
- Authentication setup
- Database functions and triggers

### ✅ Phase 3: Connect Frontend to Supabase (Complete)
- Real-time data fetching
- Order management system
- API routes for server actions
- Error handling and loading states

### ✅ Phase 4: Authentication & User Infrastructure (Complete)
- Supabase Auth implementation
- User registration flows (customer and booster)
- Protected routes and role-based access
- Admin panel for booster applications

### ✅ Phase 5: Booster Dashboard Updates (Complete)
- Auto-refreshing job board with 30-second polling
- Atomic job acceptance with race condition protection
- Job board updates with latest available jobs
- Advanced filtering and sorting

### ✅ Phase 6: Messaging System (Complete)
- Direct messaging between customers and boosters
- Automatic conversation creation via database triggers
- Message polling for updates (5-second intervals)
- Unread message count tracking
- Image attachment support with Supabase Storage
- System messages for job events
- Archive functionality
- Dark theme UI

### ✅ Phase 7: Review & Moderation System (Complete)
- Customer review system with 5-star ratings and delivery status tracking
- Quality, communication, and timeliness sub-ratings
- Admin strike management system for poor performance
- Automatic suspension after 3 active strikes
- Booster suspension appeals workflow
- Admin appeals dashboard with approve/reject functionality
- Strike count visibility for boosters (0/3 display)
- Automatic strike deactivation when appeals are approved
- Database triggers for automatic strike count updates

### ✅ Phase 8: Stripe Connect Integration (Complete)
- Stripe Connect Express accounts for booster payouts
- Hosted onboarding flow with KYC/bank verification
- Account status checking (connected, verified, bank details)
- Manual payout system via admin panel
- Job acceptance blocking until bank verified
- Hub access restriction for unverified boosters
- Transaction logging with payout tracking
- Disconnect/reconnect bank account functionality
- Race condition protection for duplicate payouts
- Security audit (no hardcoded credentials)

### ✅ Phase 9: Customer Payment Collection (Complete)
- Stripe Checkout integration for cart checkout
- Stripe Customer creation and management
- Checkout session creation with line items
- Webhook handlers for payment events (checkout.session.completed, payment_intent.payment_failed)
- Order and order_items creation on successful payment
- Webhook signature verification for security
- Success page with order confirmation
- Shopping cart with localStorage persistence
- Service ID handling to prevent UUID errors
- Price validation from database (prevents client-side price manipulation)

### ✅ Phase 10: Tiered Pricing & Job Batching (Complete)
- Flat rate tiered pricing system for per-unit services (camos)
- Price tiers based on total quantity (e.g., 30 weapons × $6 = $180)
- Automatic job batching (splits orders into 10-weapon batches)
- Sequential job release (next batch available when previous completes)
- Database trigger for automatic job progression
- Pricing calculation utility with batch payout support
- Dynamic quantity selector on service pages
- Server-side price validation in checkout

### ✅ Phase 11: Refund Policy & Booster Contract (Complete)
- Comprehensive refund policy added to Terms of Service (Sections 12-19)
- Independent Contractor Agreement page for boosters (`/booster-agreement`)
- Contract signature tracking in database (timestamp, version, IP address)
- Contract enforcement: boosters must sign before viewing/accepting jobs
- Hub page shows contract required message with link to sign

### 📋 Phase 12: Production & Enhancement (Planned)
- Analytics and reporting dashboard
- Email notification system
- Performance optimization and caching
- Security audit and penetration testing
- Launch to production
