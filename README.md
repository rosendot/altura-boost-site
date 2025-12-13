# Altura Boost

A modern gaming boost service platform that connects skilled boosters with customers who need professional gaming services. Built as a redesign of the client's Squarespace site with improved performance, SEO, and scalability.

## What It Is

Altura Boost is a two-sided marketplace where:
- **Customers** browse and purchase boosting services for games like Call of Duty Black Ops 7 (weapon camos, rank boosts, challenges, battle passes)
- **Boosters** apply to join the platform, accept jobs from the job board, and earn competitive pay for their gaming skills

The platform features secure payment processing via Stripe, real-time updates via Socket.IO, and user authentication through Supabase.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Frontend:** React 18, TypeScript 5
- **Styling:** Tailwind CSS 3.4
- **Database:** Supabase 2.86
- **Real-time:** Socket.IO 4.8
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
- [Socket.IO Real-Time Updates](#socketio-real-time-updates)
  - [Architecture](#architecture)
  - [Events](#events)
  - [Client Usage](#client-usage)
  - [Emitting Events from API Routes](#emitting-events-from-api-routes)
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
│   ├── hub/                        # Booster job dashboard with real-time updates
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
├── hooks/
│   └── useSocket.ts                # Custom React hook for Socket.IO
├── lib/
│   ├── stripe.ts                   # Stripe config
│   ├── supabase/                   # Supabase config (client, server, middleware)
│   └── socket/
│       └── emit.ts                 # Helper functions to emit Socket.IO events
├── utils/
│   └── timeAgo.ts                  # Time formatting utilities
└── server.js                       # Custom Node.js server with Socket.IO
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

### Booster Hub & Real-Time Features
- ✅ Real-time job board with Socket.IO
- ✅ Live job updates when boosters accept jobs
- ✅ Active booster count indicator
- ✅ Job filtering (game, payout range, hours, weapon class)
- ✅ Job sorting (newest, oldest, highest payout, quickest jobs)
- ✅ Job age indicator with "NEW" badge
- ✅ Connection status indicator

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

#### 4. Add Production URL (for Socket.IO)
For production deployments, add:
```env
NEXT_PUBLIC_APP_URL=https://your-production-url.com
```

## Development

### Running Locally

Start the custom Node.js server with Socket.IO:

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

## Socket.IO Real-Time Updates

The booster hub uses Socket.IO for real-time updates, allowing boosters to see available jobs and jobs being taken by other boosters instantly without refreshing the page.

### Architecture

#### Server Setup

The Socket.IO server is initialized in `server.js` as a custom Next.js server. This allows us to maintain a persistent WebSocket connection alongside Next.js API routes.

**Key Files:**
- `server.js` - Custom server with Socket.IO integration
- `src/lib/socket/emit.ts` - Helper functions to emit events from API routes

**Why a custom server?** Next.js API routes are stateless and don't support persistent WebSocket connections. The custom server keeps Socket.IO connections alive.

#### Client Setup

The client connects to the Socket.IO server using a custom React hook.

**Key Files:**
- `src/hooks/useSocket.ts` - React hook for Socket.IO client connection
- `src/app/hub/page.tsx` - Booster hub page with real-time updates

### Events

#### Server → Client Events

1. **`job-accepted`**
   - Emitted when a booster accepts a job
   - Payload: `{ jobId: string, boosterId: string }`
   - Effect: Removes the job from all boosters' available job lists

2. **`new-job`**
   - Emitted when a new job is created
   - Payload: `Job` object
   - Effect: Adds the new job to all boosters' available job lists

3. **`job-update`**
   - Emitted when a job is updated
   - Payload: `Job` object
   - Effect: Updates the job in all boosters' available job lists

4. **`booster-count`**
   - Emitted when a booster joins or leaves
   - Payload: `number` (count of active boosters)
   - Effect: Updates the active booster count display

#### Client → Server Events

1. **`join-booster-hub`**
   - Emitted when a booster connects to join the hub room
   - Effect: Adds the socket to the 'booster-hub' room

### Client Usage

The booster hub page automatically connects to Socket.IO and listens for events:

```typescript
const {
  isConnected,
  activeBoostersCount,
  joinBoosterHub,
  onJobUpdate,
  onJobAccepted,
  onNewJob,
} = useSocket();

useEffect(() => {
  if (isConnected) {
    joinBoosterHub();

    onNewJob((job) => {
      // Add job to list
      setJobs(prev => [job, ...prev]);
    });

    onJobAccepted(({ jobId }) => {
      // Remove job from list
      setJobs(prev => prev.filter(j => j.id !== jobId));
    });
  }
}, [isConnected]);
```

### Emitting Events from API Routes

Use the helper functions in `src/lib/socket/emit.ts`:

```typescript
import { emitJobAccepted, emitNewJob, emitJobUpdate } from '@/lib/socket/emit';

// When a job is accepted
emitJobAccepted(jobId, boosterId);

// When a new job is created (e.g., from Stripe webhook)
emitNewJob(newJob);

// When a job is updated
emitJobUpdate(updatedJob);
```

#### Example: Emitting New Job Event from Stripe Webhook

```typescript
// In src/app/api/webhooks/stripe/route.ts
import { emitNewJob } from '@/lib/socket/emit';

// After creating jobs in the database
const { data: newJobs } = await supabase
  .from('jobs')
  .insert([...])
  .select();

// Emit event for each new job
newJobs?.forEach(job => {
  emitNewJob(job);
});
```

### Socket.IO Features

✅ Real-time job updates across all connected boosters
✅ Connection status indicator (green = connected, red = connecting)
✅ Active booster count display
✅ Automatic reconnection on disconnect
✅ Room-based broadcasting (only boosters in the hub receive updates)
✅ Clean event listener management (proper cleanup on unmount)

### Testing Socket.IO

1. Open the booster hub in two different browser windows/tabs
2. Accept a job in one window
3. The job should immediately disappear from the other window
4. Check the connection status indicator (top right of the page)
5. Observe the active booster count update as you open/close tabs

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Vercel Deployment

The app is Vercel-ready. However, note that Socket.IO requires a persistent server, so you may need to:
- Use Vercel's Node.js runtime (configure in `vercel.json`)
- Or deploy the Socket.IO server separately and configure `NEXT_PUBLIC_APP_URL`

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

### Socket.IO not connecting
- Ensure the dev server is running with `npm run dev` (not `next dev`)
- Check browser console for connection errors
- Verify `NEXT_PUBLIC_APP_URL` is set correctly in production

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
- The Socket.IO path is `/api/socket` (configured in both server and client)
- Events are broadcast to the `booster-hub` room only
- The connection uses WebSocket with polling fallback for compatibility

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

### ✅ Phase 5: Live Updates on Booster Dashboard (Complete)
- Socket.IO real-time subscriptions
- Live job board updates
- Real-time order status changes
- Active booster count tracking
- Advanced filtering and sorting

### 🚧 Phase 6: Stripe Integration & Payment Testing (In Progress)
- Set up Stripe Connect for booster payouts
- Implement Stripe Checkout for customer payments
- Build webhook handlers for payment events
- Create transaction logging and reconciliation
- Test payment flows (sandbox mode)

### 📋 Phase 7: Production & Enhancement (Planned)
- Analytics and reporting dashboard
- Email notification system
- Review and rating system
- Performance optimization and caching
- Security audit and penetration testing
- Launch to production
