import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
      console.error('Error fetching reviews:', reviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Transform the response to rename 'users' to 'customer'
    const formattedReviews = (reviews || []).map(review => ({
      ...review,
      customer: Array.isArray(review.users) ? review.users[0] : review.users,
      users: undefined, // Remove the users field
    }));

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error) {
    console.error('Error in GET /api/reviews/my-reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
