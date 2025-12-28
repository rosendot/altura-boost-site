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
- [Job Updates](#job-updates)
  - [How It Works](#how-it-works)
  - [Race Condition Protection](#race-condition-protection)
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
│   ├── faq/                        # FAQ page
│   ├── work-with-us/               # Booster recruitment
│   ├── terms/                      # Terms of service
│   └── api/
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
│   └── supabase/                   # Supabase config (client, server, middleware)
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
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it in `.env.local`:
```env
GAME_CREDENTIALS_ENCRYPTION_KEY=your-generated-key-here
```

#### 4. Stripe Configuration (Optional)
For payment processing, add your Stripe keys:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

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

### 🚧 Phase 7: Stripe Integration & Payment Testing (In Progress)
- Set up Stripe Connect for booster payouts
- Implement Stripe Checkout for customer payments
- Build webhook handlers for payment events
- Create transaction logging and reconciliation
- Test payment flows (sandbox mode)

### 📋 Phase 8: Production & Enhancement (Planned)
- Analytics and reporting dashboard
- Email notification system
- Review and rating system
- Performance optimization and caching
- Security audit and penetration testing
- Launch to production
