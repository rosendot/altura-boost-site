# Altura Boost

A modern gaming boost service platform that connects skilled boosters with customers who need professional gaming services. Built as a redesign of the client's Squarespace site with improved performance, SEO, and scalability.

## What It Is

Altura Boost is a two-sided marketplace where:
- **Customers** browse and purchase boosting services for games like Call of Duty Black Ops 7 (weapon camos, rank boosts, challenges, battle passes)
- **Boosters** apply to join the platform, accept jobs from the job board, and earn competitive pay for their gaming skills

The platform features secure payment processing via Stripe and user authentication through Supabase.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Frontend:** React 18, TypeScript 5
- **Styling:** Tailwind CSS 3.4
- **Database:** Supabase 2.86
- **Payments:** Stripe 20.0
- **Deployment:** Vercel-ready

## Structure

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
│   ├── booster/
│   │   └── hub/                    # Booster job dashboard
│   ├── cart/                       # Shopping cart with full CRUD functionality
│   ├── faq/                        # FAQ page
│   ├── work-with-us/               # Booster recruitment
│   ├── terms/                      # Terms of service
│   └── api/webhooks/stripe/        # Stripe webhooks
├── components/
│   ├── Navbar.tsx                  # Fixed nav with mega menu + live cart badge
│   ├── Footer.tsx                  # Site footer
│   └── GameCarousel.tsx            # Interactive game showcase
├── contexts/
│   └── CartContext.tsx             # Global cart state with localStorage persistence
└── lib/
    ├── stripe.ts                   # Stripe config
    └── supabase.ts                 # Supabase config
```

## Features Implemented

### Shopping Cart System
- ✅ Add to cart functionality on all service cards
- ✅ Live cart badge showing real-time item count
- ✅ Full cart page with item management (add, remove, update quantities)
- ✅ Cart persistence using localStorage (survives page refreshes)
- ✅ Automatic price calculations (subtotal, tax, total)
- ✅ Dynamic checkout button (enabled/disabled based on cart state)

### Navigation & UI
- ✅ Floating navigation bar with all required links
- ✅ Games dropdown menu (currently Black Ops 7)
- ✅ Responsive cart icon with item badge
- ✅ Complete page structure (Home, Games, Cart, Login, FAQ, Terms, Work with Us)

### Authentication & Signup Pages
- ✅ Login page with email/password form
- ✅ Customer signup link on login page
- ✅ Booster signup link on login page
- ✅ Customer registration page at /signup/customer
- ✅ Booster application page with 2-step questionnaire at /signup/booster
- ✅ Booster Hub button in navbar


## Development Roadmap

### Phase 1: Frontend Features with Mock Data (In Progress)
- ✅ Shopping cart system with add/remove/update functionality
- ✅ Cart persistence with localStorage
- ✅ Navigation and page structure
- ✅ Checkout button UI (ready for Stripe integration)
- ✅ Customer dashboard mockup (order history, tracking)
- ✅ Booster dashboard mockup (job board, earnings)

### Phase 2: Supabase Infrastructure
- Create database schema and tables:
  - Users (customers and boosters)
  - Games and Services
  - Orders and Order Items
  - Booster Applications
  - Job Assignments
  - Transactions and Payments
- Set up Row Level Security (RLS) policies
- Configure authentication providers
- Create database functions and triggers

### Phase 3: Connect Frontend to Supabase
- Replace mock data with Supabase queries
- Implement real-time data fetching
- Connect cart to database (replace localStorage)
- Build order management system
- Set up API routes for server actions
- Implement proper error handling and loading states

### Phase 4: Authentication & User Infrastructure
- Implement Supabase Auth (email/password, OAuth)
- Build user registration flows (customer and booster)
- Create protected routes and role-based access
- Build user profile management
- Test account creation, login, and session management
- Implement password reset and email verification

### Phase 5: Live Updates on Booster Dashboard
- Set up Supabase real-time subscriptions
- Implement live job board updates
- Add real-time order status changes
- Create notification system for new jobs
- Build booster earnings tracker with live updates
- Add WebSocket connections for instant updates

### Phase 6: Stripe Integration & Payment Testing
- Set up Stripe Connect for booster payouts
- Implement Stripe Checkout for customer payments
- Build webhook handlers for payment events
- Create transaction logging and reconciliation
- Test payment flows (sandbox mode)
- Implement refund and dispute handling
- Set up automated booster payouts
- Add payment method management

### Phase 7: Production & Enhancement
- Admin panel for platform management
- Analytics and reporting dashboard
- Email notification system
- Review and rating system
- Mobile responsive optimization
- Performance optimization and caching
- Security audit and penetration testing
- Launch to production
