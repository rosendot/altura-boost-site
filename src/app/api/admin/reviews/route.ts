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
      await logAuthFailure(null, 'reviews_list', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      await logAuthFailure(user.id, 'reviews_list', 'User is not admin', request);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Rate limiting: 100 requests per admin per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000,
      identifier: 'reviews_list',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'reviews_list', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch all reviews with related data
    const { data: reviews, error: reviewsError } = await supabase
      .from('job_reviews')
      .select(`
        id,
        rating,
        quality_rating,
        communication_rating,
        timeliness_rating,
        review_text,
        delivery_status,
        is_flagged,
        requires_admin_review,
        created_at,
        job_id,
        jobs (
          job_number,
          service_name,
          game_name,
          completed_at
        ),
        customer:users!job_reviews_customer_id_fkey (
          id,
          full_name,
          email
        ),
        booster:users!job_reviews_booster_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { reviews: reviews || [] },
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
