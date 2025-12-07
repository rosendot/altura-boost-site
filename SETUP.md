# Altura Boost Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account
- A Stripe account (for later)

## Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning (~2 minutes)

### 2. Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql`
3. Paste into the SQL Editor and click **Run**
4. This creates all tables, views, triggers, and RLS policies

### 3. Add Database Comments (Optional but Recommended)
1. In the SQL Editor, copy the contents of `database/comments.sql`
2. Paste and click **Run**
3. This adds helpful documentation to all tables and columns

## Environment Variables Setup

### 1. Get Your Supabase Credentials
1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

### 2. Create `.env.local` File
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

### 3. Generate Encryption Key
Run this command to generate a secure encryption key for game credentials:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it in `.env.local`:
```env
GAME_CREDENTIALS_ENCRYPTION_KEY=your-generated-key-here
```

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## Supabase Client Usage

### Client Components (Browser)
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

### Server Components
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

### API Routes
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

## Authentication Flow

### Sign Up
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

### Sign In
```tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})
```

### Get Current User
```tsx
const { data: { user } } = await supabase.auth.getUser()
```

### Sign Out
```tsx
const { error } = await supabase.auth.signOut()
```

## Next Steps

1. **Phase 2**: Populate database with initial data (games, services)
2. **Phase 3**: Replace mock data with real Supabase queries
3. **Phase 4**: Implement authentication flows
4. **Phase 5**: Add real-time subscriptions
5. **Phase 6**: Integrate Stripe payments

## Testing Database Access

You can test if your connection works by running this in a server component:

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select('*')

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>Games</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

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

## Security Notes

- **NEVER** commit `.env.local` to Git (it's in `.gitignore`)
- **NEVER** share your `SUPABASE_SERVICE_ROLE_KEY` (it bypasses RLS)
- Use the `anon` key for client-side code
- Use the `service_role` key only in API routes/server-side for admin operations
