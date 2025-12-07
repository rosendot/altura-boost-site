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

## Future Roadmap

### Phase 1: Core Functionality (In Progress)
- ⏳ Complete checkout flow with payment collection
- ⏳ Implement full Stripe payment processing
- ⏳ Connect authentication to Supabase backend
- ⏳ Build order management system

### Phase 2: Enhanced Features
- Real-time order tracking and progress updates
- User dashboards (customer orders, booster earnings)
- Notification system (email + Discord)
- Review and rating system

### Phase 3: Platform Expansion
- Admin panel for managing jobs, users, and payments
- Multiple game support (expand beyond Black Ops 7)
- Advanced booster matching algorithm
- Analytics and reporting tools

### Phase 4: Community & Growth
- Live chat support
- Referral program
- Booster leaderboards and achievements
- Mobile app development
