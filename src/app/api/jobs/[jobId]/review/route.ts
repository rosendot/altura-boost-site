import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';
import { isValidUUID, sanitizeString, isValidLength, isInAllowedValues } from '@/lib/security/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'job_review_submit', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 20 requests per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'job_review_submit',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'job_review_submit', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Validate jobId UUID format
    if (!isValidUUID(jobId)) {
      await logAuthFailure(user.id, 'job_review_submit', 'Invalid job ID format', request);
      return NextResponse.json(
        { error: 'Invalid job ID' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      rating,
      quality_rating,
      communication_rating,
      timeliness_rating,
      review_text,
      delivery_status,
    } = body;

    // Validate rating is required
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      await logAuthFailure(user.id, 'job_review_submit', 'Invalid rating', request);
      return NextResponse.json(
        { error: 'Rating is required and must be between 1 and 5' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Validate optional ratings if provided
    const validateOptionalRating = (value: any, name: string) => {
      if (value !== null && value !== undefined) {
        if (typeof value !== 'number' || value < 1 || value > 5) {
          return false;
        }
      }
      return true;
    };

    if (!validateOptionalRating(quality_rating, 'quality_rating')) {
      await logAuthFailure(user.id, 'job_review_submit', 'Invalid quality rating', request);
      return NextResponse.json(
        { error: 'Quality rating must be between 1 and 5' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    if (!validateOptionalRating(communication_rating, 'communication_rating')) {
      await logAuthFailure(user.id, 'job_review_submit', 'Invalid communication rating', request);
      return NextResponse.json(
        { error: 'Communication rating must be between 1 and 5' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    if (!validateOptionalRating(timeliness_rating, 'timeliness_rating')) {
      await logAuthFailure(user.id, 'job_review_submit', 'Invalid timeliness rating', request);
      return NextResponse.json(
        { error: 'Timeliness rating must be between 1 and 5' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Validate delivery_status is required
    const allowedDeliveryStatuses = ['complete', 'incomplete', 'poor_quality'];
    if (!delivery_status || !isInAllowedValues(delivery_status, allowedDeliveryStatuses)) {
      await logAuthFailure(user.id, 'job_review_submit', 'Invalid delivery status', request);
      return NextResponse.json(
        { error: 'Delivery status is required and must be complete, incomplete, or poor_quality' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Validate and sanitize review_text if provided
    let sanitizedReviewText = null;
    if (review_text) {
      if (!isValidLength(review_text, 1, 2000)) {
        await logAuthFailure(user.id, 'job_review_submit', 'Invalid review text length', request);
        return NextResponse.json(
          { error: 'Review text must be between 1 and 2000 characters' },
          {
            status: 400,
            headers: getRateLimitHeaders(rateLimitResult),
          }
        );
      }
      sanitizedReviewText = sanitizeString(review_text.trim());
    }

    // Verify job exists and belongs to the customer
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        id,
        status,
        booster_id,
        order_id,
        orders (
          customer_id
        )
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('[JobReview] Job query failed');
      return NextResponse.json(
        { error: 'Job not found' },
        {
          status: 404,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Verify user is the customer for this job
    const order = Array.isArray(job.orders) ? job.orders[0] : job.orders;
    if (!order || order.customer_id !== user.id) {
      await logAuthFailure(user.id, 'job_review_submit', 'User is not job customer', request);
      return NextResponse.json(
        { error: 'Unauthorized - You can only review your own jobs' },
        {
          status: 403,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Verify job is completed
    if (job.status !== 'completed') {
      await logAuthFailure(user.id, 'job_review_submit', 'Job is not completed', request);
      return NextResponse.json(
        { error: 'Can only review completed jobs' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('job_reviews')
      .select('id')
      .eq('job_id', jobId)
      .single();

    if (existingReview) {
      await logAuthFailure(user.id, 'job_review_submit', 'Review already exists', request);
      return NextResponse.json(
        { error: 'You have already reviewed this job' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('job_reviews')
      .insert({
        job_id: jobId,
        order_id: job.order_id,
        customer_id: user.id,
        booster_id: job.booster_id,
        rating,
        quality_rating: quality_rating || null,
        communication_rating: communication_rating || null,
        timeliness_rating: timeliness_rating || null,
        review_text: sanitizedReviewText,
        delivery_status,
      })
      .select()
      .single();

    if (reviewError) {
      console.error('[JobReview] Insert failed');
      return NextResponse.json(
        { error: 'Failed to create review' },
        {
          status: 500,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    return NextResponse.json(
      { review },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('[JobReview] Error:', error?.type || 'unknown');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
