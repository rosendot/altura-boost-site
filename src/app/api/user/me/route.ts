import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'user_profile', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 200 requests per hour (frequently accessed endpoint)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 200,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'user_profile',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'user_profile', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch user data from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, phone, created_at, total_earnings, booster_approval_status, is_suspended, suspended_at, suspension_reason, can_appeal, appeal_status, strike_count')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        {
          status: 500,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
        },
        userData,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('Unexpected error occurred');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
