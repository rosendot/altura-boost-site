import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating is required and must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate delivery_status is required
    if (!delivery_status || !['complete', 'incomplete', 'poor_quality'].includes(delivery_status)) {
      return NextResponse.json(
        { error: 'Delivery status is required and must be complete, incomplete, or poor_quality' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Verify user is the customer for this job
    const order = Array.isArray(job.orders) ? job.orders[0] : job.orders;
    if (!order || order.customer_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only review your own jobs' },
        { status: 403 }
      );
    }

    // Verify job is completed
    if (job.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed jobs' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('job_reviews')
      .select('id')
      .eq('job_id', jobId)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this job' },
        { status: 400 }
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
        review_text: review_text || null,
        delivery_status,
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Error creating review:', reviewError);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error in POST /api/jobs/[jobId]/review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
