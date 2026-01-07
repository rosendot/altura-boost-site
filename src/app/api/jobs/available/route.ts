import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'available_jobs', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 100 requests per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'available_jobs',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'available_jobs', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Check if user is suspended
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_suspended, suspension_reason')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    if (userData?.is_suspended) {
      await logAuthFailure(user.id, 'available_jobs', 'User is suspended', request);
      return NextResponse.json(
        {
          error: 'Account suspended',
          suspended: true,
          suspension_reason: userData.suspension_reason
        },
        { status: 403 }
      );
    }

    // Fetch available jobs (no booster assigned)
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'available')
      .is('booster_id', null)
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to fetch available jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { jobs: jobs || [] },
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
