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
      await logAuthFailure(null, 'my_reviews', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 100 requests per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'my_reviews',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'my_reviews', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch reviews for this booster
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
        created_at,
        job_id,
        customer_id,
        jobs!job_reviews_job_id_fkey (
          job_number,
          service_name,
          game_name,
          completed_at
        ),
        users!job_reviews_customer_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('booster_id', user.id)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        {
          status: 500,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Transform the response to rename 'users' to 'customer'
    const formattedReviews = (reviews || []).map(review => ({
      ...review,
      customer: Array.isArray(review.users) ? review.users[0] : review.users,
      users: undefined, // Remove the users field
    }));

    return NextResponse.json(
      { reviews: formattedReviews },
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
