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
      await logAuthFailure(null, 'completed_jobs', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 100 requests per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'completed_jobs',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'completed_jobs', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch user's completed jobs with review information
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id,
        job_number,
        service_name,
        game_name,
        status,
        completed_at,
        booster_id,
        order_id,
        orders!inner (
          customer_id
        ),
        job_reviews (
          id,
          rating,
          quality_rating,
          communication_rating,
          timeliness_rating,
          review_text,
          delivery_status,
          created_at
        ),
        booster:users!jobs_booster_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('orders.customer_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (jobsError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to fetch completed jobs' },
        { status: 500 }
      );
    }

    // Format the response to include review status
    const formattedJobs = (jobs || []).map(job => ({
      id: job.id,
      job_number: job.job_number,
      service_name: job.service_name,
      game_name: job.game_name,
      status: job.status,
      completed_at: job.completed_at,
      booster_id: job.booster_id,
      booster: job.booster,
      has_review: job.job_reviews && job.job_reviews.length > 0,
      review: job.job_reviews && job.job_reviews.length > 0 ? job.job_reviews[0] : null,
    }));

    return NextResponse.json(
      { jobs: formattedJobs },
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
